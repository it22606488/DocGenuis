const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    default: 'uncategorized'
  },
  tags: {
    type: [String],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  aiMetadata: {
    categories: [String],
    keywords: [String],
    relevanceScore: Number
  }
}, {
  timestamps: true
});

// Create text index for search
documentSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text',
  tags: 'text',
  category: 'text'
});

module.exports = mongoose.model('Document', documentSchema); 