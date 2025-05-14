import React from 'react';
import { DocumentItem } from './DocumentItem';
import './DocumentList.css';

export const DocumentList = ({
  documents,
  folders,
  onUpdateDocument,
  onDeleteDocument
}) => {
  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
        <h3>No documents found</h3>
        <p>Add a new document to get started.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <div className="document-list-header">
        <div>Name</div>
        <div>Date Added</div>
        <div>Actions</div>
      </div>
      <div className="document-items">
        {documents.map(document => (
          <DocumentItem
            key={document.id}
            document={document}
            folders={folders}
            onUpdateDocument={onUpdateDocument}
            onDeleteDocument={onDeleteDocument}
          />
        ))}
      </div>
    </div>
  );
};