// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

// Generic fetch handler with error handling
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Folder operations
export const getFolders = () => {
  return fetchData(`${API_BASE_URL}/folders`);
};

export const createFolder = (folderData) => {
  return fetchData(`${API_BASE_URL}/folder/create`, {
    method: 'POST',
    body: JSON.stringify(folderData),
  });
};

export const updateFolder = (id, folderData) => {
  return fetchData(`${API_BASE_URL}/folder/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(folderData),
  });
};

export const deleteFolder = (id) => {
  return fetchData(`${API_BASE_URL}/folder/delete/${id}`, {
    method: 'DELETE',
  });
};

// Document operations
export const getAllDocuments = () => {
  return fetchData(`${API_BASE_URL}/documents`);
};

export const getDocumentsByFolder = (folderId) => {
  const endpoint = folderId ? `/documents/folder/${folderId}` : '/documents';
  return fetchData(`${API_BASE_URL}${endpoint}`);
};

export const getDocumentsByTag = (tagId) => {
  return fetchData(`${API_BASE_URL}/documents/tag/${tagId}`);
};

export const getDocument = (id) => {
  return fetchData(`${API_BASE_URL}/document/${id}`);
};

export const createDocument = (documentData) => {
  return fetchData(`${API_BASE_URL}/document/save`, {
    method: 'POST',
    body: JSON.stringify(documentData),
  });
};

export const updateDocument = (id, documentData) => {
  return fetchData(`${API_BASE_URL}/document/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(documentData),
  });
};

export const deleteDocument = (id) => {
  return fetchData(`${API_BASE_URL}/document/delete/${id}`, {
    method: 'DELETE',
  });
};

export const moveDocumentToFolder = (documentId, folderId) => {
  const folderIdParam = folderId || 'root';
  return fetchData(`${API_BASE_URL}/folder/${folderIdParam}/add-document/${documentId}`, {
    method: 'PUT',
  });
};

// Tag operations
export const getTags = () => {
  return fetchData(`${API_BASE_URL}/tags`);
};

export const createTag = (tagData) => {
  return fetchData(`${API_BASE_URL}/tag/create`, {
    method: 'POST',
    body: JSON.stringify(tagData),
  });
};

export const addTagToDocument = (documentId, tagId) => {
  return fetchData(`${API_BASE_URL}/document/${documentId}/tag/${tagId}`, {
    method: 'POST',
  });
};

export const removeTagFromDocument = (documentId, tagId) => {
  return fetchData(`${API_BASE_URL}/document/${documentId}/tag/${tagId}`, {
    method: 'DELETE',
  });
};