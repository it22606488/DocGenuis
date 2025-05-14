import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Badge, Spinner, Alert, Modal, Form, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaArrowLeft, FaEye, FaFolder, FaFileAlt, FaTags, FaDownload, FaClock } from 'react-icons/fa';
import axios from 'axios';
import './DocumentView.css';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  
  // Added state for update and delete operations
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Check if current user is the document owner
  const checkOwnership = (documentData, userId) => {
    if (!documentData || !userId) return false;
    
    try {
      // Get the document owner ID
      let documentOwnerId;
      
      if (typeof documentData.uploadedBy === 'object' && documentData.uploadedBy._id) {
        documentOwnerId = documentData.uploadedBy._id;
      } else {
        documentOwnerId = documentData.uploadedBy;
      }
      
      console.log('Document owner ID:', documentOwnerId);
      console.log('Current user ID:', userId);
      
      // Compare the IDs as strings to ensure proper comparison
      return String(documentOwnerId) === String(userId);
    } catch (err) {
      console.error('Error checking document ownership:', err);
      return false;
    }
  };

  useEffect(() => {
    const fetchUserAndDocument = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // First fetch the current user profile to get user ID
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Set the current user ID
        const userData = userResponse.data;
        setCurrentUserId(userData._id);
        
        // Check if the user is an admin
        console.log('User data:', userData);
        setIsAdmin(userData.role === 'admin');
        
        // Then fetch the document
        const docResponse = await axios.get(
          `http://localhost:5000/api/documents/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const documentData = docResponse.data;
        setDocument(documentData);
        
        // Check if current user is the document owner
        const ownershipResult = checkOwnership(documentData, userData._id);
        setIsOwner(ownershipResult);
        
        console.log('Permissions - isOwner:', ownershipResult, 'isAdmin:', userData.role === 'admin');
        
        // Initialize form with current document data
        setUpdateForm({
          title: documentData.title || '',
          description: documentData.description || '',
          category: documentData.category || '',
          tags: documentData.tags ? documentData.tags.join(', ') : ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message || 
          'Error fetching document details. Please try again.'
        );
        setLoading(false);
      }
    };
    
    fetchUserAndDocument();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setDownloading(false);
        return;
      }
      
      // Using axios to trigger file download with proper authorization
      const response = await axios({
        url: `http://localhost:5000/api/documents/${id}/download`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      
      // Set the filename from the Content-Disposition header if available
      // Otherwise use the document title with its file type
      const filename = `${document.title}.${document.fileType}`;
      link.setAttribute('download', filename);
      
      // Append to body, click, and clean up
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloading(false);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Error downloading document. Please try again.');
      setDownloading(false);
    }
  };

  // Handle update form input changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm({
      ...updateForm,
      [name]: value
    });
  };

  // Handle document update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!isOwner && !isAdmin) {
        setError('You do not have permission to update this document.');
        setUpdating(false);
        // Close modal and show the error in the main component
        setShowEditModal(false);
        return;
      }
      
      setUpdating(true);
      setError(''); // Clear any previous errors
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setUpdating(false);
        return;
      }
      
      // Process tags from comma-separated string to array
      const tagsArray = updateForm.tags
        ? updateForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      // Prepare the request data
      const updateData = {
        title: updateForm.title,
        description: updateForm.description,
        category: updateForm.category,
        tags: tagsArray
      };
      
      console.log('Sending update with data:', updateData);
      
      // Send update request with proper authorization
      const response = await axios.put(
        `http://localhost:5000/api/documents/${id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // Add timeout to ensure we don't wait indefinitely
          timeout: 10000
        }
      );
      
      console.log('Update response:', response.data);
      
      // Update local state with updated document
      setDocument(response.data);
      setUpdating(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating document:', err);
      // Provide more specific error messages based on the error type
      if (err.response) {
        // Server returned an error response
        if (err.response.status === 403) {
          setError('You do not have permission to update this document.');
          // Close the modal since this is a permission issue that won't be resolved by retrying
          setShowEditModal(false);
        } else if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Optional: Redirect to login page
          // navigate('/login');
          setShowEditModal(false);
        } else {
          setError(`Error updating document: ${err.response.data.message || 'Server error'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Error setting up the request
        setError(`Error updating document: ${err.message}`);
      }
      setUpdating(false);
      // Keep modal open when error occurs so user can try again, except for permission issues
    }
  };

  // Handle document delete
  const handleDelete = async () => {
    try {
      if (!isOwner && !isAdmin) {
        setError('You do not have permission to delete this document.');
        setDeleting(false);
        // Close modal and show the error in the main component
        setShowDeleteModal(false);
        return;
      }
      
      setDeleting(true);
      setError(''); // Clear any previous errors
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setDeleting(false);
        return;
      }
      
      // Send delete request
      await axios.delete(
        `http://localhost:5000/api/documents/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setDeleting(false);
      setShowDeleteModal(false);
      
      // Redirect to document list after successful deletion
      navigate('/');
    } catch (err) {
      console.error('Error deleting document:', err);
      
      if (err.response && err.response.status === 403) {
        setError('You do not have permission to delete this document.');
        setShowDeleteModal(false);
      } else {
        setError('Error deleting document. Please try again.');
      }
      
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Add fetchCategories function
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
      
      try {
        const response = await axios.get(
          'http://localhost:5000/api/documents/categories',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          }
        );
        
        console.log('Categories received:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          setCategoriesError('');
        } else {
          applyFallbackCategories();
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        applyFallbackCategories();
      }
    } catch (err) {
      console.error('Error in category fetch process:', err);
      applyFallbackCategories();
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Add fallback categories helper
  const applyFallbackCategories = () => {
    console.log('Using fallback categories');
    const fallbackCategories = ['Uncategorized', 'IT', 'Marketing', 'HR', 'Finance', 'Operations'];
    setCategories(fallbackCategories);
    setCategoriesError('');
  };

  // Update useEffect to fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <h5>Error</h5>
        <p>{error}</p>
        <div className="mt-3">
          <Button onClick={handleBack} variant="secondary">
            Back
          </Button>
        </div>
      </Alert>
    );
  }

  if (!document) {
    return (
      <Alert variant="warning">
        Document not found
        <div className="mt-3">
          <Button onClick={handleBack} variant="secondary">
            Back
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      <Card className="document-details-card">
        <Card.Header className="d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center">
            <FaEye className="me-2 text-white" />
            <h5 className="mb-0 text-white">Document Details</h5>
          </div>
          <div className="header-buttons">
            {isOwner || isAdmin ? (
              <>
                <Button 
                  variant="light" 
                  className="action-button edit-button me-2"
                  onClick={() => setShowEditModal(true)}
                >
                  <FaEdit className="button-icon" />
                  <span className="button-text">Edit</span>
                </Button>
                <Button 
                  variant="danger" 
                  className="action-button delete-button me-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrashAlt className="button-icon" />
                  <span className="button-text">Delete</span>
                </Button>
              </>
            ) : (
              <Badge bg="secondary" className="view-only-badge">
                <FaEye className="me-1" /> View Only
              </Badge>
            )}
            <Button 
              variant="light" 
              className="action-button back-button"
              onClick={handleBack}
            >
              <FaArrowLeft className="button-icon" />
              <span className="button-text">Back</span>
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <Row>
            <Col lg={8}>
              <div className="document-main-info">
                <div className="document-header mb-4">
                  <h2 className="document-title">{document.title}</h2>
                  <div className="document-meta">
                    <Badge bg="primary" className="category-badge">
                      <FaFolder className="me-1" />
                      {document.category || 'Uncategorized'}
                    </Badge>
                    <Badge bg="info" className="file-type-badge">
                      <FaFileAlt className="me-1" />
                      {document.fileType.toUpperCase()}
                    </Badge>
                    <span className="file-size">
                      <FaFileAlt className="me-1" />
                      {(document.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                
                {document.description && (
                  <div className="document-description mb-4">
                    <h5 className="section-title">
                      <FaFileAlt className="me-2" />
                      Description
                    </h5>
                    <p className="description-text">{document.description}</p>
                  </div>
                )}
                
                {document.tags && document.tags.length > 0 && (
                  <div className="document-tags">
                    <h5 className="section-title">
                      <FaTags className="me-2" />
                      Tags
                    </h5>
                    <div className="tags-container">
                      {document.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          bg="secondary" 
                          className="tag-badge"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>

            <Col lg={4}>
              <Card className="stats-card">
                <Card.Header>
                  <h5 className="stats-title mb-0">
                    <FaEye className="me-2" />
                    Statistics
                  </h5>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="stat-label">
                        <FaEye className="me-2" />
                        Views
                      </span>
                      <Badge bg="primary" pill className="stat-value">
                        {document.viewCount || 0}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="stat-label">
                        <FaDownload className="me-2" />
                        Downloads
                      </span>
                      <Badge bg="primary" pill className="stat-value">
                        {document.downloadCount || 0}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="stat-label">
                        <FaClock className="me-2" />
                        Uploaded
                      </span>
                      <span className="stat-date">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="stat-label">
                        <FaClock className="me-2" />
                        Last Accessed
                      </span>
                      <span className="stat-date">
                        {new Date(document.lastAccessed).toLocaleDateString()}
                      </span>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              <Button 
                variant="primary" 
                className="download-btn mt-4 w-100"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="me-2" />
                    <span>Download Document</span>
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Edit Document Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title>
            <div className="d-flex align-items-center">
              <FaEdit className="me-2 text-primary" />
              Edit Document
            </div>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={updateForm.title}
                onChange={handleUpdateChange}
                className="form-control-lg"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={updateForm.description}
                onChange={handleUpdateChange}
                className="form-control-lg"
                placeholder="Enter document description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <FaFolder className="me-2" />
                Category
              </Form.Label>
              <Form.Select
                name="category"
                value={updateForm.category}
                onChange={handleUpdateChange}
                className="form-select-lg"
                disabled={categoriesLoading}
                required
              >
                <option value="">Select a Category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categoriesError ? (
                  <option disabled>Error loading categories</option>
                ) : categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))
                )}
              </Form.Select>
              {categoriesError && (
                <div className="text-danger small mt-1">{categoriesError}</div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tags</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={updateForm.tags}
                onChange={handleUpdateChange}
                className="form-control-lg"
                placeholder="Enter tags separated by commas"
              />
              <Form.Text className="text-muted">
                Separate tags with commas (e.g., report, finance, quarterly)
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button 
              variant="light" 
              onClick={() => setShowEditModal(false)}
              className="btn-lg"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={updating}
              className="btn-lg"
            >
              {updating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the document <strong>{document.title}</strong>? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Deleting...
              </>
            ) : 'Delete Document'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DocumentView; 