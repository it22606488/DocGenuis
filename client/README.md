# Document Management System - Client

## Overview

This is the frontend client for the Document Management System. It provides a modern, responsive user interface for document management with AI-powered recommendations.

## Features

- Modern, responsive UI design
- Document upload and management
- AI-powered document recommendations
- Advanced search and filtering
- User authentication
- Document analytics dashboard

## Components

### Dashboard

The main dashboard provides:

- Document statistics
- Recent documents
- Personalized recommendations
- Quick actions

### Document Management

- Document upload
- Document viewing
- Document editing
- Document deletion
- Category management

### Search and Filtering

- Advanced search functionality
- Category filtering
- Date range filtering
- Sort options
- Real-time results

### AI Recommendations

The frontend displays AI-powered recommendations through:

- Personalized document suggestions
- Content-based recommendations
- Activity-based recommendations
- Interactive recommendation cards

## Technical Implementation

### State Management

```javascript
const [documents, setDocuments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### API Integration

```javascript
const response = await axios.get(
  "http://localhost:5000/api/documents/suggestions/personalized",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

### Recommendation Display

```javascript
<Row xs={1} md={2} lg={3} className="g-3">
  {documents.map((document) => (
    <Col key={document._id}>
      <Card className="h-100">
        <Card.Body>
          <Card.Title>{document.title}</Card.Title>
          <Card.Subtitle>{document.category}</Card.Subtitle>
          <Card.Text>{document.description}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>
```

## Dependencies

- React.js
- React Bootstrap
- Axios
- React Router
- React Icons

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## UI Components

### 1. Dashboard

- Statistics cards
- Recent documents list
- Recommendation section
- Quick action buttons

### 2. Document Management

- Upload form
- Document viewer
- Edit form
- Delete confirmation

### 3. Search Interface

- Search input
- Filter options
- Sort controls
- Results display

### 4. Recommendation Display

- Recommendation cards
- Similarity indicators
- Activity metrics
- Interactive elements

## Future Improvements

1. Add infinite scroll
2. Implement real-time updates
3. Enhance UI animations
4. Add more interactive features
5. Improve mobile responsiveness
