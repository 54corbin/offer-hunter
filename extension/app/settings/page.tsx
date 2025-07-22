"use client";

import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../storageService';

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [lockoutDelay, setLockoutDelay] = useState(0); // 0 for immediate

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) {
        setApiKey(profile.apiKey || "");
        setAutoFillEnabled(profile.settings?.autoFillEnabled ?? true);
        setAiRecommendationsEnabled(profile.settings?.aiRecommendationsEnabled ?? true);
        setPasscodeEnabled(profile.settings?.passcodeEnabled ?? false);
        setLockoutDelay(profile.settings?.lockoutDelay ?? 0);
      }
    });
  }, []);

  const handleSave = () => {
    getUserProfile().then(profile => {
      let newPasscode;
      if (passcodeEnabled) {
        // Only validate and update passcode if a new one is entered
        if (passcode || confirmPasscode) {
          if (passcode.length !== 4 || confirmPasscode.length !== 4) {
            setPasscodeError("Passcode must be 4 digits.");
            return;
          }
          if (passcode !== confirmPasscode) {
            setPasscodeError("Passcodes do not match.");
            return;
          }
          newPasscode = passcode;
        }
      }

      const newProfile = {
        ...profile,
        apiKey: apiKey || profile.apiKey, // Keep old API key if new one is empty
        settings: {
          ...profile.settings,
          autoFillEnabled,
          aiRecommendationsEnabled,
          passcodeEnabled,
          // Only include passcode for hashing if it's being updated
          passcode: newPasscode,
          lockoutDelay,
        }
      };

      // If a new passcode wasn't entered, ensure we don't send an empty one
      if (!newPasscode) {
        delete newProfile.settings.passcode;
      }

      saveUserProfile(newProfile).then(() => {
        alert("Settings saved!");
        // Clear passcode fields after successful save
        setPasscode("");
        setConfirmPasscode("");
        setPasscodeError("");
      });
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings</h1>
      <div>
        <label htmlFor="apiKey">LLM API Key:</label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: '300px', marginLeft: '10px' }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={autoFillEnabled}
            onChange={(e) => setAutoFillEnabled(e.target.checked)}
          />
          Enable Auto-fill
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={aiRecommendationsEnabled}
            onChange={(e) => setAiRecommendationsEnabled(e.target.checked)}
          />
          Enable AI Recommendations
        </label>
      </div>

      <h2 style={{ marginTop: '20px' }}>Passcode Settings</h2>
      <div style={{ marginTop: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={passcodeEnabled}
            onChange={(e) => setPasscodeEnabled(e.target.checked)}
          />
          Enable Passcode
        </label>
      </div>

      {passcodeEnabled && (
        <div style={{ marginTop: '10px' }}>
          <div>
            <label htmlFor="passcode">Passcode (4 digits):</label>
            <input
              type="password"
              id="passcode"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{ width: '80px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="confirmPasscode">Confirm Passcode:</label>
            <input
              type="password"
              id="confirmPasscode"
              maxLength={4}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              style={{ width: '80px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="lockoutDelay">Lock after:</label>
            <select
              id="lockoutDelay"
              value={lockoutDelay}
              onChange={(e) => setLockoutDelay(Number(e.target.value))}
              style={{ marginLeft: '10px' }}
            >
              <option value={0}>Immediately</option>
              <option value={60000}>1 Minute</option>
              <option value={300000}>5 Minutes</option>
              <option value={900000}>15 Minutes</option>
            </select>
          </div>
          {passcodeError && <p style={{ color: 'red' }}>{passcodeError}</p>}
        </div>
      )}

      <button onClick={handleSave} style={{ marginTop: '20px' }}>Save Settings</button>
    </div>
  );
};

export default SettingsPage;
