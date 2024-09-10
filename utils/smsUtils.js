const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendSms = (phoneNumber, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: phoneNumber,
        subject: 'Ticket Purchase Confirmation',
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending SMS:', error);
        } else {
            console.log('SMS sent:', info.response);
        }
    });
};

module.exports = { sendSms };
