const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;
const User = require('./User');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection
mongoose.connect("mongodb+srv://shamomahmedshaza000:p2gfJXJBAQEjHe0V@test-pro-db.f1f31.mongodb.net/?retryWrites=true&w=majority&appName=test-pro-db")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.post('/api/users', async (req, res) => {
    try {
        const { name, phoneNumber, numberOfTickets } = req.body;
        const user = new User({ name, phoneNumber, numberOfTickets });
        await user.save();
        res.status(201).send('User saved successfully');
    } catch (error) {
        res.status(500).send('Error saving user:', error);
    }
});

// API routes
app.use('/api/payment', require('./payment'));

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
