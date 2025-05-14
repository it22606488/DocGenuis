const { NlpManager } = require('node-nlp');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const manager = new NlpManager({ languages: ['en'] });

// Initialize TF-IDF instance
const tfidf = new TfIdf();

// Text preprocessing
const preprocessText = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
};

// Get document vector from text
const getDocumentVector = (text) => {
  const processedText = preprocessText(text);
  const tokens = tokenizer.tokenize(processedText);
  return tokens.filter(token => token.length > 2); // Filter out very short tokens
};

// Calculate similarity between two documents
const calculateSimilarity = (doc1Vector, doc2Vector) => {
  try {
    const tfidf = new TfIdf();
    
    // Add documents to TF-IDF
    tfidf.addDocument(doc1Vector);
    tfidf.addDocument(doc2Vector);
    
    // Get all unique terms
    const terms = new Set([...doc1Vector, ...doc2Vector]);
    
    // Calculate vectors
    let vector1 = [];
    let vector2 = [];
    
    terms.forEach(term => {
      vector1.push(tfidf.tfidf(term, 0));
      vector2.push(tfidf.tfidf(term, 1));
    });
    
    // Calculate cosine similarity
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      mag1 += vector1[i] * vector1[i];
      mag2 += vector2[i] * vector2[i];
    }
    
    const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
};

// Document content analysis
exports.analyzeDocument = async (content) => {
  try {
    // Preprocess text
    const processedText = preprocessText(content);
    
    // Tokenization
    const tokens = tokenizer.tokenize(processedText);
    
    // Remove stopwords
    const stopwords = natural.stopwords;
    const filteredTokens = tokens.filter(token => !stopwords.includes(token));
    
    // Extract entities and keywords
    const analysis = await manager.process(processedText);
    
    return {
      tokens: filteredTokens,
      entities: analysis.entities,
      keywords: analysis.keywords,
      language: analysis.language,
      sentiment: analysis.sentiment
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    return null;
  }
};

// Extract topics from document
exports.extractTopics = async (content, numTopics = 3) => {
  try {
    const processedText = preprocessText(content);
    const analysis = await manager.process(processedText);
    
    // Use NLP to extract main topics
    const topics = analysis.topics || [];
    
    return topics.slice(0, numTopics);
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
};

// Get document recommendations
exports.getContentBasedRecommendations = async (targetDoc, allDocs) => {
  try {
    if (!targetDoc || allDocs.length === 0) {
      return [];
    }

    // Get target document content and metadata
    const targetContent = targetDoc.content || targetDoc.description || targetDoc.title;
    const targetVector = getDocumentVector(targetContent);
    const targetCategory = targetDoc.category;

    // Score each document
    const scoredDocs = allDocs.map(doc => {
      let score = 0;
      
      // Content similarity (50%)
      const docContent = doc.content || doc.description || doc.title;
      const docVector = getDocumentVector(docContent);
      const contentSimilarity = calculateSimilarity(targetVector, docVector);
      score += contentSimilarity * 0.5;
      
      // Category matching (30%)
      if (doc.category === targetCategory) {
        score += 0.3;
      }
      
      // View count bonus (20%)
      const viewScore = Math.min((doc.viewCount || 0) / 100, 1) * 0.2;
      score += viewScore;

      return {
        document: doc,
        score: score,
        similarity: contentSimilarity
      };
    });

    // Sort by score and return top recommendations
    return scoredDocs
      .filter(item => item.score > 0) // Only return items with some similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => ({
        ...item.document.toObject(),
        relevanceScore: Math.round(item.score * 100),
        contentSimilarity: Math.round(item.similarity * 100)
      }));

  } catch (error) {
    console.error('Error in getContentBasedRecommendations:', error);
    return [];
  }
}; 