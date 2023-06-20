const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello, World!');
});

router.post('/users', (req, res) => {
    // Handle user creation logic
});

// Define more routes as needed

module.exports = router;
