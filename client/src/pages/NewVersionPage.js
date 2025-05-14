import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf"; // Importing jsPDF library
import './NewVersionPage.css';
const VersionHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [versionContent, setVersionContent] = useState("");

  // New state for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch version history
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/app/versions/${id}`
        );
        setVersions(response.data);
      } catch (error) {
        console.error("Error fetching versions", error);
      }
    };

    fetchVersions();
  }, [id]);

  // Handle new version upload
  const handleNewVersionUpload = async (e) => {
    e.preventDefault();

    if (!newFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", newFile);
    formData.append("content", versionContent);

    try {
      const response = await axios.post(
        `http://localhost:5000/app/version/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await axios.put(`http://localhost:5000/api/documentsd/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewFile(null);
      setVersionContent("");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading new version or updating document", error);
      alert("Failed to upload new version or update document");
    }
  };

  // Restore a specific version
  const handleRestoreVersion = async (versionId) => {
    try {
      await axios.put(`http://localhost:5000/app/restore/${versionId}`);
      alert("Successfully restored");
    } catch (error) {
      console.error("Error restoring version", error);
      alert("Failed to restore version");
    }
  };

  // Delete a version
  const handleDelete = async (id) => {
    console.log(id);
    try {
      await axios.delete(`http://localhost:5000/app/version/${id}`);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };

  // Filter versions based on search term
  const filteredVersions = versions.filter((version) =>
    version.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Version History", 20, 20);

    filteredVersions.forEach((version, index) => {
      doc.text(`Filename: ${version.filename}`, 20, 30 + index * 20);
      doc.text(`Version: ${version.version}`, 20, 35 + index * 20);
      doc.text(`Content: ${version.content}`, 20, 40 + index * 20);
      doc.text(
        `Created At: ${new Date(version.createdAt).toLocaleString()}`,
        20,
        45 + index * 20
      );
    });

    doc.save("version-history.pdf");
  };

  return (
    <div className="version-history-container">
      <h1 className="version-history-header">Version History</h1>
  
      {/* New Version Upload Form */}
      <form className="upload-form" onSubmit={handleNewVersionUpload}>
        <h3>Upload New Version</h3>
        <div className="form-group">
          <label className="form-label">Select File</label>
          <label className="file-input-label">
            {newFile ? newFile.name : "Choose a file"}
            <input 
              type="file" 
              className="file-input" 
              onChange={(e) => setNewFile(e.target.files[0])} 
            />
          </label>
          {newFile && <div className="file-name">Selected: {newFile.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Version Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter version description"
            value={versionContent}
            onChange={(e) => setVersionContent(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-btn">Upload New Version</button>
      </form>
  
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by filename..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
  
      {/* Version History List */}
      <div className="versions-list">
        {filteredVersions.length > 0 ? (
          filteredVersions.map((version) => (
            <div key={version._id} className="version-item">
              <div className="version-header">
                <h3 className="version-title">{version.filename}</h3>
                <span className="version-number">Version {version.version}</span>
              </div>
              <p className="version-content">{version.content}</p>
              <p className="version-date">
                Created: {new Date(version.createdAt).toLocaleString()}
              </p>
              <div className="version-actions">
                <button 
                  onClick={() => handleRestoreVersion(version._id)}
                  className="action-btn restore-btn"
                >
                  Restore This Version
                </button>
                <button 
                  onClick={() => handleDelete(version._id)}
                  className="action-btn delete-btn"
                >
                  Delete Version
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No versions found</h3>
            <p>Upload a new version to get started</p>
          </div>
        )}
      </div>
  
      {/* Generate PDF Button */}
      <div className="pdf-btn-container">
        <button onClick={generatePDF} className="pdf-btn">
          <span>Generate PDF Report</span>
        </button>
      </div>
    </div>
  );
}

export default VersionHistoryPage;
