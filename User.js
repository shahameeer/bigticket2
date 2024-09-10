const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    numberOfTickets: Number


});

const User = mongoose.model('User', userSchema);

module.exports = User;



