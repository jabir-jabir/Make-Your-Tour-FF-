const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    title: String,
    entryFee: Number,
    prize: Number,
    perKill: { type: Number, default: 0 },
    time: String,
    date: String,
    map: String,
    version: String, // Solo/Duo/Squad
    totalSlots: { type: Number, default: 48 },
    joinedPlayers: [{ 
        username: String, 
        uid: String,
        teamType: String // Solo or Duo
    }],
    roomID: { type: String, default: 'Locked' },
    roomPass: { type: String, default: 'Locked' },
    status: { type: String, default: 'Open' } // Open/Full/Started/Finished
});

module.exports = mongoose.model('Match', matchSchema);
