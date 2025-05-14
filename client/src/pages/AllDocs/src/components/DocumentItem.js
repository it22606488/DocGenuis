import React, { useState } from 'react';
import { TagInput } from './TagInput';
import './DocumentItem.css';

export const DocumentItem = ({
  document,
  folders,
  onUpdateDocument,
  onDeleteDocument
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTagsChange = (tags) => {
    onUpdateDocument({
      ...document,
      tags
    });
    setIsEditingTags(false);
  };

  const moveToFolder = (folderId) => {
    onUpdateDocument({
      ...document,
      folderId
    });
    setShowFolderDropdown(false);
  };

  return (
    <div className="document-item">
      <div className="document-item-main">
        <div className="document-name-container">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="toggle-button"
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            )}
          </button>
          <div>
            <h3>{document.name}</h3>
            {document.tags && document.tags.length > 0 && (
              <div className="tag-container">
                {document.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="document-date">
          {formatDate(document.dateAdded)}
        </div>
        
        <div className="document-actions">
          <div className="dropdown-container">
            <button 
              onClick={() => setShowFolderDropdown(!showFolderDropdown)} 
              className="icon-button" 
              title="Move to folder"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </button>
            {showFolderDropdown && (
              <div className="dropdown-menu">
                <button 
                  onClick={() => moveToFolder(null)} 
                  className="dropdown-item"
                >
                  No folder
                </button>
                {folders.map(folder => (
                  <button 
                    key={folder.id} 
                    onClick={() => moveToFolder(folder.id)} 
                    className="dropdown-item"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsEditingTags(true)} 
            className="icon-button" 
            title="Edit tags"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
              <path d="M7 7h.01"/>
            </svg>
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
                onDeleteDocument(document.id);
              }
            }} 
            className="icon-button" 
            title="Delete document"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="document-content">
          <p>{document.content}</p>
          <div className="document-meta">
            Folder:{' '}
            {document.folderId ? folders.find(f => f.id === document.folderId)?.name : 'None'}
          </div>
        </div>
      )}
      
      {isEditingTags && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="modal-title">Edit Tags</h3>
            <TagInput 
              initialTags={document.tags || []} 
              onSave={handleTagsChange} 
              onCancel={() => setIsEditingTags(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};