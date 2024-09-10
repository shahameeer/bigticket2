const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./User');

// Load environment variables
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_WEBSITE = 'WEBSTAGING'; // Use 'WEB' for production
const PAYTM_CALLBACK_URL = process.env.PAYTM_CALLBACK_URL;

// Function to generate checksum
const generateChecksum = (params) => {
    const orderedKeys = Object.keys(params).sort();
    const str = orderedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHash('sha256').update(str + PAYTM_MERCHANT_KEY).digest('hex');
};

// Route to initiate payment
router.post('/start', async (req, res) => {
    const { name, phoneNumber, numberOfTickets } = req.body;

    try {
        // Save user information to the database
        const newUser = new User({ name, phoneNumber, numberOfTickets });
        await newUser.save();

        // Generate checksum and redirect URL
        const params = {
            MID: PAYTM_MERCHANT_ID,
            WEBSITE: PAYTM_WEBSITE,
            CHANNEL_ID: 'WEB',
            INDUSTRY_TYPE_ID: 'Retail',
            ORDER_ID: `ORDER_${Date.now()}`,
            CUST_ID: phoneNumber,
            TXN_AMOUNT: (numberOfTickets * 100).toFixed(2), // Example amount
            CALLBACK_URL: PAYTM_CALLBACK_URL
        };

        params.CHECKSUMHASH = generateChecksum(params);

        const redirectUrl = `https://securegw-stage.paytm.in/theia/processTransaction?${new URLSearchParams(params).toString()}`;

        // Redirect user to the payment gateway
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error saving user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle payment callback
router.post('/callback', async (req, res) => {
    const { ORDERID, TXNID, STATUS, CHECKSUMHASH } = req.body;

    try {
        // Validate checksum
        const params = {
            ORDERID,
            TXNID,
            STATUS
        };

        const checksum = generateChecksum(params);

        if (checksum !== CHECKSUMHASH) {
            return res.status(400).json({ error: 'Checksum validation failed' });
        }

        // Save transaction details to the database or update user info
        // You may want to add more fields as needed
        await User.updateOne(
            { phoneNumber: req.body.CUST_ID },
            { $set: { orderId: ORDERID, txnId: TXNID, status: STATUS } }
        );

        res.json({ status: 'Transaction successful' });
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
