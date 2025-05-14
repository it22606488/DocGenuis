# Document Management System - Server

## Overview

This is the backend server for the Document Management System. It provides RESTful APIs for document management and includes an AI-powered recommendation system.

## Features

- Document upload and management
- User authentication and authorization
- AI-powered document recommendations
- Document search and filtering
- Document analytics and statistics

## AI Recommendation System

The system uses a hybrid recommendation approach combining content-based filtering with user activity analysis:

### Content-Based Filtering (70%)

- Uses Natural Language Processing (NLP) to analyze document content
- Implements TF-IDF (Term Frequency-Inverse Document Frequency) for text analysis
- Calculates document similarity using cosine similarity
- Extracts entities and keywords from documents

### User Activity Analysis (30%)

- Tracks user document views and interactions
- Considers document recency and view frequency
- Calculates personalized activity scores

### Technical Implementation

1. **Document Analysis**

   ```javascript
   // Text preprocessing
   const processedText = preprocessText(content);

   // Extract entities and keywords
   const analysis = await manager.process(processedText);
   ```

2. **Similarity Calculation**

   ```javascript
   // Calculate TF-IDF vectors
   const vector1 = calculateTFIDF(doc1);
   const vector2 = calculateTFIDF(doc2);

   // Calculate cosine similarity
   return cosineSimilarity(vector1, vector2);
   ```

3. **Recommendation Generation**
   ```javascript
   // Combine content and activity scores
   const finalScore = contentScore * 0.7 + activityScore * 0.3;
   ```

## API Endpoints

### Document Management

- `POST /api/documents` - Upload new document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Recommendations

- `GET /api/documents/suggestions/personalized` - Get personalized document suggestions
- `GET /api/documents/user-documents` - Get user's documents

### Search

- `GET /api/search` - Search documents
- `GET /api/documents/categories` - Get document categories

## Dependencies

- Express.js
- MongoDB
- Node-NLP
- Natural
- JWT Authentication
- Multer (File upload)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Create `.env` file
   - Add required variables (MONGODB_URI, JWT_SECRET, etc.)

3. Start the server:
   ```bash
   npm start
   ```

## AI System Architecture

### 1. Document Processing

- Text preprocessing
- Tokenization
- Stopword removal
- Entity extraction
- Keyword extraction

### 2. Similarity Analysis

- TF-IDF calculation
- Vector space model
- Cosine similarity computation

### 3. Recommendation Engine

- Content-based scoring
- Activity-based scoring
- Score combination
- Ranking and filtering

## Future Improvements

1. Implement deep learning models
2. Add collaborative filtering
3. Enhance NLP capabilities
4. Optimize performance
5. Add user feedback system
