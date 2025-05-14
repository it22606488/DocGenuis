// routes/tags.js
const express = require('express');
const Tag = require('../models/tag');
const Post = require('../models/posts');
const router = express.Router();

// Get all tags
router.get('/tags', async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            tags
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get tag by ID
router.get('/tag/:id', async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        
        if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        
        res.status(200).json({
            success: true,
            tag
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create new tag
router.post('/tag/create', async (req, res) => {
    try {
        // Check if tag with same name already exists
        const existingTag = await Tag.findOne({ name: req.body.name });
        if (existingTag) {
            return res.status(400).json({ message: "Tag with this name already exists" });
        }
        
        const newTag = new Tag(req.body);
        await newTag.save();
        
        res.status(200).json({ 
            success: true, 
            message: "Tag created successfully",
            tag: newTag
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update tag
router.put('/tag/update/:id', async (req, res) => {
    try {
        // Check if tag with same name already exists
        if (req.body.name) {
            const existingTag = await Tag.findOne({ 
                name: req.body.name,
                _id: { $ne: req.params.id }
            });
            
            if (existingTag) {
                return res.status(400).json({ message: "Tag with this name already exists" });
            }
        }
        
        const updatedTag = await Tag.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true } // Return updated tag
        );
        
        if (!updatedTag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Tag updated successfully",
            tag: updatedTag
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete tag
router.delete('/tag/delete/:id', async (req, res) => {
    try {
        const tagId = req.params.id;
        
        // Remove tag from all documents
        await Post.updateMany(
            { tags: tagId },
            { $pull: { tags: tagId } }
        );
        
        // Delete the tag
        const deletedTag = await Tag.findByIdAndRemove(tagId);
        
        if (!deletedTag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Tag deleted successfully and removed from all documents", 
            tag: deletedTag 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: "Delete unsuccessful", 
            error: err.message 
        });
    }
});

module.exports = router;