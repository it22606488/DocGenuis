import React, { useState, useEffect, useRef } from 'react';
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

// Note: Ensure pdf.js and mammoth.js are loaded in index.html:
// <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"></script>

export const App = () => {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
      
      // Validate documents
      const validDocuments = (response.documents || []).filter(doc => doc._id);
      if (validDocuments.length !== (response.documents || []).length) {
        console.warn('Some documents missing _id:', response.documents);
      }
      setDocuments(validDocuments);
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
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
    }
  };

  // Handle document operations
  const handleAddDocument = async (document, file) => {
    try {
      let content = document?.content || '';
      let fileType = '';

      // If a file is provided, extract content and determine file type
      if (file) {
        fileType = file.type.split('/')[1] || file.name.split('.').pop().toLowerCase();
        
        // Normalize fileType for backend
        if (fileType === 'docx') fileType = 'word';
        else if (fileType === 'plain') fileType = 'text';
        else if (fileType === 'pdf') fileType = 'pdf';
        else if (fileType === 'jpeg') fileType = 'jpg';

        // Log file details for debugging
        console.log('Processing file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          extension: fileType
        });

        // Content extraction based on file type
        if (file.type.includes('text') || file.type.includes('plain')) {
          content = await file.text();
        } else if (file.type === 'application/pdf') {
          // Extract text from PDF using pdf.js
          const pdfjsLib = window.pdfjsLib;
          if (!pdfjsLib) throw new Error('pdf.js not loaded');
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ') + '\n';
          }
          
          content = text.trim() || 'No text extracted from PDF';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'word') {
          // Extract text from .docx using mammoth.js
          if (!window.mammoth) throw new Error('mammoth.js not loaded');
          try {
            const arrayBuffer = await file.arrayBuffer();
            // Validate .docx file
            if (arrayBuffer.byteLength < 1000) {
              console.warn('Invalid or empty .docx file detected');
              content = 'Invalid or empty Word document';
            } else {
              const result = await window.mammoth.extractRawText({ arrayBuffer });
              content = result.value.trim() || 'No text extracted from Word document';
            }
          } catch (err) {
            console.error('mammoth.js error:', {
              message: err.message,
              stack: err.stack
            });
            content = 'Failed to extract content from Word document';
          }
        } else if (file.type.includes('image')) {
          content = 'Image content not extractable';
        } else {
          content = 'Content extraction not supported for this file type';
        }
      }

      // Sanitize content to remove invalid characters
      content = content.replace(/[^\x20-\x7E\n\t]/g, '');

      // Validate documentData
      const documentData = {
        name: (document?.name || file?.name || 'Untitled Document').slice(0, 255),
        description: content.slice(0, 10000),
        folderId: selectedFolderId || null,
        tags: [],
        fileType: fileType || 'none'
      };

      // Log documentData and API call
      console.log('Sending documentData to createDocument:', documentData);

      // Call createDocument API
      const response = await createDocument(documentData);
      
      console.log('createDocument response:', response);

      if (!response.success) {
        throw new Error(response.message || 'API response indicated failure');
      }

      // Re-fetch documents to include the new one
      await fetchDocuments();
    } catch (err) {
      console.error('Error creating document:', {
        message: err.message,
        stack: err.stack,
        fileType: file?.type,
        fileName: file?.name,
        fileSize: file?.size
      });
      setError(`Failed to upload document: ${err.message || 'Unknown error'}`);
    }
    
    setIsCreateDocumentModalOpen(false);
  };

  const handleUpdateDocument = async (updatedDoc) => {
    try {
      // Log updatedDoc for debugging
      console.log('Updating document:', updatedDoc);

      // Validate document
      if (!updatedDoc || !updatedDoc.id) {
        console.warn('Invalid document update attempt:', updatedDoc);
        return; // Silently skip invalid updates
      }

      // If moving to folder, use moveDocumentToFolder API
      if ('folderId' in updatedDoc && updatedDoc.folderId !== documents.find(d => d._id === updatedDoc.id)?.folderId) {
        console.log('Moving document to folder:', {
          documentId: updatedDoc.id,
          folderId: updatedDoc.folderId || 'root'
        });
        await moveDocumentToFolder(updatedDoc.id, updatedDoc.folderId);
      } 
      // For other updates like tags, name, content
      else {
        const documentData = {
          name: (updatedDoc.name || 'Untitled Document').slice(0, 255),
          description: (updatedDoc.content || updatedDoc.description || '').slice(0, 10000),
          tags: updatedDoc.tags ? updatedDoc.tags.map(tag => typeof tag === 'object' ? tag._id : tag) : [],
          fileType: updatedDoc.fileType || 'none'
        };
        
        console.log('Updating document data:', documentData);
        await updateDocument(updatedDoc.id, documentData);
      }
      
      // Re-fetch documents to reflect changes
      await fetchDocuments();
    } catch (err) {
      console.error('Error updating document:', {
        message: err.message,
        stack: err.stack,
        documentId: updatedDoc?.id,
        folderId: updatedDoc?.folderId
      });
      setError(`Failed to update document: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      if (!documentId) {
        throw new Error('Invalid document ID');
      }
      const response = await deleteDocument(documentId);
      
      if (response.success) {
        // Update local state to remove the document
        setDocuments(documents.filter(doc => doc._id !== documentId));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(`Failed to delete document: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large (max 10MB)');
        return;
      }
      handleAddDocument(null, file);
    }
    // Reset file input
    event.target.value = null;
  };

  // Trigger file input click
  const handleAddDocumentClick = () => {
    setError(null); // Clear previous errors
    fileInputRef.current.click();
  };

  // Format documents to match frontend expected structure
  const formattedDocuments = documents.map(doc => {
    if (!doc._id) {
      console.warn('Document missing _id:', doc);
      return null;
    }
    return {
      id: doc._id,
      name: doc.name,
      content: doc.description,
      dateAdded: doc.createdAt,
      tags: doc.tags ? (Array.isArray(doc.tags) ? 
        doc.tags.map(tag => typeof tag === 'object' ? tag.name : tag) : 
        []
      ) : [],
      folderId: doc.folderId?._id || doc.folderId,
      fileType: doc.fileType || 'none'
    };
  }).filter(doc => doc !== null);

  // Format folders to match frontend expected structure
  const formattedFolders = folders.map(folder => {
    if (!folder._id) {
      console.warn('Folder missing _id:', folder);
      return null;
    }
    return {
      id: folder._id,
      name: folder.name
    };
  }).filter(folder => folder !== null);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={() => setError(null)}>Clear Error</button>
      </div>
    );
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
            onClick={handleAddDocumentClick}
          >
            Add Document
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept=".txt,.pdf,.docx,.jpg,.png" // Supported file types
          />
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