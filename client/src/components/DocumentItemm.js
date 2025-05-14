import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "react-bootstrap";
import { FaEdit, FaTrash, FaCopy, FaFileAlt } from "react-icons/fa";
import "./DocumentItemm.css"; // We'll create this CSS file

const DocumentItem = ({ doc, onDelete }) => {
  return (
    <Card className="document-card">
      <Card.Body>
        <div className="document-header">
          <FaFileAlt className="document-icon" />
          <div>
            <Card.Title className="document-title">{doc.filename}</Card.Title>
            <Badge bg="info" className="version-badge">
              Version {doc.version}
            </Badge>
          </div>
        </div>
        
        <div className="document-actions">
          <Link 
            to={`/edit/${doc._id}`} 
            className="action-button edit-button"
          >
            <FaEdit className="button-icon" /> Edit
          </Link>
          
          <Button 
            variant="outline-danger" 
            className="action-button delete-button"
            onClick={() => onDelete(doc._id)}
          >
            <FaTrash className="button-icon" /> Delete
          </Button>
          
          <Link 
            to={`/version/${doc._id}`} 
            className="action-button version-button"
          >
            <FaCopy className="button-icon" /> New Version
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DocumentItem;