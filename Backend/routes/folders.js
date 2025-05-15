// routes/folders.js
const express = require('express');
const Folder = require('../models/folder');
const Post = require('../models/posts');
const router = express.Router();

// Get all folders
router.get('/folders', async (req, res) => {
    try {
        const folders = await Folder.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            folders
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get folder by ID
router.get('/folder/:id', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        
        res.status(200).json({
            success: true,
            folder
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create new folder
router.post('/folder/create', async (req, res) => {
    try {
        const newFolder = new Folder(req.body);
        await newFolder.save();
        
        res.status(200).json({ 
            success: true, 
            message: "Folder created successfully",
            folder: newFolder
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update folder
router.put('/folder/update/:id', async (req, res) => {
    try {
        const updatedFolder = await Folder.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true } // Return updated folder
        );
        
        if (!updatedFolder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Folder updated successfully",
            folder: updatedFolder
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.delete('/folder/delete/:id', async (req, res) => {
  const folderId = req.params.id;

  try {
    // Update documents in the folder to have no folderId (move to root)
    await Post.updateMany(
      { folderId: folderId },
      { $set: { folderId: null } }
    );

    const deletedFolder = await Folder.findByIdAndDelete(folderId);

    if (!deletedFolder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({
      success: true,
      message: "Folder deleted and documents moved to root",
      folder: deletedFolder
    });

  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({
      success: false,
      message: "Delete unsuccessful",
      error: err.message
    });
  }
});


// Move document to folder
router.put('/folder/:folderId/add-document/:documentId', async (req, res) => {
    try {
        const { folderId, documentId } = req.params;
        
        // Check if folder exists (except for root folder)
        if (folderId !== 'root') {
            const folder = await Folder.findById(folderId);
            if (!folder) {
                return res.status(404).json({ message: "Folder not found" });
            }
        }
        
        // Find document
        const document = await Post.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        // Update document's folderId
        document.folderId = folderId === 'root' ? null : folderId;
        await document.save();
        
        const updatedDocument = await Post.findById(documentId)
            .populate('folderId')
            .populate('tags');
            
        res.status(200).json({
            success: true,
            message: "Document moved to folder successfully",
            document: updatedDocument
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;