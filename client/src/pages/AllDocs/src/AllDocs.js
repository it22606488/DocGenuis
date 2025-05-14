import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { DocumentList } from './components/DocumentList';
import { CreateFolderModal } from './components/CreateFolderModal';
import { CreateDocumentModal } from './components/CreateDocumentModal';
// Import API services
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getAllDocuments,
  getDocumentsByFolder,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocumentToFolder
} from './services/api';

export const AllDocs = () => {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load folders and documents on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch folders
        const foldersResponse = await getFolders();
        setFolders(foldersResponse.folders || []);

        // Fetch documents
        await fetchDocuments();
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch documents based on selected folder
  const fetchDocuments = async () => {
    try {
      let response;

      if (selectedFolderId) {
        response = await getDocumentsByFolder(selectedFolderId);
      } else {
        response = await getAllDocuments();
      }

      setDocuments(response.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    }
  };

  // Re-fetch documents when selectedFolderId changes
  useEffect(() => {
    fetchDocuments();
  }, [selectedFolderId]);

  // Handle folder operations
  const handleAddFolder = async (folder) => {
    try {
      const response = await createFolder({
        name: folder.name,
        description: ''
      });

      if (response.success) {
        setFolders([...folders, response.folder]);
      }
    } catch (err) {
      console.error('Error creating folder:', err);
    }

    setIsCreateFolderModalOpen(false);
  };

  const handleUpdateFolder = async (updatedFolder) => {
    try {
      const response = await updateFolder(updatedFolder._id || updatedFolder.id, {
        name: updatedFolder.name
      });

      if (response.success) {
        setFolders(folders.map(folder =>
          folder._id === response.folder._id ? response.folder : folder
        ));
      }
    } catch (err) {
      console.error('Error updating folder:', err);
    }

    setIsCreateFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      const response = await deleteFolder(folderId);

      if (response.success) {
        setFolders(folders.filter(folder => folder._id !== folderId));

        // If the deleted folder is currently selected, go back to all documents
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }

        // Re-fetch documents to get updated list
        fetchDocuments();
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
    }
  };

  // Handle document operations
  const handleAddDocument = async (document) => {
    try {
      const documentData = {
        name: document.name,
        description: document.content,
        folderId: selectedFolderId,
        tags: []
      };

      const response = await createDocument(documentData);

      if (response.success) {
        // Re-fetch documents to include the new one
        fetchDocuments();
      }
    } catch (err) {
      console.error('Error creating document:', err);
    }

    setIsCreateDocumentModalOpen(false);
  };

  const handleUpdateDocument = async (updatedDoc) => {
    try {
      // If moving to folder, use moveDocumentToFolder API
      if ('folderId' in updatedDoc && updatedDoc.folderId !== documents.find(d => d._id === updatedDoc._id)?.folderId) {
        await moveDocumentToFolder(updatedDoc._id, updatedDoc.folderId);
      }
      // For other updates like tags, name, content
      else {
        const documentData = {
          name: updatedDoc.name,
          description: updatedDoc.content || updatedDoc.description,
          tags: updatedDoc.tags.map(tag => typeof tag === 'object' ? tag._id : tag)
        };

        await updateDocument(updatedDoc._id, documentData);
      }

      // Re-fetch documents to reflect changes
      fetchDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await deleteDocument(documentId);

      if (response.success) {
        // Update local state to remove the document
        setDocuments(documents.filter(doc => doc._id !== documentId));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Format documents to match frontend expected structure
  const formattedDocuments = documents.map(doc => ({
    id: doc._id,
    name: doc.name,
    content: doc.description,
    dateAdded: doc.createdAt,
    tags: doc.tags ? (Array.isArray(doc.tags) ?
      doc.tags.map(tag => typeof tag === 'object' ? tag.name : tag) :
      []
    ) : [],
    folderId: doc.folderId?._id || doc.folderId
  }));

  // Format folders to match frontend expected structure
  const formattedFolders = folders.map(folder => ({
    id: folder._id,
    name: folder.name
  }));

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar
        folders={formattedFolders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={() => setIsCreateFolderModalOpen(true)}
        onEditFolder={(folder) => {
          setEditingFolder(folder);
          setIsCreateFolderModalOpen(true);
        }}
        onDeleteFolder={handleDeleteFolder}
      />
      <main className="main-content">
        <div className="header">
          <h1>
            {selectedFolderId
              ? formattedFolders.find(f => f.id === selectedFolderId)?.name
              : 'All Documents'}
          </h1>
          <button
            className="primary-button"
            onClick={() => setIsCreateDocumentModalOpen(true)}
          >
            Add Document
          </button>
        </div>
        <DocumentList
          documents={formattedDocuments}
          folders={formattedFolders}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      </main>

      {isCreateFolderModalOpen && (
        <CreateFolderModal
          folder={editingFolder}
          onClose={() => {
            setIsCreateFolderModalOpen(false);
            setEditingFolder(null);
          }}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
        />
      )}

      {isCreateDocumentModalOpen && (
        <CreateDocumentModal
          document={editingDocument}
          onClose={() => {
            setIsCreateDocumentModalOpen(false);
            setEditingDocument(null);
          }}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
        />
      )}
    </div>
  );
};