const express = require('express');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const path = require('path'); // Make sure to require the 'path' module

const app = express();
const client = new OAuth2Client('977843102981-1enineclv7ltldjjem8ij0a97snbgba8.apps.googleusercontent.com');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-orgin-when-cross-orign'); // Set your preferred policy here
    next();
});






// Authentication route
app.post('/api/authenticate', async (req, res) => {
    const token = req.body.token;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '977843102981-1enineclv7ltldjjem8ij0a97snbgba8.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        res.status(200).json({ user: payload });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).send('Token verification failed');
    }
});


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
