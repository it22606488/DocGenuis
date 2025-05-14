import React, { useEffect, useState } from "react";
import axios from "axios";
import DocumentItem from "../components/DocumentItemm";
import{Link} from "react-router-dom";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);

  // Fetch documents from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/documentsd")
      .then((response) => {
        setDocuments(response.data);
      })

      .catch((error) => {
        console.error("Error fetching documents", error);
      });
  }, []);
  console.log(documents);
  // Handle document deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documentsd/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };

  return (
    <div>
      <Link to="/uploads">
        Upload New Document
      </Link>
      <h2>Document List</h2>
      {documents.map((doc) => (
        <DocumentItem key={doc._id} doc={doc} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default DocumentList;
