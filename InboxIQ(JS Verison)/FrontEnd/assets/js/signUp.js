window.onload = function() {
    google.accounts.id.initialize({
        client_id: '977843102981-1enineclv7ltldjjem8ij0a97snbgba8.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        use_fedcm_for_prompt: true
    });

    setupGoogleButton();
    setupMicrosoftButton();
};

function setupGoogleButton() {
    const googleButton = document.querySelector(".gsi-material-button");
    if (googleButton) {
        googleButton.addEventListener("click", function () {
            console.log("Google button clicked");

            // Trigger the Google Sign-In prompt (popup behavior)
            google.accounts.id.prompt((notification) => {
                // if (notification.isNotDisplayed()) {
                //     console.error('Google Sign-In popup could not be displayed.');
                //     showError('An error occurred during sign-up. Please try again.');
                // }
                // if (notification.isSkippedMoment()) {
                //     console.error('Google Sign-In was skipped by the user.');
                //     showError('Google Sign-In skipped.');
                // }
                // if (notification.isDismissedMoment()) {
                //     console.error('Google Sign-In popup dismissed by the user.');
                //     showError('Google Sign-In dismissed.');
                // }
            });
        });
    } else {
        console.error('Google Sign-In button not found.');
        showError('An error occurred during sign-up. Please try again.');
    }
}

function setupMicrosoftButton() {
    const microsoftButton = document.querySelector(".bsk-btn");
    if (microsoftButton) {
        microsoftButton.addEventListener("click", function() {
            console.log("Microsoft button clicked");
            // Implement Microsoft sign-in logic here
        });
    }
}
function showError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message; // Set the error message text
    errorMessageDiv.classList.remove('d-none'); // Show the error message
}

// Example usage


function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);



    // Send the ID token to your server for verification and user authentication
    fetch('/api/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: response.credential
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Handle the authenticated user's information
        // After successful authentication, redirect to another website or page
        const responsePayload = decodeJwtResponse(response.credential);
        console.log("ID: " + responsePayload.sub);
        console.log('Full Name: ' + responsePayload.name);
        console.log('Given Name: ' + responsePayload.given_name);
        console.log('Family Name: ' + responsePayload.family_name);
        console.log("Image URL: " + responsePayload.picture);
        console.log("Email: " + responsePayload.email);
        
        function decodeJwtResponse(token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        }
        window.location.href = "../../auth.html"; // Navigate up two levels
    })
    


    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('Failed to authenticate. Please try again.');
        showError('An error occurred during sign-up. Please try again.');
    });
}
