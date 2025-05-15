// routes/posts.js
const express = require('express');
const Post = require('../models/posts');
const router = express.Router();

// Get all documents
router.get('/documents', async (req, res) => {
    try {
        const documents = await Post.find()
            .populate('folderId')
            .populate('tags')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            documents
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get documents by folder
router.get('/documents/folder/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;
        let query = {};
        
        if (folderId === 'root') {
            // Documents without folder
            query = { folderId: null };
        } else {
            query = { folderId };
        }
        
        const documents = await Post.find(query)
            .populate('tags')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            documents
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get documents by tag
router.get('/documents/tag/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const documents = await Post.find({ tags: tagId })
            .populate('folderId')
            .populate('tags')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            documents
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create new document
router.post('/document/save', async (req, res) => {
    try {
        const newDocument = new Post(req.body);
        await newDocument.save();
        
        const savedDoc = await Post.findById(newDocument._id)
            .populate('folderId')
            .populate('tags');
            
        res.status(200).json({ 
            success: true, 
            message: "Document saved successfully",
            document: savedDoc
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get document by ID
router.get('/document/:id', async (req, res) => {
    try {
        const document = await Post.findById(req.params.id)
            .populate('folderId')
            .populate('tags');
            
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        res.status(200).json({
            success: true,
            document
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update document
router.put('/document/update/:id', async (req, res) => {
    try {
        const updatedDocument = await Post.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true } // Return updated document
        ).populate('folderId').populate('tags');
        
        if (!updatedDocument) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Updated successfully",
            document: updatedDocument
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete document
router.delete('/document/delete/:id', async (req, res) => {
    try {
        const deletedDocument = await Post.findByIdAndDelete(req.params.id);
        
        if (!deletedDocument) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Deleted successfully", 
            document: deletedDocument 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: "Delete unsuccessful", 
            error: err.message 
        });
    }
});

// Add tag to document
router.post('/document/:id/tag/:tagId', async (req, res) => {
    try {
        const { id, tagId } = req.params;
        
        const document = await Post.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        // Check if tag already exists in document
        if (document.tags.includes(tagId)) {
            return res.status(400).json({ message: "Tag already added to this document" });
        }
        
        document.tags.push(tagId);
        await document.save();
        
        const updatedDocument = await Post.findById(id)
            .populate('folderId')
            .populate('tags');
            
        res.status(200).json({
            success: true,
            message: "Tag added to document",
            document: updatedDocument
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove tag from document
router.delete('/document/:id/tag/:tagId', async (req, res) => {
    try {
        const { id, tagId } = req.params;
        
        const document = await Post.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        document.tags = document.tags.filter(tag => tag.toString() !== tagId);
        await document.save();
        
        const updatedDocument = await Post.findById(id)
            .populate('folderId')
            .populate('tags');
            
        res.status(200).json({
            success: true,
            message: "Tag removed from document",
            document: updatedDocument
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;