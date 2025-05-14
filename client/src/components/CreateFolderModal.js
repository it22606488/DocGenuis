import React, { useEffect, useState } from 'react';
import './CreateFolderModal.css';

export const CreateFolderModal = ({
  folder,
  onClose,
  onAddFolder,
  onUpdateFolder
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    }
  }, [folder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (folder) {
      onUpdateFolder({
        ...folder,
        name: name.trim()
      });
    } else {
      onAddFolder({
        id: Date.now().toString(),
        name: name.trim()
      });
    }
    
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{folder ? 'Edit Folder' : 'Create New Folder'}</h2>
          <button onClick={onClose} className="close-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="folderName" className="form-label">
              Folder Name
            </label>
            <input
              id="folderName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
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
              {folder ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};