const Document = require('../models/Document');
const UserActivity = require('../models/UserActivity');
const { trackUserActivity } = require('../services/aiService');
const path = require('path');
const fs = require('fs');
const aiService = require('../services/aiService');
const nlpService = require('../services/nlpService');

// Get all documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single document
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Track user activity
    await trackUserActivity({
      userId: req.user.id,
      documentId: document._id,
      activityType: 'view',
      deviceInfo: req.headers['user-agent']
    });
    
    // Update view count
    document.viewCount += 1;
    document.lastAccessed = Date.now();
    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a document with file upload
exports.createDocument = async (req, res) => {
  try {
    console.log("Upload request received:", req.body);
    console.log("File data:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const { title, description, category, tags } = req.body;
    
    // Create document data
    const documentData = {
      title: title || 'Untitled Document',
      description: description || '',
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      category: category || 'uncategorized',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user.id,
      viewCount: 0,
      downloadCount: 0,
      lastAccessed: Date.now()
    };
    
    // Extract content if text file for AI processing
    if (['txt', 'csv', 'md'].includes(documentData.fileType)) {
      try {
        const content = fs.readFileSync(req.file.path, 'utf-8');
        documentData.content = content;
      } catch (err) {
        console.error('Error reading file content:', err);
      }
    }
    
    // Create and save document
    const document = new Document(documentData);
    const savedDocument = await document.save();
    
    console.log("Document saved successfully:", savedDocument._id);
    
    // Process with AI if content is available
    if (documentData.content) {
      try {
        // Classify document - skipping AI part for now to fix upload
        // const classification = await aiService.classifyDocument(savedDocument);
        // Extract keywords
        // const keywords = await aiService.extractKeywords(savedDocument);
        
        // Update document with AI metadata
        savedDocument.aiMetadata = {
          categories: ["uncategorized"],
          keywords: [],
          relevanceScore: 0
        };
        
        await savedDocument.save();
      } catch (err) {
        console.error('Error processing document with AI:', err);
      }
    }
    
    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ 
      message: 'Error uploading document', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    console.log('Update document request for ID:', req.params.id);
    console.log('Update requested by user:', req.user.id, 'with role:', req.user.role);
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is document owner or an admin
    const isOwner = document.uploadedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    
    
    // Only allow update if user is owner or admin
    if (!isOwner && !isAdmin) {
      console.log('Update permission denied - user is not owner or admin');
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Track edit activity
    await trackUserActivity({
      userId: req.user.id,
      documentId: document._id,
      activityType: 'edit',
      deviceInfo: req.headers['user-agent']
    });
    
    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    console.log('Delete document request for ID:', req.params.id);
    console.log('Delete requested by user:', req.user.id, 'with role:', req.user.role);
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is document owner or an admin
    const isOwner = document.uploadedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    
    // Only allow deletion if user is owner or admin
    if (!isOwner && !isAdmin) {
      console.log('Delete permission denied - user is not owner or admin');
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete file from filesystem if exists
    if (document.fileUrl) {
      const filePath = path.join(__dirname, '../../', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Document.findByIdAndDelete(req.params.id);
    console.log('Document deleted successfully');
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download a document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Track download activity
    await trackUserActivity({
      userId: req.user.id,
      documentId: document._id,
      activityType: 'download',
      deviceInfo: req.headers['user-agent']
    });
    
    // Update download count
    document.downloadCount += 1;
    await document.save();
    
    // Get file path
    const filePath = path.join(__dirname, '../../', document.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Send file
    res.download(filePath, `${document.title}.${document.fileType}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personalized document suggestions
exports.getDocumentSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's recent activities (last 5 viewed documents)
    const recentActivities = await UserActivity.find({ 
      userId,
      activityType: 'view' 
    })
    .sort({ timestamp: -1 })
    .limit(5);

    // Get all documents except user's own documents
    const allDocuments = await Document.find({
      uploadedBy: { $ne: userId }
    });

    // If no documents available, return empty array
    if (!allDocuments.length) {
      return res.json([]);
    }

    let recommendations = [];

    // If user has recent activity, use it for recommendations
    if (recentActivities.length > 0) {
      // Get the most recently viewed document
      const recentDocIds = recentActivities.map(activity => activity.documentId);
      const recentDocs = await Document.find({ _id: { $in: recentDocIds } });

      if (recentDocs.length > 0) {
        // Use the most recent document as target for recommendations
        const targetDoc = recentDocs[0];
        
        // Get recommendations based on the target document
        recommendations = await nlpService.getContentBasedRecommendations(
          targetDoc,
          allDocuments.filter(doc => 
            !recentDocIds.includes(doc._id.toString()) // Exclude recently viewed docs
          )
        );
      }
    }

    // If no recommendations from recent activity, try category-based
    if (!recommendations.length) {
      // Get user's preferred categories from their viewing history
      const userViewedDocs = await Document.find({
        _id: { 
          $in: await UserActivity.distinct('documentId', { 
            userId,
            activityType: 'view'
          })
        }
      });

      const preferredCategories = [...new Set(userViewedDocs.map(doc => doc.category))];

      // Get documents from preferred categories
      const categoryDocs = allDocuments.filter(doc => 
        preferredCategories.includes(doc.category)
      );

      if (categoryDocs.length > 0) {
        // Sort by view count and recency
        recommendations = categoryDocs
          .sort((a, b) => {
            // 70% weight to view count, 30% to recency
            const viewScore = (b.viewCount || 0) - (a.viewCount || 0);
            const recencyScore = new Date(b.createdAt) - new Date(a.createdAt);
            return (viewScore * 0.7) + (recencyScore * 0.3);
          })
          .slice(0, 5);
      } else {
        // If no category matches, return popular documents
        recommendations = allDocuments
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5);
      }
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting document suggestions:', error);
    res.status(500).json({ message: 'Error getting document suggestions' });
  }
};

// Get all available document categories
exports.getCategories = async (req, res) => {
  try {
    // Standard categories that should always be available
    const standardCategories = [
      'Accounting',
      'Administration',
      'Customer Service',
      'Engineering',
      'Finance',
      'Human Resources',
      'Information Technology',
      'Legal',
      'Marketing',
      'Operations',
      'Product Management',
      'Research & Development',
      'Sales',
      'Technical Documentation',
      'Uncategorized'
    ];
    
    // Find all distinct category values from documents (already unique via distinct)
    let categoriesFromDocuments = await Document.distinct('category');
    
    // Get AI suggested categories from aiMetadata 
    let aiCategories = await Document.distinct('aiMetadata.categories');
    
    // Flatten the array of arrays (aiMetadata.categories is an array for each document)
    let flattenedAiCategories = [];
    aiCategories.forEach(categoryArray => {
      if (Array.isArray(categoryArray)) {
        flattenedAiCategories = [...flattenedAiCategories, ...categoryArray];
      }
    });
    
    // Combine all categories and remove duplicates
    let allCategories = [...standardCategories, ...categoriesFromDocuments, ...flattenedAiCategories];
    let uniqueCategories = [...new Set(allCategories)].filter(Boolean); // Remove empty or null values
    
    console.log('Unique categories found:', uniqueCategories);
    
    // Sort categories alphabetically for better user experience
    uniqueCategories.sort();
    
    // Return the list of categories
    res.json(uniqueCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get documents by user ID
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await Document.find({ uploadedBy: userId })
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ message: 'Error fetching your documents' });
  }
}; 