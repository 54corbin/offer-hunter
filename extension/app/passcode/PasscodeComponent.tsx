"use client";

import React, { useState } from 'react';

const PasscodeComponent = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handlePasscodeChange = (e) => {
    setPasscode(e.target.value);
    setError(""); // Clear error on input change
  };

  const handleSubmit = () => {
    onUnlock(passcode);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      }}>
        <h2>Enter Passcode</h2>
        <input
          type="password"
          maxLength={4}
          value={passcode}
          onChange={handlePasscodeChange}
          style={{
            padding: '10px',
            fontSize: '24px',
            textAlign: 'center',
            width: '150px',
            marginBottom: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Unlock
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default PasscodeComponent;
