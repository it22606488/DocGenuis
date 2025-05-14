const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Version = require("../models/Version");
const Document = require("../models/Documents");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "../uploadversions/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create new version of a document
router.post("/version/:id", upload.single("file"), async (req, res) => {
  try {
    // Find the original Document
    const originalDoc = await Document.findById(req.params.id);
    if (!originalDoc) {
      return res.status(404).send({ message: "Original document not found" });
    }

    // Determine the version number
    let versionNumber;
    const existingVersions = await Version.find({
      originalDocId: originalDoc._id,
    });
    if (existingVersions.length === 0) {
      // If no versions exist, set the version number to 1
      versionNumber = 1;
    } else {
      // Otherwise, increment the version number based on the latest version
      versionNumber = originalDoc.version + 1;
    }

    // Create a new Version document
    const newDoc = new Version({
      filename: req.file.originalname,
      filePath: req.file.path,
      version: versionNumber,
      originalDocId: originalDoc._id,
      content: req.body.content || "", // New content attribute
    });

    await newDoc.save();

    // Update the version number in the original document (if it's the first version)
    // if (versionNumber === 1) {
    //     originalDoc.version = 1;
    //     await originalDoc.save();
    // }

    res.status(201).send(newDoc);
  } catch (error) {
    res.status(500).send({ message: "Error creating new version", error });
  }
});
// Get all versions of a Version
router.get("/versions/:originalDocId", async (req, res) => {
  try {
    const versions = await Version.find({
      originalDocId: req.params.originalDocId,
    }).sort({ version: -1 });
    res.send(versions);
  } catch (error) {
    res.status(500).send({ message: "Error fetching Version versions", error });
  }
});

const path = require("path");

// Restore a specific version
router.put("/restore/:versionId", async (req, res) => {
  try {
    // Find the version to restore
    const versionToRestore = await Version.findById(req.params.versionId);
    if (!versionToRestore) {
      return res.status(404).send({ message: "Version not found" });
    }

    // Find the original document associated with the version
    const originalDoc = await Document.findById(versionToRestore.originalDocId);
    if (!originalDoc) {
      return res.status(404).json({ message: "Original document not found" });
    }

    // Resolve the full file path for the original document
    const fullFilePath = path.resolve(__dirname, "..", originalDoc.filePath);

    // Check if the file exists
    if (fs.existsSync(fullFilePath)) {
      // Delete the current file of the original document
      fs.unlinkSync(fullFilePath);
      console.log("Original document file deleted:", fullFilePath);
    } else {
      console.log("File not found at path:", fullFilePath);
    }

    // Update the original document with the restored version's details
    originalDoc.filename = versionToRestore.filename;
    originalDoc.filePath = versionToRestore.filePath;
    originalDoc.version = versionToRestore.version;
    // originalDoc.content = versionToRestore.content;  Update content as well

    // Save the restored document
    await originalDoc.save();

    res.status(200).send(originalDoc);
  } catch (error) {
    res.status(500).send({ message: "Error restoring version", error });
  }
});

// Delete a version
router.delete("/version/:id", async (req, res) => {
  try {
    // Find the version to delete
    const doc = await Version.findById(req.params.id);
    if (!doc) {
      return res.status(404).send({ message: "Version not found" });
    }

    // Construct the full file path
    const fullFilePath = path.resolve(__dirname, "..", doc.filePath);

    try {
      // Check if file exists before attempting to delete
      await fs.access(fullFilePath);

      // Delete the file
      await fs.unlink(fullFilePath);
      console.log("File deleted successfully:", fullFilePath);
    } catch (fileError) {
      // If file doesn't exist or can't be deleted, log the error but continue
      if (fileError.code === "ENOENT") {
        console.log("File not found:", fullFilePath);
      } else {
        console.error("Error deleting file:", fileError);
      }
    }

    // Delete the version from the database
    await Version.findByIdAndDelete(req.params.id);

    res.status(200).send({ message: "Version deleted successfully" });
  } catch (error) {
    console.error("Error in delete route:", error);
    res.status(500).send({
      message: "Error deleting version",
      error: error.message,
    });
  }
});

module.exports = router;
