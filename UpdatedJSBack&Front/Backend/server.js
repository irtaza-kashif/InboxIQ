// server.js
require('dotenv').config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const app = express();
const verify = require('./verification'); // Import the verification function
app.use(express.json());
app.use(cors()); // Enable CORS

app.post('/login', async (req, res) => {
    const token = req.body.token;
    try {
        // Use the verify function to handle token verification
        const payload = await verify(token);
        const userId = payload['sub'];
        
        // Here you would typically check if the user exists in your database,
        // create a new user if they don't, and then send an appropriate response.
        // For now, we're just returning the user ID.
        res.status(200).json({ userId });
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
