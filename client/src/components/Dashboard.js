import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Badge, 
  Spinner,
  ListGroup,
  Modal 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RecentDocuments from './dashboard/RecentDocuments';
import './Dashboard.css';
import { 
  FaUser, 
  FaFileAlt, 
  FaEye, 
  FaDownload, 
  FaUpload, 
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaSearch,
  FaListAlt,
  FaEnvelope
} from 'react-icons/fa';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalViews: 0,
    downloads: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  
  // Add new states for all documents modal
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  // Add function to fetch document suggestions
  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/documents/suggestions/personalized', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuggestions(response.data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch document statistics
        const statsResponse = await axios.get('http://localhost:5000/api/documents/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(userResponse.data);
        setStats({
          totalDocuments: statsResponse.data.totalDocuments || 0,
          totalViews: statsResponse.data.totalViews || 0,
          downloads: statsResponse.data.downloads || 0,
          recentActivity: statsResponse.data.recentActivity || 0
        });
        
        // Fetch document suggestions
        await fetchSuggestions();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to create user avatar with initials
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add new function to fetch all documents
  const fetchAllDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setDocumentsError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/documents/user-documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setAllDocuments(response.data);
      } else {
        setAllDocuments([]);
      }
      setShowAllDocuments(true);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentsError('Failed to load your documents. Please try again.');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Add function to handle document click
  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
    setShowAllDocuments(false);
  };

  // Format date for documents
  const formatDocumentDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back, {user?.name || 'User'}!</h1>
        <p>Manage and track your documents efficiently</p>
      </div>
      
      <Container>
      <Row className="mb-4">
        <Col lg={12}>
            <Card className="user-info-card">
            <Card.Body>
              <Row>
                <Col md={2} className="d-flex justify-content-center align-items-center mb-3 mb-md-0">
                    <div className="user-avatar">
                    {getUserInitials(user?.name)}
                  </div>
                </Col>
                <Col md={10}>
                    <div className="user-info-content">
                      <h4 className="user-name">{user?.name || 'User'}</h4>
                      <div className="user-email">
                        <FaEnvelope />
                        {user?.email || 'No email available'}
                      </div>
                      
                      <div className="user-meta">
                        <div className="meta-item">
                          <div className="meta-icon">
                            <FaCalendarAlt />
                          </div>
                          <div className="meta-label">Last Login</div>
                          <div className="meta-value">{formatDate(user?.lastLogin)}</div>
                        </div>
                        
                        {user?.department && (
                          <div className="meta-item">
                            <div className="meta-icon">
                              <FaUser />
                            </div>
                            <div className="meta-label">Department</div>
                            <div className="meta-value">{user.department}</div>
                      </div>
                        )}
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <FaClock />
                          </div>
                          <div className="meta-label">Recent Activity</div>
                          <div className="meta-value">{stats.recentActivity} actions</div>
                        </div>
                      </div>
                      
                      <div className="quick-actions">
                        <Button 
                          className="action-button"
                          onClick={() => navigate('/upload')}
                        >
                          <FaUpload className="action-icon" />
                          <span className="action-label">Upload</span>
                        </Button>
                        <Button 
                          className="action-button"
                          onClick={() => navigate('/search')}
                        >
                          <FaSearch className="action-icon" />
                          <span className="action-label">Search</span>
                        </Button>
                      </div>
                    </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

        <Row className="g-4">
          <Col md={3} sm={6} className="mb-4">
            <div className="stat-card" onClick={fetchAllDocuments} style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div className="stat-icon">
                  <FaFileAlt />
              </div>
                <div className="stat-value">{stats.totalDocuments}</div>
                <div className="stat-label">Total Documents</div>
              </div>
            </div>
        </Col>
        
          <Col md={3} sm={6} className="mb-4">
            <div className="stat-card">
              <div className="card-body">
                <div className="stat-icon">
                  <FaEye />
                </div>
                <div className="stat-value">{stats.totalViews}</div>
                <div className="stat-label">Total Views</div>
              </div>
              </div>
        </Col>
        
          <Col md={3} sm={6} className="mb-4">
            <div className="stat-card">
              <div className="card-body">
                <div className="stat-icon">
                  <FaDownload />
              </div>
                <div className="stat-value">{stats.downloads}</div>
                <div className="stat-label">Downloads</div>
              </div>
            </div>
          </Col>

          <Col md={3} sm={6} className="mb-4">
            <div className="stat-card">
              <div className="card-body">
                <div className="stat-icon">
                  <FaChartLine />
                </div>
                <div className="stat-value">{stats.recentActivity}</div>
                <div className="stat-label">Recent Activities</div>
              </div>
            </div>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
            <Card className="recent-documents-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <FaListAlt className="me-2" />
                    Recommended Documents
                  </h5>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={fetchSuggestions}
                >
                  Refresh
                </Button>
              </Card.Header>
              <Card.Body>
                {loadingSuggestions ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading recommendations...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <ListGroup variant="flush">
                    {suggestions.map((doc) => (
                      <ListGroup.Item 
                        key={doc._id}
                        className="d-flex justify-content-between align-items-center recommendation-item"
                        onClick={() => handleDocumentClick(doc._id)}
                      >
                        <div className="d-flex align-items-center">
                          <FaFileAlt className="me-3 text-primary" />
                          <div>
                            <h6 className="mb-0">{doc.title}</h6>
                            <small className="text-muted">
                              {doc.category} • {formatDocumentDate(doc.createdAt)}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <Badge bg="info" className="me-2">
                            {doc.relevanceScore}% Match
                          </Badge>
                          <FaEye className="text-muted" />
                          <span className="ms-1 text-muted">{doc.viewCount || 0}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5">
                    <FaFileAlt size={48} className="empty-state-icon mb-3" />
                    <h5>No recommendations yet</h5>
                    <p className="text-muted">View some documents to get personalized recommendations</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/search')}
                    >
                      <FaSearch className="me-2" /> Browse Documents
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
        </Col>
      </Row>
      </Container>

      {/* Add Modal for All Documents */}
      <Modal
        show={showAllDocuments}
        onHide={() => setShowAllDocuments(false)}
        size="lg"
        aria-labelledby="all-documents-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="all-documents-modal">
            <FaFileAlt className="me-2" />
            My Documents ({allDocuments.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDocuments ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading documents...</p>
            </div>
          ) : documentsError ? (
            <Alert variant="danger">
              {documentsError}
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="mt-2"
                onClick={fetchAllDocuments}
              >
                Try Again
              </Button>
            </Alert>
          ) : allDocuments.length === 0 ? (
            <div className="text-center py-4">
              <FaFileAlt size={48} className="empty-state-icon mb-3" />
              <h5>No Documents Found</h5>
              <p className="text-muted">You haven't uploaded any documents yet.</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowAllDocuments(false);
                  navigate('/upload');
                }}
              >
                <FaUpload className="me-2" /> Upload Document
              </Button>
            </div>
          ) : (
            <ListGroup variant="flush">
              {allDocuments.map((doc) => (
                <ListGroup.Item 
                  key={doc._id}
                  action
                  onClick={() => handleDocumentClick(doc._id)}
                  className="document-item"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{doc.title}</h6>
                      <p className="mb-1 text-muted small">
                        {doc.description?.substring(0, 100)}
                        {doc.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="document-meta">
                        <Badge bg="primary" className="me-2">{doc.category}</Badge>
                        <small className="text-muted">
                          Uploaded on {formatDocumentDate(doc.createdAt)}
                        </small>
                      </div>
                    </div>
                    <div className="ms-3 text-end">
                      <div className="small text-muted mb-1">
                        <FaEye className="me-1" /> {doc.viewCount || 0}
                      </div>
                      <div className="small text-muted">
                        <FaDownload className="me-1" /> {doc.downloadCount || 0}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAllDocuments(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard; 