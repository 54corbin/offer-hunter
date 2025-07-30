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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      
      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">LLM API Key:</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center">
          <input
            id="autoFill"
            type="checkbox"
            checked={autoFillEnabled}
            onChange={(e) => setAutoFillEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoFill" className="ml-2 block text-sm text-gray-900">
            Enable Auto-fill
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="aiRecommendations"
            type="checkbox"
            checked={aiRecommendationsEnabled}
            onChange={(e) => setAiRecommendationsEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="aiRecommendations" className="ml-2 block text-sm text-gray-900">
            Enable AI Recommendations
          </label>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold">Passcode Settings</h2>
        <div className="flex items-center">
          <input
            id="passcodeEnabled"
            type="checkbox"
            checked={passcodeEnabled}
            onChange={(e) => setPasscodeEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="passcodeEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Passcode
          </label>
        </div>

        {passcodeEnabled && (
          <div className="space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">Passcode (4 digits):</label>
              <input
                type="password"
                id="passcode"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPasscode" className="block text-sm font-medium text-gray-700">Confirm Passcode:</label>
              <input
                type="password"
                id="confirmPasscode"
                maxLength={4}
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lockoutDelay" className="block text-sm font-medium text-gray-700">Lock after:</label>
              <select
                id="lockoutDelay"
                value={lockoutDelay}
                onChange={(e) => setLockoutDelay(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={0}>Immediately</option>
                <option value={60000}>1 Minute</option>
                <option value={300000}>5 Minutes</option>
                <option value={900000}>15 Minutes</option>
              </select>
            </div>
            {passcodeError && <p className="text-sm text-red-600">{passcodeError}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={handleSave} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save Settings
        </button>
        <a href="/privacy" className="text-sm text-blue-600 hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default SettingsPage;
