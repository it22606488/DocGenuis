const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const documentRoutes = require('./routes/documents');
const folderRoutes = require('./routes/folders');
const tagRoutes = require('./routes/tags');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const DB_URL = 'mongodb+srv://shavindi:1234@merncrud.cosvbdx.mongodb.net/mernCrud?retryWrites=true&w=majority&appName=mernCrud';
mongoose.connect(DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Use routes
app.use('/api', documentRoutes);
app.use('/api', folderRoutes);
app.use('/api', tagRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Doc Genius API is running');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});