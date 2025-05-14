import React from 'react';
import { FaMicrophone, FaUser, FaSearch, FaCog } from 'react-icons/fa';

const IconTest = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Icon Test</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '24px' }}>
        <div>
          <FaMicrophone style={{ color: 'red' }} />
          <p>Microphone</p>
        </div>
        <div>
          <FaSearch style={{ color: 'blue' }} />
          <p>Search</p>
        </div>
        <div>
          <FaUser style={{ color: 'green' }} />
          <p>User</p>
        </div>
        <div>
          <FaCog style={{ color: 'purple' }} />
          <p>Settings</p>
        </div>
      </div>
    </div>
  );
};

export default IconTest; 