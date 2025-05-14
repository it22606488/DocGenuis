import React, { useState } from 'react';
import './TagInput.css';

export const TagInput = ({
  initialTags,
  onSave,
  onCancel
}) => {
  const [tags, setTags] = useState(initialTags);
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-tags">
        {tags.map(tag => (
          <div key={tag} className="tag-input-tag">
            <span>{tag}</span>
            <button onClick={() => removeTag(tag)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="form-input"
        placeholder="Type a tag and press Enter"
      />
      <p className="helper-text">Press Enter to add a tag</p>
      
      <div className="modal-footer">
        <button 
          onClick={onCancel} 
          className="secondary-button"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(tags)} 
          className="primary-button"
        >
          Save Tags
        </button>
      </div>
    </div>
  );
};