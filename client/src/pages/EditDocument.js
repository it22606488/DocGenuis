import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditDocument() {
  const { id } = useParams();
  const [file, setFile] = useState(null);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await axios.put(`http://localhost:5000/api/documentsd/${id}`, formData);
    alert("File updated successfully!");
  };

  return (
    <div>
      <h2>Edit Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}

export default EditDocument;
