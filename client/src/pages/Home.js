import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to DocFinde</h1>
      <Link to="/uploads">Upload Document</Link>
      <Link to="/documentss">View Documents</Link>
    </div>
  );
}

export default Home;
