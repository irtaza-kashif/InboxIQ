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