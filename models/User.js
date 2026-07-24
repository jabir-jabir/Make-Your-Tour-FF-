const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uid: { type: String, required: true }, // Free Fire Player ID
    wallet: { type: Number, default: 0 },
    role: { type: String, default: 'player' } // player or admin
});

module.exports = mongoose.model('User', userSchema);
