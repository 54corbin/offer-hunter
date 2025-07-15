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

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) {
        setApiKey(profile.apiKey || "");
        setAutoFillEnabled(profile.settings?.autoFillEnabled ?? true);
        setAiRecommendationsEnabled(profile.settings?.aiRecommendationsEnabled ?? true);
        setPasscodeEnabled(profile.settings?.passcodeEnabled ?? false);
      }
    });
  }, []);

  const handleSave = () => {
    if (passcodeEnabled) {
      if (passcode.length !== 4 || confirmPasscode.length !== 4) {
        setPasscodeError("Passcode must be 4 digits.");
        return;
      }
      if (passcode !== confirmPasscode) {
        setPasscodeError("Passcodes do not match.");
        return;
      }
    }

    getUserProfile().then(profile => {
      const newProfile = {
        ...profile,
        apiKey,
        settings: {
          autoFillEnabled,
          aiRecommendationsEnabled,
          passcodeEnabled,
          passcode: passcodeEnabled ? passcode : undefined, // Pass passcode only if enabled
        }
      };
      saveUserProfile(newProfile).then(() => {
        alert("Settings saved!");
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
          {passcodeError && <p style={{ color: 'red' }}>{passcodeError}</p>}
        </div>
      )}

      <button onClick={handleSave} style={{ marginTop: '20px' }}>Save Settings</button>
    </div>
  );
};

export default SettingsPage;
