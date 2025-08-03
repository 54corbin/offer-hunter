import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, saveUserProfile, UserProfile } from '../services/storageService';
import { FiSave, FiKey, FiToggleLeft, FiToggleRight, FiLock } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [lockoutDelay, setLockoutDelay] = useState(0);

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

      const newProfile: UserProfile = {
        ...(profile || {
          personalInfo: { name: '', email: '', phone: '' },
          experience: [],
          education: [],
          skills: [],
          apiKey: '',
          settings: {
            autoFillEnabled: true,
            aiRecommendationsEnabled: true,
            passcodeEnabled: false,
          }
        }),
        apiKey: apiKey || profile?.apiKey || '',
        settings: {
          ...(profile?.settings || {}),
          autoFillEnabled,
          aiRecommendationsEnabled,
          passcodeEnabled,
          passcode: newPasscode,
          lockoutDelay,
        }
      };

      if (!newPasscode) {
        delete newProfile.settings.passcode;
      }

      saveUserProfile(newProfile).then(() => {
        alert("Settings saved!");
        setPasscode("");
        setConfirmPasscode("");
        setPasscodeError("");
      });
    });
  };
  
  const Toggle = ({ enabled, onChange, label, Icon }: { enabled: boolean, onChange: (enabled: boolean) => void, label: string, Icon: React.ElementType }) => (
    <div className="flex items-center justify-between">
      <label className="flex items-center text-lg text-slate-700">
        <Icon className="mr-3 text-slate-500" />
        {label}
      </label>
      <button onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-300'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold text-slate-800">Settings</h1>
      
      <div className="p-8 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg space-y-6">
        <div>
          <label htmlFor="apiKey" className="flex items-center text-lg font-medium text-slate-700 mb-2">
            <FiKey className="mr-3 text-slate-500" />
            LLM API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="Enter your API key"
          />
        </div>
        <hr className="border-slate-200" />
        <Toggle enabled={autoFillEnabled} onChange={setAutoFillEnabled} label="Enable Auto-fill" Icon={FiToggleRight} />
        <hr className="border-slate-200" />
        <Toggle enabled={aiRecommendationsEnabled} onChange={setAiRecommendationsEnabled} label="Enable AI Recommendations" Icon={FiToggleRight} />
      </div>

      <div className="p-8 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg space-y-6">
        <h2 className="text-3xl font-semibold text-slate-800 flex items-center"><FiLock className="mr-3 text-slate-500" />Passcode Settings</h2>
        <Toggle enabled={passcodeEnabled} onChange={setPasscodeEnabled} label="Enable Passcode" Icon={passcodeEnabled ? FiToggleRight : FiToggleLeft} />
        
        {passcodeEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-slate-700">New Passcode (4 digits):</label>
              <input
                type="password"
                id="passcode"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1 w-full p-3 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="confirmPasscode" className="block text-sm font-medium text-slate-700">Confirm Passcode:</label>
              <input
                type="password"
                id="confirmPasscode"
                maxLength={4}
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                className="mt-1 w-full p-3 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="lockoutDelay" className="block text-sm font-medium text-slate-700">Lock after inactivity:</label>
              <select
                id="lockoutDelay"
                value={lockoutDelay}
                onChange={(e) => setLockoutDelay(Number(e.target.value))}
                className="mt-1 w-full p-3 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
          className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <FiSave className="mr-2" />
          Save Settings
        </button>
        <Link to="/privacy" className="text-sm text-blue-500 hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default SettingsPage;