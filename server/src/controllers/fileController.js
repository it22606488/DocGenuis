const File = require('../models/File');
const path = require('path');
const fs = require('fs').promises;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = new File({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: path.extname(req.file.originalname),
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        name: file.originalName,
        type: file.fileType,
        size: file.fileSize,
        uploadDate: file.uploadDate
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ 
      uploadedBy: req.user._id,
      isDeleted: false 
    })
    .sort({ uploadDate: -1 });

    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update last accessed time
    file.lastAccessed = new Date();
    await file.save();

    res.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update download count and last accessed time
    file.downloadCount += 1;
    file.lastAccessed = new Date();
    await file.save();

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Soft delete - just mark as deleted
    file.isDeleted = true;
    await file.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
}; 