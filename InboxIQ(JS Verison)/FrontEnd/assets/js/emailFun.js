// Initialize Gmail API Client// TODO(developer): Set to client ID and API key from the Developer Console
//Uses the following functions to initialize
import { gisLoaded, initializeGapiClient, loadGapi} from './google.js';
document.addEventListener('DOMContentLoaded', () => {
    gisLoaded();
    loadGapi()
    initializeGapiClient();
  });

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
            await populateLabels(); // Call populateLabels after setting token
            await console.log(getEmailsSnips(5))
        } else {
            console.error("No access token found. Please sign in first.");
            return;
        }
    } catch (error) {
        console.error("Error initializing Gmail API client:", error);
    }
}

window.onload = initializeGmailClient();

// Function to list Gmail labels
async function listLabels() {
    let labels = []; 
    try {
        const response = await gapi.client.gmail.users.labels.list({'userId': 'me'});
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

async function populateEmails() {
    let data = await getEmailsSnipp(50);
    if (!data || data.length === 0) return; 
    
    let list = document.getElementById("emailList");
    let fragment = document.createDocumentFragment(); 
    
    for (let i = 0; i < data.length; ++i) {
        let li = document.createElement('li');
        li.innerText = data[i].name; 
        fragment.appendChild(li); 
    }
    
    list.appendChild(fragment);
}





// Request access token

function getEmailsSnips(count, query) {
    try {
        // Retrieve the raw email message IDs based on the count and query
        const messages = retrieveRawEmailsContents(count, query);
        
        // Create an array to hold the snippets
        const snips = [];

        // Check if messages is an array and has message IDs
        if (Array.isArray(messages) && messages.length > 0) {
            // Use Promise.all to fetch snippets for each message ID
            const snippetsPromises = messages.map(async (message) => {
                const response = await gapi.client.gmail.users.messages.get({
                    userId: 'me',
                    id: message.id // Make sure 'id' is a valid property in your messages
                });
                return response.result.snippet; // Extract and return the snippet
            });
            
            // Wait for all snippet promises to resolve
            snips.push(...Promise.all(snippetsPromises));
        }

        return snips; // Return the array of snippets
    } catch (error) {
        console.error("Error fetching email snippets:", error);
        return []; // Return an empty array in case of error
    }
}


function retrieveRawEmailsContents(num, query ) {
    try{
        const results = gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults: num,
        q: query
    });
    const unreadEmails = results.result.messages;
    const ids = getEmailsIDs(unreadEmails);
    return retrieveEmailContents(ids);
}
catch(error){
    console.error("Error fetching Gmail messages:", error);
    return;
}



    
}


function getEmailsIDs(unreadEmails){
    return unreadEmails.map(email => email.id);
}

function retrieveEmailContents(ids) {
    var messages = []
    ids.forEach(element => {
        messages.push(gapi.client.gmail.users.messages.get({ userId: 'me', id: element }))
    });
    console.log(typeof messages)
    console.log(messages[1])
    return messages;
}



