import React, { useState, useEffect } from 'react';
import { Button, Card, Form, InputGroup, ListGroup, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DocumentSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: 'all',
    sortBy: 'relevance'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Fetch available categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
          setCategoriesError('Authentication required');
          setCategoriesLoading(false);
          return;
        }
        
        console.log('Fetching categories from API...');
        
        // Try to fetch from API
        try {
          const response = await axios.get(
            'http://localhost:5000/api/documents/categories',
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              timeout: 5000 // Add a timeout to prevent hanging
            }
          );
          
          console.log('Categories received:', response.data);
          
          // Make sure we have at least one category and it's an array
          if (response.data && Array.isArray(response.data)) {
            setCategories(response.data);
            setCategoriesError('');
          } else {
            // Use fallback categories if response is invalid
            applyFallbackCategories();
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          // Use fallback categories on API error
          applyFallbackCategories();
        }
      } catch (err) {
        console.error('Error in category fetch process:', err);
        applyFallbackCategories();
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    // Helper to use fallback categories when API fails
    const applyFallbackCategories = () => {
      console.log('Using fallback categories');
      // Hardcoded fallback categories
      const fallbackCategories = ['Uncategorized', 'IT', 'Marketing', 'HR', 'Finance', 'Operations'];
      setCategories(fallbackCategories);
      setCategoriesError('');
    };

    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.category) params.append('category', filters.category);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      params.append('sortBy', filters.sortBy);
      
      const response = await axios.get(
        `http://localhost:5000/api/search?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching documents');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Search Documents</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSearch}>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Search'
              )}
            </Button>
          </InputGroup>
          
          <div className="d-flex flex-wrap gap-3 mb-3">
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categoriesError ? (
                  <option disabled>Error loading categories</option>
                ) : categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))
                )}
              </Form.Select>
              {categoriesError && <div className="text-danger small mt-1">{categoriesError}</div>}
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <Form.Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Sort By</Form.Label>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="mostDownloaded">Most Downloaded</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Form>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {results.length === 0 && !loading && !error ? (
          <p className="text-center text-muted my-4">
            {query ? 'No documents found matching your search criteria.' : 'Enter a search term to find documents.'}
          </p>
        ) : (
          <ListGroup>
            {results.map((doc) => (
              <ListGroup.Item key={doc._id} className="d-flex align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">
                    <Link to={`/documents/${doc._id}`}>{doc.title}</Link>
                  </div>
                  <p className="mb-1">{doc.description}</p>
                  <div className="d-flex gap-2 text-muted small">
                    <span>Category: {doc.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    {doc.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          Tags: {doc.tags.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <span className="badge bg-primary rounded-pill mb-1">
                    {doc.fileType.toUpperCase()}
                  </span>
                  <small className="text-muted">
                    {(doc.fileSize / 1024).toFixed(1)} KB
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentSearch;