const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const Document = require('../models/Document');

console.log('Document routes initialized');

// Routes order matters - specific routes before generic ones
// Add a stats endpoint for the dashboard - this must come before the /:id route
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Stats request from user:', req.user.id);
    
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Count documents uploaded by this user
    const documentCount = await Document.countDocuments({ uploadedBy: userId });
    console.log('Document count for user:', documentCount);

    // Get view and download stats
    const userDocuments = await Document.find({ uploadedBy: userId });
    let viewCount = 0;
    let downloadCount = 0;

    userDocuments.forEach(doc => {
      viewCount += doc.viewCount || 0;
      downloadCount += doc.downloadCount || 0;
    });

    // Return the stats
    res.json({
      totalDocuments: documentCount,
      totalViews: viewCount,
      downloads: downloadCount,
      recentActivity: documentCount + viewCount + downloadCount
    });
  } catch (error) {
    console.error('Error getting document stats:', error);
    res.status(500).json({ message: 'Error getting document statistics' });
  }
});

// Get document suggestions - this needs to be before /:id route to avoid conflicts
router.get('/suggestions/personalized', auth, documentController.getDocumentSuggestions);

// Get document categories for search dropdown
router.get('/categories', auth, documentController.getCategories);

// Get documents for logged in user
router.get('/user-documents', auth, documentController.getUserDocuments);

// Public routes
router.get('/', documentController.getDocuments);
router.get('/:id', auth, documentController.getDocument);

// File upload route
router.post('/', auth, upload.single('file'), (req, res, next) => {
  console.log('File upload middleware passed');
  if (req.file) {
    console.log('File uploaded:', req.file.filename);
  } else {
    console.log('No file in request');
  }
  next();
}, documentController.createDocument);

// Other protected routes
router.put('/:id', auth, documentController.updateDocument);
router.delete('/:id', auth, documentController.deleteDocument);
router.get('/:id/download', auth, documentController.downloadDocument);

console.log('Document routes ready, file upload configured');

module.exports = router; 