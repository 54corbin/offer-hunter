"use client";

import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../storageService';

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) {
        setApiKey(profile.apiKey || "");
        setAutoFillEnabled(profile.settings?.autoFillEnabled ?? true);
        setAiRecommendationsEnabled(profile.settings?.aiRecommendationsEnabled ?? true);
      }
    });
  }, []);

  const handleSave = () => {
    getUserProfile().then(profile => {
      const newProfile = {
        ...profile,
        apiKey,
        settings: {
          autoFillEnabled,
          aiRecommendationsEnabled
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
      <button onClick={handleSave} style={{ marginTop: '20px' }}>Save Settings</button>
    </div>
  );
};

export default SettingsPage;
