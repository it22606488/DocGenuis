import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [dateRange, setDateRange] = useState('All Time');
  const [sortBy, setSortBy] = useState('Relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    
    // Initialize speech recognition if supported by the browser
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        
        // Auto-search after getting voice input
        setTimeout(() => {
          handleSearchSubmit();
        }, 1000);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/documents/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Convert frontend date range values to backend expected format
      let dateRangeValue = '';
      switch(dateRange) {
        case 'Today':
          dateRangeValue = 'today';
          break;
        case 'This Week':
          dateRangeValue = 'week';
          break;
        case 'This Month':
          dateRangeValue = 'month';
          break;
        case 'This Year':
          dateRangeValue = 'year';
          break;
        default:
          dateRangeValue = '';
      }

      // Convert frontend sort values to backend expected format
      let sortByValue = '';
      switch(sortBy) {
        case 'Date':
          sortByValue = 'newest';
          break;
        case 'Name':
          sortByValue = 'title';
          break;
        case 'Size':
          sortByValue = 'size';
          break;
        default:
          sortByValue = 'relevance';
      }

      const response = await axios.get('http://localhost:5000/api/search', {
        params: {
          q: searchQuery,
          category: category === 'All Categories' ? '' : category,
          dateRange: dateRangeValue,
          sortBy: sortByValue
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Search results:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchSubmit();
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support speech recognition.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Add function to handle document click
  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  // Debug the results when they arrive
  useEffect(() => {
    if (results.length > 0) {
      console.log(`Displaying ${results.length} search results`);
      console.log('Categories in results:', [...new Set(results.map(doc => doc.category))]);
    }
  }, [results]);

  // Get unique categories from results for filtering
  const uniqueCategories = React.useMemo(() => {
    if (!results.length) return [];
    return [...new Set(results.map(doc => doc.category))].filter(Boolean);
  }, [results]);

  return (
    <div className="search-page-container">
      <div className="search-blue-header">
        <h2>Search Documents</h2>
        {results.length > 0 && (
          <div className="search-stats">
            Found {results.length} document{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <div className="search-content">
        <form onSubmit={handleSearch}>
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="search-text-input" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="button"
                className={`mic-button ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceSearch}
                title={isListening ? 'Stop voice search' : 'Start voice search'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  className="mic-svg-icon" 
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                  <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                </svg>
                {isListening && <span className="recording-dot"></span>}
              </button>
            </div>
            <button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              Search
            </button>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Category</label>
              <div className="select-wrapper">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>All Categories</option>
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <option key={index} value={cat.name || cat}>
                        {cat.name || cat}
                      </option>
                    ))
                  ) : (
                    uniqueCategories.map((cat, index) => (
                      <option key={`result-${index}`} value={cat}>
                        {cat}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="select-wrapper">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <div className="select-wrapper">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Relevance</option>
                  <option>Date</option>
                  <option>Name</option>
                  <option>Size</option>
                </select>
              </div>
            </div>
          </div>
        </form>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results">
            {results.map(doc => (
              <div 
                key={doc._id} 
                className="result-item"
                onClick={() => handleDocumentClick(doc._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="result-content">
                  <h3>{doc.title}</h3>
                  <p>{doc.description || "No description available"}</p>
                  <div className="result-meta">
                    <span className="category-label">Category: {doc.category || "Uncategorized"}</span>
                    <span className="date-label">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    {doc.tags && doc.tags.length > 0 && (
                      <span className="tags-label">Tags: {doc.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="result-type">
                  <span className="file-type">{doc.fileType}</span>
                  <div className="file-size">
                    {Math.round(doc.fileSize / 1024)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <div className="no-results">
            <p>No documents found for "{searchQuery}". Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="no-results">
            <p>Enter a search term to find documents.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;