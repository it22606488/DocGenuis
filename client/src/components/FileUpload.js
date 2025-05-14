import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Card, Form, ProgressBar, Spinner, Container, Row, Col } from 'react-bootstrap';
import { FaCloudUploadAlt, FaFileAlt, FaTags, FaFolder } from 'react-icons/fa';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log("File selected:", e.target.files[0]?.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for the document');
      return;
    }
    
    // Clear previous messages
    setError('');
    setMessage('');
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);

    console.log("Form data prepared:", {
      title,
      description: description ? "provided" : "not provided",
      category: category ? "provided" : "not provided", 
      tags: tags ? "provided" : "not provided",
      file: file.name
    });
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("Sending upload request to server...");
      
      const response = await axios.post(
        'http://localhost:5000/api/documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            console.log("Upload progress:", percentCompleted + "%");
          }
        }
      );
      
      console.log("Upload response:", response.data);
      setMessage('Document uploaded successfully!');
      setFile('');
      setTitle('');
      setDescription('');
      setCategory('');
      setTags('');
      setUploadProgress(0);
    } catch (err) {
      console.error('Upload error:', err);
      
      const errMsg = err.response?.data?.message || 
                    err.response?.data?.error || 
                    err.message || 
                    'Error uploading file. Please try again.';
      
      setError(errMsg);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <h4 className="mb-0">
                <FaCloudUploadAlt className="me-2" />
                Upload New Document
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {message && (
                <Alert variant="success" className="mb-4">
                  <FaFileAlt className="me-2" />
                  {message}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaFileAlt className="me-2" />
                        Document Title
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter document title"
                        className="form-control-lg"
                        required
                      />
                      <div className="invalid-feedback">
                        Please enter a document title
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter document description"
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaFolder className="me-2" />
                        Category
                      </Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={categoriesLoading}
                        className="form-select-lg"
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
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaTags className="me-2" />
                        Tags
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                        className="form-control-lg"
                      />
                      <Form.Text className="text-muted">
                        Separate tags with commas (e.g., report, finance, quarterly)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        <FaFileAlt className="me-2" />
                        Document File
                      </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        className="form-control-lg"
                        required
                      />
                      <Form.Text className="text-muted">
                        Supported file types: PDF, DOCX, TXT, CSV, JPG, PNG
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {uploading && (
                  <div className="mb-4">
                    <ProgressBar 
                      now={uploadProgress} 
                      label={`${uploadProgress}%`}
                      className="progress-lg"
                    />
                    <div className="text-center mt-2">
                      <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Uploading...</span>
                      </Spinner>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={uploading}
                    className="py-3"
                  >
                    {uploading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="me-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileUpload; 