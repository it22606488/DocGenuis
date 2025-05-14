const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

// Search documents - support both POST and GET
router.post('/', auth, searchController.searchDocuments);
router.get('/', auth, searchController.searchDocuments);

// Get search suggestions
router.get('/suggestions', auth, searchController.getSearchSuggestions);

module.exports = router; 