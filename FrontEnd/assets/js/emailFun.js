// Initialize Gmail API Client
// TODO(developer): Set to client ID and API key from the Developer Console
// Uses the following functions to initialize
import { gisLoaded, initializeGapiClient, loadGapi } from './google.js';

document.addEventListener('DOMContentLoaded', () => {
    gisLoaded();
    loadGapi();
    initializeGapiClient();
});

// Initialize Gmail API Client
async function initializeGmailClient() {
    await initializeGapiClient();
    try {
        if (typeof gapi === 'undefined') {
            console.error('gapi not loaded.');
            return;
        }

        if (!gapi.client.gmail) {
            await gapi.client.load('gmail', 'v1');
        }

        const storedToken = localStorage.getItem('gmailAccessToken');
        if (storedToken) {
            const token = JSON.parse(storedToken);
            console.log(JSON.stringify(token));
            gapi.client.setToken(token);
            await populateLabels();  // Call populateLabels after setting token
            const emails = await retrieveRawEmailsContents(5);  // Await the promise here
            console.log(typeof emails);
            console.log(emails);
            const emailSnips = await getEmailsSnips(5)
            console.log(emailSnips);
            await populateEmails();
        } else {
            console.error("No access token found. Please sign in first.");
            return;
        }
    } catch (error) {
        console.error("Error initializing Gmail API client:", error);
    }
}

window.onload = initializeGmailClient;

// Function to list Gmail labels
async function listLabels() {
    let labels = []; 
    try {
        const response = await gapi.client.gmail.users.labels.list({ 'userId': 'me' });
        labels = response.result.labels;
        if (!labels || labels.length === 0) {
            console.log('No labels found.');
        } else {
            console.log('Labels:', labels.map(label => label.name).join(', '));
        }
    } catch (error) {
        console.error('Error fetching labels:', error);
    }
    return labels;
}

// Populate the label list in the DOM
async function populateLabels() {
    let data = await listLabels();
    if (!data || data.length === 0) return;

    let list = document.getElementById("labelList");
    let fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; ++i) {
        let li = document.createElement('li');
        li.innerText = data[i].name;
        fragment.appendChild(li);
    }

    list.appendChild(fragment);
}

// Function to populate emails
async function populateEmails() {
    let data = await getEmailsSnips(10);
    if (!data || data.length === 0) return;

    let list = document.getElementById("emailList");
    let fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; ++i) {
        let li = document.createElement('li');
        li.innerText = data[i];  // Corrected to access the snippet from the array
        fragment.appendChild(li);
    }

    list.appendChild(fragment);
}

// Retrieve email snippets
async function getEmailsSnips(num, query) {
    try {
        // Fetch the full message objects using the fetchFullMessages function
        const messages = await retrieveRawEmailsContents(num, query);

        // Extract the snippets from each message
        const snippets = messages.map(message => message.result.snippet);

        return snippets; // Return the array of snippets
    } catch (error) {
        console.error("Error extracting snippets:", error);
        return []; // Return an empty array in case of error
    }
}

// Retrieve raw email contents
async function retrieveRawEmailsContents(num, query) {
    try {
        // Await the API request
        const results = await gapi.client.gmail.users.messages.list({
            userId: 'me',
            maxResults: num,
            q: query
        });
        const unreadEmails = results.result.messages;
        const ids = getEmailsIDs(unreadEmails);

        return await retrieveEmailContents(ids);  // Await the retrieval of the email content
    } catch (error) {
        console.error("Error fetching Gmail messages:", error);
        return [];
    }
}

// Extract email IDs from the messages
function getEmailsIDs(unreadEmails) {
    return unreadEmails.map(email => email.id);
}

// Retrieve content of each email by ID
async function retrieveEmailContents(ids) {
    const messages = await Promise.all(
        ids.map(id => gapi.client.gmail.users.messages.get({ userId: 'me', id: id }))
    );
    return messages;
}
