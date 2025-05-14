const express = require('express');
const Post = require('../models/posts');
const posts = require('../models/posts');


const router = express.Router();

//save posts

router.post('/post/save',async(req,res)=>{

    try {
        const newPost = new Post(req.body);
        await newPost.save();  // ✅ No callback
        res.status(200).json({ success: "Post saved successfully" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }

});

//get post

router.get('/posts',async(req,res)=>{
    try {
        const posts = await Post.find();
        res.status(200).json({
          success: true,
          existingPosts: posts
        });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
});

//update post
router.put('/post/update/:id',async(req,res)=>{
    try {
        await Post.findByIdAndUpdate(req.params.id, { $set: req.body });
        res.status(200).json({ success: "Updated successfully" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
});

//delete post
router.delete('/post/delete/:id',async(req,res) =>{
    try {
        const deletedPost = await Post.findByIdAndRemove(req.params.id);
        if (!deletedPost) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.json({ message: "Deleted successfully", deletedPost });
      } catch (err) {
        res.status(400).json({ message: "Delete unsuccessful", error: err.message });
      }

});

module.exports = router;