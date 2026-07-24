const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    title: String,
    entryFee: Number,
    prize: Number,
    time: String,
    map: String,
    version: String, // Solo, Duo, Squad
    roomID: { type: String, default: 'Will be given before match' },
    roomPass: { type: String, default: 'Wait...' },
    joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Match', matchSchema);
