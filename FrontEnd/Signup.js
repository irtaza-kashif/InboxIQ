window.onload = function () {
    google.accounts.id.initialize({
        client_id: '977843102981-qerstvj1s1ulik58usmfub6tb0pft2od.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById('GSign-In-btn'), 
        { theme: 'filled_black',text:"signup_with",shape:"pill", size: 'large'}
    );
        
        // Trigger Google Sign-In flow or other actions
        google.accounts.id.prompt();
    ;
};


// Function to handle the response after user signs in
function handleCredentialResponse(response) {
    const jwtToken = response.credential;

    // Decode the JWT token to extract user info (optional)
    const userInfo = parseJwt(jwtToken);
    console.log(userInfo);

    // Send the token to your backend for verification or further processing
    sendTokenToBackend(jwtToken);
}

// Function to decode JWT token (optional)
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Example function to send token to your backend
function sendTokenToBackend(token) {
    fetch('http://localhost:3000/login', {  // Make sure this matches your server's URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Provide feedback or update UI based on response
        document.getElementById('profile-screen').style.display = 'block';
        document.getElementById('user-name').textContent = data.userId;
    })
    .catch(error => {
        console.error('Error:', error);
        // Provide feedback to user on error
        alert('Login failed. Please try again.');
    });
}
