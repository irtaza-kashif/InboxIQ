require('dotenv').config();  // Add this line at the top
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;  // Get CLIENT_ID from environment variable

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userId = payload['sub'];
    console.log('User ID:', userId);
    console.log('User Payload:', payload);

    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}

module.exports = verify;

