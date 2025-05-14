import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const RecentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await axios.get('http://localhost:5000/api/documents/suggestions/personalized', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDocuments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching personalized suggestions:', error);
        setError('Failed to load suggestions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);
  
  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center p-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-2">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="p-2">
        <p>No recent documents found.</p>
      </div>
    );
  }
  
  return (
    <div className="p-2">
      <h6 className="mb-3">Recommended For You</h6>
      <Row xs={1} md={2} lg={3} className="g-3">
        {documents.map((document) => (
          <Col key={document._id}>
            <Card className="h-100" 
                  onClick={() => handleDocumentClick(document._id)} 
                  style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title className="text-truncate">{document.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{document.category}</Card.Subtitle>
                <Card.Text className="text-truncate">{document.description}</Card.Text>
                <div className="text-muted small mt-1">
                  {document.viewCount} views • Last accessed {new Date(document.lastAccessed).toLocaleDateString()}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RecentDocuments; 