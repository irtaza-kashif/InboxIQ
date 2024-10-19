import { gisLoaded} from './google.js';
document.addEventListener('DOMContentLoaded', () => {
  tokenClient = gisLoaded();  // Ensure this is correctly initialized


});

let tokenClient;

function handleAuthClick() {
  tokenClient.callback = async (response) => {
    if (response.error !== undefined) {
      console.error("Error during authorization:", response);
      document.getElementById('error-message').classList.remove('d-none');
      return;
    }

    // Save the access token in localStorage for use in other JS files
    const token = gapi.client.getToken();
    if (token) {
      localStorage.setItem('gmailAccessToken', JSON.stringify(token));
      // Redirect or take appropriate action after login
      window.location.href = "../../index.html";
    } else {
      console.error("Failed to retrieve token.");
      document.getElementById('error-message').classList.remove('d-none');
    }
  };

  const token = gapi.client.getToken();
  if (token === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

window.handleAuthClick = handleAuthClick;


