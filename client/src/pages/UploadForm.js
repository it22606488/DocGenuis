import React, { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/documentsd",
        formData
      );
      alert("File uploaded successfully!");
      console.log(formData);
      console.log(response.data._id);

      await axios.post(
        `http://localhost:5000/app/version/${response.data._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      alert("File uploaded failed!");
    }
  };

  return (
    <div className="flex bg-blue-700 min-h-screen justify-center items-center">
      <h2>Upload a Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default UploadForm;
