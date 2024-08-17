// IMPORTS
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Gathering credentials and tokens, authorizing email and API access
async function authenticate() {
    let creds = null;
    const TOKEN_PATH = 'token.json';
    const CREDENTIALS_PATH = 'credentials.json';

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        creds = google.auth.fromJSON(JSON.parse(token));
    } else {
        const { client_secret, client_id, redirect_uris } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.readonly'],
        });

        console.log('Authorize this app by visiting this url:', authUrl);
        const code = await new Promise((resolve) => {
            const rl = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                resolve(code);
            });
        });

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        creds = oAuth2Client;

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    }

    global.service = google.gmail({ version: 'v1', auth: creds });
}

// Gathers all new emails not yet checked by InboxIQ and returns them in a list of objects where each object contains the unparsed data of one email
async function retrieveUncheckedEmailContents() {
    const results = await service.users.messages.list({
        userId: 'me',
        maxResults: 500,
        q: 'has:nouserlabels'
    });
    const unreadEmails = results.data.messages || [];
    const ids = retrieveEmailIds(unreadEmails);
    return retrieveEmailContents(ids);
}

// Given a list of email IDs, will return un-parsed message data for all of them in a list of objects
async function retrieveEmailContents(ids) {
    const messages = await Promise.all(ids.map(id => 
        service.users.messages.get({ userId: 'me', id: id })
    ));
    return messages.map(message => message.data);
}

// Given a list of objects containing email IDs and other data, will return a list of just the email IDs
function retrieveEmailIds(unreadEmails) {
    return unreadEmails.map(email => email.id);
}

// Parses email data and stores each email in its own object with key-value pairs for the sender, receiver, subject line, message body, etc.
// Returns an object containing key-value pairs of emailID:object of email data for the corresponding email
function parseEmailData(emails) {
    const parsedEmailData = {};

    emails.forEach(email => {
        const tempEmailDict = {};
        const emailPayload = email.payload;
        const dictKeys = emailPayload.headers;

        dictKeys.forEach(key => {
            if (key.name === 'From') {
                tempEmailDict.msgSender = key.value || 'No Sender Specified';
            } else if (key.name === 'To') {
                tempEmailDict.msgReceiver = key.value || 'No Receiver Specified';
            } else if (key.name === 'Subject') {
                tempEmailDict.msgSubject = key.value || 'No Subject Specified';
                if (tempEmailDict.msgSubject === '') {
                    tempEmailDict.msgSubject = 'No Subject Specified';
                }
            } else if (key.name === 'Date') {
                tempEmailDict.msgDate = key.value || 'No Date Specified';
            }
        });

        tempEmailDict.msgBody = 'No Email Body';

        if (emailPayload.parts && emailPayload.parts[1] && !emailPayload.parts[1].body.attachmentId) {
            if (emailPayload.parts[0].body.data) {
                tempEmailDict.msgBody = Buffer.from(emailPayload.parts[0].body.data, 'base64').toString('utf-8').replace(/\r|\n/g, '');
            }
        } else if (emailPayload.parts && emailPayload.parts[0].parts && emailPayload.parts[0].parts[0].body.data) {
            tempEmailDict.msgBody = Buffer.from(emailPayload.parts[0].parts[0].body.data, 'base64').toString('utf-8').replace(/\r|\n/g, '');
        }

        if (tempEmailDict.msgBody === '') {
            tempEmailDict.msgBody = 'No Email Body';
        }

        parsedEmailData[email.id] = tempEmailDict;
    });

    return parsedEmailData;
}

// HOW TO ACCESS ATTACHMENTS: emails[0].payload.parts[1].body.attachmentId

authenticate();

