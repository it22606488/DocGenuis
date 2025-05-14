const Document = require('../models/Document');
const UserActivity = require('../models/UserActivity');
const { trackUserActivity, enhanceSearchQuery } = require('../services/aiService');

// Search documents with AI enhancement
exports.searchDocuments = async (req, res) => {
  try {
    // Handle both GET and POST requests
    let searchQuery = '';
    let filters = {};
    
    if (req.method === 'GET') {
      // Extract from query parameters for GET requests
      searchQuery = req.query.q || '';
      
      // Extract filters from query parameters
      if (req.query.category) filters.category = req.query.category;
      
      if (req.query.dateRange) {
        // Handle date range filters
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(req.query.dateRange) {
          case 'today':
            filters.dateRange = {
              start: today,
              end: now
            };
            break;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            filters.dateRange = {
              start: weekStart,
              end: now
            };
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            filters.dateRange = {
              start: monthStart,
              end: now
            };
            break;
          case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            filters.dateRange = {
              start: yearStart,
              end: now
            };
            break;
        }
      }
      
      // Handle sort options
      const sortBy = req.query.sortBy || 'relevance';
      filters.sortBy = sortBy;
      
    } else {
      // Extract from request body for POST requests
      const { query, filters: requestFilters } = req.body;
      searchQuery = query || '';
      filters = requestFilters || {};
    }
    
    const userId = req.user.id;
    
    console.log('Search request:', {
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
      searchConditions.$text = { $search: enhancedQuery };
    }
    
    // Apply filters
    if (filters.category) {
      searchConditions.category = filters.category;
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
    if (enhancedQuery && enhancedQuery.trim().length > 0) {
      // Text search relevance
      sortOptions = { score: { $meta: 'textScore' } };
    } else {
      // No search query - sort by date
      sortOptions = { createdAt: -1 };
    }
    
    // Apply user's sort preference
    if (filters.sortBy) {
      switch(filters.sortBy) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'mostViewed':
          sortOptions = { viewCount: -1 };
          break;
        case 'mostDownloaded':
          sortOptions = { downloadCount: -1 };
          break;
        // relevance is the default using text score
      }
    }
    
    console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
    console.log('Sort options:', sortOptions);
    
    // Execute search
    const documents = await Document.find(searchConditions)
      .sort(sortOptions)
      .limit(20);
    
    console.log(`Search returned ${documents.length} results`);
    
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