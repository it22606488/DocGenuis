const Document = require('../models/Document');
const UserActivity = require('../models/UserActivity');
const { trackUserActivity, enhanceSearchQuery } = require('../services/aiService');

// Search documents with AI enhancement
exports.searchDocuments = async (req, res) => {
  try {
    console.log('Search request received:', req.method);
    console.log('Query params:', req.query);
    console.log('Request body:', req.body);
    
    // Handle both GET and POST requests
    let searchQuery = '';
    let filters = {};
    
    if (req.method === 'GET') {
      // Extract from query parameters for GET requests
      searchQuery = req.query.q || '';
      
      console.log('Search query:', searchQuery);
      
      // Extract filters from query parameters
      if (req.query.category && req.query.category.trim() !== '') {
        filters.category = req.query.category;
        console.log('Category filter applied:', filters.category);
      }
      
      if (req.query.dateRange && req.query.dateRange.trim() !== '') {
        // Handle date range filters
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(req.query.dateRange) {
          case 'today':
            filters.dateRange = {
              start: today,
              end: now
            };
            console.log('Date filter - Today applied');
            break;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            filters.dateRange = {
              start: weekStart,
              end: now
            };
            console.log('Date filter - Week applied');
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            filters.dateRange = {
              start: monthStart,
              end: now
            };
            console.log('Date filter - Month applied');
            break;
          case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            filters.dateRange = {
              start: yearStart,
              end: now
            };
            console.log('Date filter - Year applied');
            break;
        }
      }
      
      // Handle sort options
      if (req.query.sortBy && req.query.sortBy.trim() !== '') {
        filters.sortBy = req.query.sortBy;
        console.log('Sort filter applied:', filters.sortBy);
      } else {
        filters.sortBy = 'relevance';
      }
      
    } else {
      // Extract from request body for POST requests
      const { query, filters: requestFilters } = req.body;
      searchQuery = query || '';
      filters = requestFilters || {};
    }
    
    const userId = req.user.id;
    
    console.log('Processed search request:', {
      query: searchQuery,
      filters,
      userId
    });
    
    // Skip AI enhancement for now to simplify debugging
    // const enhancedQuery = await enhanceSearchQuery(searchQuery, userId);
    const enhancedQuery = searchQuery;
    
    // Track search activity (can be commented out if causing issues)
    try {
      await trackUserActivity({
        userId,
        activityType: 'search',
        searchQuery: searchQuery,
        deviceInfo: req.headers['user-agent']
      });
    } catch (err) {
      console.error('Error tracking activity:', err);
      // Don't fail the whole request if tracking fails
    }
    
    // Build search conditions
    let searchConditions = {};
    
    // Only use text search if there's a query
    if (enhancedQuery && enhancedQuery.trim().length > 0) {
      // For text search, we use regex search on title, description and content
      // This is more forgiving than $text search for simple keywords
      const searchRegex = new RegExp(enhancedQuery.trim(), 'i');
      searchConditions.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
        { category: searchRegex }
      ];
    }
    
    // Apply filters
    if (filters.category && filters.category.trim() !== '') {
      // Use case-insensitive regex for category matching
      searchConditions.category = new RegExp('^' + filters.category.trim() + '$', 'i');
    }
    
    if (filters.tags && filters.tags.length > 0) {
      searchConditions.tags = { $in: filters.tags };
    }
    
    if (filters.dateRange) {
      searchConditions.createdAt = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }
    
    // Determine sort order
    let sortOptions = {};
    if (enhancedQuery && enhancedQuery.trim().length > 0 && filters.sortBy === 'relevance') {
      // No special sorting for relevance with regex search
      sortOptions = { createdAt: -1 };
    } else {
      // No search query - sort by date
      sortOptions = { createdAt: -1 };
    }
    
    // Apply user's sort preference
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      switch(filters.sortBy) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'title':
          sortOptions = { title: 1 };
          break;
        case 'size':
          sortOptions = { fileSize: -1 };
          break;
        case 'mostViewed':
          sortOptions = { viewCount: -1 };
          break;
        case 'mostDownloaded':
          sortOptions = { downloadCount: -1 };
          break;
      }
    }
    
    console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
    console.log('Sort options:', JSON.stringify(sortOptions, null, 2));
    
    // If no search conditions, return all documents (limited)
    if (Object.keys(searchConditions).length === 0) {
      console.log('No search conditions - returning recent documents');
      const documents = await Document.find()
        .sort({ createdAt: -1 })
        .limit(20);
      
      console.log(`Search returned ${documents.length} results`);
      return res.json(documents);
    }
    
    // Execute search
    console.log('Executing search with conditions:', JSON.stringify(searchConditions, null, 2));
    const documents = await Document.find(searchConditions)
      .sort(sortOptions)
      .limit(20);
    
    console.log(`Search returned ${documents.length} results`);
    if (documents.length > 0) {
      console.log('Sample result:', documents[0].title);
    }
    
    // Skip AI personalization for now to simplify debugging
    // const personalizedResults = await require('../services/aiService')
    //   .rankSearchResults(documents, userId, query);
    
    res.json(documents);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;
    
    // Get personalized search suggestions
    const suggestions = await require('../services/aiService')
      .getSearchSuggestions(query, userId);
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 