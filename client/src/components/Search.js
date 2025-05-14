import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaFileAlt, FaDownload, FaEye, FaClock, FaTag } from 'react-icons/fa';
import axios from 'axios';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/documents/search', {
        params: {
          query: searchQuery,
          category: category === 'all' ? '' : category,
          dateRange,
          sortBy
        }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Container className="py-4">
      <Card className="search-card shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="search-header d-flex align-items-center mb-4">
              <div className="search-input-wrapper flex-grow-1">
                <div className="search-input-container">
                  <FaSearch className="search-icon text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <Button 
                variant="link" 
                className="filter-toggle-btn ms-3"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> Filters
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="search-button ms-3"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className={`search-filters ${showFilters ? 'show' : ''}`}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-muted">Category</Form.Label>
                    <Form.Select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-muted">Date Range</Form.Label>
                    <Form.Select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                      className="filter-select"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="all">All Time</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-muted">Sort By</Form.Label>
                    <Form.Select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {results.length > 0 && (
        <div className="search-results mt-4">
          {results.map(doc => (
            <Card key={doc._id} className="result-card mb-3 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <div className="document-icon">
                        <FaFileAlt className={`file-icon file-${doc.fileType.toLowerCase()}`} />
                      </div>
                      <div className="ms-3">
                        <h5 className="document-title mb-1">
                          <a href={`/document/${doc._id}`} className="text-decoration-none">
                            {doc.title}
                          </a>
                        </h5>
                        <p className="document-info mb-0">
                          <Badge bg="light" text="dark" className="category-badge">
                            {doc.category}
                          </Badge>
                          <span className="text-muted ms-2">
                            <FaClock className="me-1" />
                            {formatDate(doc.createdAt)}
                          </span>
                          <span className="text-muted ms-2">
                            {formatFileSize(doc.size)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="document-tags">
                      {doc.tags && doc.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          bg="light" 
                          text="dark" 
                          className="tag-badge me-1"
                        >
                          <FaTag className="me-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Col>
                  <Col xs={12} md={2}>
                    <div className="document-actions text-md-end mt-3 mt-md-0">
                      <Button variant="outline-primary" size="sm" className="action-btn me-2">
                        <FaEye /> View
                      </Button>
                      <Button variant="outline-success" size="sm" className="action-btn">
                        <FaDownload /> Download
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Searching documents...</p>
        </div>
      )}

      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-5">
          <FaSearch size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No documents found</h5>
          <p className="text-muted">Try adjusting your search or filters</p>
        </div>
      )}
    </Container>
  );
};

export default Search; 