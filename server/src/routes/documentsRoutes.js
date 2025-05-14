const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Document = require("../models/Documents");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "../uploadss/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create Document
router.post("/", upload.single("file"), async (req, res) => {
  const doc = new Document({
    filename: req.file.originalname,
    filePath: req.file.path,
    version: 1,
  });
  await doc.save();
  res.status(201).send(doc);
});

// Read Documents
router.get("/", async (req, res) => {
  const documents = await Document.find();
  res.send(documents);
});

// Update Document
router.put("/:id", upload.single("file"), async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send({ message: "Document not found" });

  if (req.file) {
    fs.unlinkSync(doc.filePath);
    doc.filename = req.file.originalname;
    doc.filePath = req.file.path;
    doc.version += 1;
  }
  await doc.save();
  res.send(doc);
});

// Delete Document
router.delete("/:id", async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send({ message: "Document not found" });

  fs.unlinkSync(doc.filePath);
  await Document.findByIdAndDelete(req.params.id);
  res.send({ message: "Document deleted" });
});

module.exports = router;
