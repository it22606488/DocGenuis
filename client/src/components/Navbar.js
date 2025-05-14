import React, { useState, useEffect, useRef } from 'react';
import { 
  Navbar as BootstrapNavbar, 
  Nav, 
  Container, 
  Button, 
  Dropdown, 
  Badge,
  Image
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUpload, 
  FaSearch, 
  FaSignInAlt, 
  FaUserPlus, 
  FaSignOutAlt,
  FaUser,
  FaBell,
  FaCog,
  FaChevronDown,
  FaFileAlt,
  FaExclamationCircle,
  FaRegBell
} from 'react-icons/fa';
import './Navbar.css';
import axios from 'axios';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  // Function to check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar 
      bg="white" 
      variant="light" 
      expand="lg" 
      fixed="top" 
      className="shadow-sm navbar-custom py-2"
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaFileAlt className="brand-icon" />
          <span className="brand-text">DocGenius</span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
        />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
                >
                  <FaHome className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/upload" 
                  className={`nav-link-custom ${isActive('/upload') ? 'active' : ''}`}
                >
                  <FaUpload className="me-1" /> Upload
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/search" 
                  className={`nav-link-custom ${isActive('/search') ? 'active' : ''}`}
                >
                  <FaSearch className="me-1" /> Search
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`nav-link-custom ${isActive('/login') ? 'active' : ''}`}
                >
                  <FaSignInAlt className="me-1" /> Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  className={`nav-link-custom ${isActive('/register') ? 'active' : ''}`}
                >
                  <FaUserPlus className="me-1" /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
          
          {isAuthenticated && (
            <Nav className="d-flex align-items-center ms-auto">
              {/* Notifications */}
              <div className="position-relative me-3" ref={notificationRef}>
                <button
                  className="btn btn-link text-dark position-relative p-0"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h6 className="mb-0">Notifications</h6>
                      {unreadCount > 0 && (
                        <span className="text-primary small">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="notification-body">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification._id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => markNotificationAsRead(notification._id)}
                          >
                            <div className="notification-icon">
                              {notification.type === 'document' && <FaFileAlt />}
                              {notification.type === 'system' && <FaCog />}
                              {notification.type === 'alert' && <FaExclamationCircle />}
                            </div>
                            <div className="notification-content">
                              <p className="notification-text">{notification.message}</p>
                              <span className="notification-time">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <FaRegBell size={24} className="text-muted mb-2" />
                          <p className="text-muted mb-0">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="profile-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="profile-avatar">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user?.name || 'User'} 
                        className="profile-image"
                      />
                    ) : (
                      <span className="profile-initials">
                        {getInitials(user?.name || '')}
                      </span>
                    )}
                  </div>
                  <div className="profile-info d-none d-md-block">
                    <span className="profile-name">{user?.name || 'User'}</span>
                    <span className="profile-role">{user?.role || 'User'}</span>
                  </div>
                  <FaChevronDown size={12} className="ms-2" />
                </button>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        {user?.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user?.name || 'User'} 
                            className="profile-image"
                          />
                        ) : (
                          <span className="profile-dropdown-initials">
                            {getInitials(user?.name || '')}
                          </span>
                        )}
                      </div>
                      <div className="profile-dropdown-info">
                        <h6 className="mb-0">{user?.name || 'User'}</h6>
                        <span className="text-muted small">{user?.email || ''}</span>
                      </div>
                    </div>
                    <div className="profile-dropdown-body">
                      <Link to="/profile" className="dropdown-item">
                        <FaUser className="me-2" /> My Profile
                      </Link>
                      <Link to="/settings" className="dropdown-item">
                        <FaCog className="me-2" /> Settings
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <FaSignOutAlt className="me-2" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 