import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import DocumentSearch from './components/DocumentSearch';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import DocumentView from './components/DocumentView';
import IconTest from './components/IconTest';
import Search from './components/Search';
import { AllDocs } from './pages/AllDocs/src/AllDocs';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Add useEffect to adjust body padding based on navbar height
  useEffect(() => {
    // Need to add padding to body for fixed navbar
    const updateBodyPadding = () => {
      const navbar = document.querySelector('.navbar-custom');
      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        document.body.style.paddingTop = `${navbarHeight}px`;
      }
    };

    // Initial update and add listener for window resize
    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', updateBodyPadding);
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Container className="mt-4">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <FileUpload />
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />

          <Route path="/documents/:id" element={
            <ProtectedRoute>
              <DocumentView />
            </ProtectedRoute>
          } />

          <Route path="/documents" element={
            <ProtectedRoute>
              <AllDocs />
            </ProtectedRoute>
          } />

          <Route path="/icon-test" element={<IconTest />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 