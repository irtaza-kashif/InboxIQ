// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '977843102981-1enineclv7ltldjjem8ij0a97snbgba8.apps.googleusercontent.com'; // Replace with a secure method to handle this
const API_KEY = 'AIzaSyCQQmqo1pXGKsDymDpBnTpc1qdpKkRuQN0'; // Replace with a secure method to handle this

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let tokenClient;
let isGapiInitialized = false;
let isGisInitialized = false;

/**
 * Wrap gapi.load in a Promise.
 */
export function loadGapi() {
    return new Promise((resolve) => {
        gapi.load('client', () => {
            resolve(); // Resolve the promise when gapi.load is complete
        });
    });
}

/**
 * Initializes the GAPI client.
 */
export async function initializeGapiClient() {
    await loadGapi(); // Wait for gapi.load to complete
    console.log("GAPI loaded");

    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC], // Ensure this includes Gmail API
        });
        isGapiInitialized = true;
        console.log("GAPI client initialized");
    } catch (error) {
        console.error("Error initializing GAPI client:", error);
    }
}

/**
 * Callback after Google Identity Services are loaded.
 */
export function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // This will be defined later in handleAuthClick
    });
    isGisInitialized = true;
    return tokenClient;
}
