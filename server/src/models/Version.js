const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
    filename: String,
    filePath: String,
    version: Number,
    content: String, // New attribute added
    originalDocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('version', VersionSchema);