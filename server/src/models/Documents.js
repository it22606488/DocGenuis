const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    filename: String,
    filePath: String,
    version: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Documentt', DocumentSchema);
