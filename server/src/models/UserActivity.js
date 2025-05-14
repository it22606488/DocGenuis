const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  activityType: {
    type: String,
    enum: ['view', 'download', 'search', 'edit'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // Time spent on document in seconds
    default: 0
  },
  searchQuery: {
    type: String // For search activities
  },
  deviceInfo: {
    type: String
  },
  ipAddress: {
    type: String
  }
});

// Indexes for faster queries
userActivitySchema.index({ userId: 1, documentId: 1 });
userActivitySchema.index({ userId: 1, activityType: 1 });
userActivitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema); 