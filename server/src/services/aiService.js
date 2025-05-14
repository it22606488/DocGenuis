const UserActivity = require('../models/UserActivity');
const Document = require('../models/Document');

// Track user activity for personalization
exports.trackUserActivity = async (activityData) => {
  try {
    const activity = new UserActivity(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error tracking user activity:', error);
    throw error;
  }
};

// Get personalized document suggestions
exports.getPersonalizedSuggestions = async (userId) => {
  try {
    // Get user's recent activities
    const userActivities = await UserActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    if (userActivities.length === 0) {
      // No activity history, return popular documents
      return await Document.find()
        .sort({ viewCount: -1 })
        .limit(10);
    }
    
    // Extract viewed document IDs
    const viewedDocumentIds = userActivities
      .filter(activity => activity.activityType === 'view')
      .map(activity => activity.documentId);
    
    // Get unique document IDs
    const uniqueDocumentIds = [...new Set(viewedDocumentIds)];
    
    // Get documents with view counts
    const documents = await Document.find({ 
      _id: { $in: uniqueDocumentIds } 
    });
    
    // Calculate relevance scores
    const scoredDocuments = documents.map(doc => {
      // Count views for this document
      const viewCount = viewedDocumentIds.filter(id => 
        id.toString() === doc._id.toString()
      ).length;
      
      // Get last view time
      const lastActivity = userActivities.find(activity => 
        activity.documentId.toString() === doc._id.toString()
      );
      
      const daysSinceLastView = (Date.now() - lastActivity.timestamp) / (1000 * 60 * 60 * 24);
      
      // Calculate score (recency + frequency)
      const recencyScore = Math.exp(-daysSinceLastView / 30) * 0.6;
      const frequencyScore = Math.min(viewCount / 10, 1) * 0.4;
      const totalScore = recencyScore + frequencyScore;
      
      return {
        ...doc.toObject(),
        relevanceScore: totalScore
      };
    });
    
    // Sort by relevance score and return top documents
    return scoredDocuments
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting personalized suggestions:', error);
    throw error;
  }
};

// Enhance search query using AI
exports.enhanceSearchQuery = async (query, userId) => {
  try {
    // For simple implementation, just return the original query
    // In a real implementation, this would call the AI module
    return query;
  } catch (error) {
    console.error('Error enhancing search query:', error);
    return query; // Return original query if enhancement fails
  }
};

// Rank search results based on user preferences
exports.rankSearchResults = async (documents, userId, query) => {
  try {
    // Get user's recent activities
    const userActivities = await UserActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    if (userActivities.length === 0) {
      return documents; // No personalization without activity history
    }
    
    // Calculate personalized scores
    const scoredDocuments = documents.map(doc => {
      // Find activities related to this document
      const documentActivities = userActivities.filter(activity => 
        activity.documentId && activity.documentId.toString() === doc._id.toString()
      );
      
      // Calculate personalization score
      let personalizationScore = 0;
      
      if (documentActivities.length > 0) {
        // Calculate frequency score
        const viewCount = documentActivities.filter(a => a.activityType === 'view').length;
        const frequencyScore = Math.min(viewCount / 5, 1) * 0.4;
        
        // Calculate recency score
        const mostRecentActivity = documentActivities.sort((a, b) => 
          b.timestamp - a.timestamp
        )[0];
        
        const daysSinceLastInteraction = (Date.now() - mostRecentActivity.timestamp) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-daysSinceLastInteraction / 14) * 0.6;
        
        personalizationScore = frequencyScore + recencyScore;
      }
      
      // Combine with original relevance
      const combinedScore = (doc.score || 1) * (1 + personalizationScore);
      
      return {
        ...doc.toObject(),
        relevanceScore: combinedScore
      };
    });
    
    // Sort by combined score
    return scoredDocuments.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error ranking search results:', error);
    return documents; // Return original results if ranking fails
  }
};

// Get search suggestions based on user history
exports.getSearchSuggestions = async (partialQuery, userId) => {
  try {
    // Get user's search history
    const searchActivities = await UserActivity.find({
      userId,
      activityType: 'search'
    })
      .sort({ timestamp: -1 })
      .limit(20);
    
    // Extract and filter search queries
    const suggestions = searchActivities
      .map(activity => activity.searchQuery)
      .filter(query => query && query.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 5);
    
    return suggestions;
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}; 