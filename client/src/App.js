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

// Pages from your first snippet
import Home from './pages/Home';
import UploadForm from './pages/UploadForm';
import DocumentList from './pages/DocumentList';
import EditDocument from './pages/EditDocument';
import Versionadd from './pages/NewVersionPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const updateBodyPadding = () => {
      const navbar = document.querySelector('.navbar-custom');
      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        document.body.style.paddingTop = `${navbarHeight}px`;
      }
    };
    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);
    return () => window.removeEventListener('resize', updateBodyPadding);
  }, []);

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
              <DocumentSearch />
            </ProtectedRoute>
          } />

          <Route path="/documents/:id" element={
            <ProtectedRoute>
              <DocumentView />
            </ProtectedRoute>
          } />

          {/* Routes from your original snippet */}
          <Route path="/home" element={
          
              <Home />
            
          } />
          <Route path="/uploads" element={
          
              <UploadForm />
            
          } />
          <Route path="/documentss" element={
          
              <DocumentList />
            
          } />
          <Route path="/edit/:id" element={
          
              <EditDocument />
            
          } />
          <Route path="/version/:id" element={
          
              <Versionadd />
            
          } />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
