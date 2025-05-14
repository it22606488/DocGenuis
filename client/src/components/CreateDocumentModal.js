import React, { useEffect, useState } from 'react';
import './CreateFolderModal.css'; // Reusing the existing modal styles

export const CreateDocumentModal = ({
  document,
  onClose,
  onAddDocument,
  onUpdateDocument
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (document) {
      setName(document.name);
      setContent(document.content || document.description || '');
    }
  }, [document]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (document) {
      onUpdateDocument({
        ...document,
        name: name.trim(),
        content: content.trim()
      });
    } else {
      onAddDocument({
        name: name.trim(),
        content: content.trim()
      });
    }
    
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content document-modal">
        <div className="modal-header">
          <h2>{document ? 'Edit Document' : 'Create New Document'}</h2>
          <button onClick={onClose} className="close-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="documentName" className="form-label">
              Document Name
            </label>
            <input
              id="documentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="documentContent" className="form-label">
              Content
            </label>
            <textarea
              id="documentContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
              rows={10}
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="secondary-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button"
            >
              {document ? 'Save Changes' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};