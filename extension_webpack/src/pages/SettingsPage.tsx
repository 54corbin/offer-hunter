import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile, saveUserProfile, UserProfile, ApiProvider } from '../services/storageService';
import { listModels } from '../services/llmService';
import { FiSave, FiKey, FiToggleLeft, FiToggleRight, FiLock, FiPlus, FiTrash2, FiCpu, FiDownloadCloud } from 'react-icons/fi';
import { ConfirmModal } from '../components/ConfirmModal';

interface SettingsPageProps {
  onSettingsSave: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsSave }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: () => {} });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUserProfile().then(p => {
      if (p) {
        if (!p.settings.apiProviders) p.settings.apiProviders = [];
        if (!p.settings.activeAiProviderId && p.settings.apiProviders.length > 0) {
          p.settings.activeAiProviderId = p.settings.apiProviders[0].id;
        }
        setProfile(p);
      } else {
        const newProfile: UserProfile = {
          personalInfo: { name: '', email: '', phone: '' },
          experience: [],
          education: [],
          skills: [],
          resumes: [],
          settings: {
            passcodeEnabled: false,
            apiProviders: [],
          },
        };
        setProfile(newProfile);
      }
    });
  }, []);

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModalContent({ title, message, onConfirm: onConfirm || (() => setIsModalOpen(false)) });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (profile) {
      if (!profile.settings.activeAiProviderId || profile.settings.apiProviders?.length === 0) {
        showModal("AI Provider Required", "Please add and set an active AI provider before saving.");
        return;
      }

      let profileToSave = { ...profile };
      if (profile.settings.passcodeEnabled) {
        if (passcode || confirmPasscode) {
          if (passcode.length !== 4 || confirmPasscode.length !== 4) {
            setPasscodeError("Passcode must be 4 digits.");
            return;
          }
          if (passcode !== confirmPasscode) {
            setPasscodeError("Passcodes do not match.");
            return;
          }
          profileToSave.settings.passcode = passcode;
        }
      } else {
        delete profileToSave.settings.passcode;
      }

      saveUserProfile(profileToSave).then(() => {
        showModal("Success", "Settings saved!");
        setPasscode("");
        setConfirmPasscode("");
        setPasscodeError("");
        onSettingsSave();
      });
    }
  };

  const handleProviderChange = (index: number, field: keyof ApiProvider, value: string) => {
    if (profile) {
      const newProviders = [...(profile.settings.apiProviders || [])];
      newProviders[index] = { ...newProviders[index], [field]: value };
      setProfile({ ...profile, settings: { ...profile.settings, apiProviders: newProviders } });
    }
  };

  const addProvider = () => {
    if (profile) {
      const newProvider: ApiProvider = { id: new Date().toISOString(), name: 'OpenAI', model: 'gpt-4o-mini', apiKey: '' };
      const newProviders = [...(profile.settings.apiProviders || []), newProvider];
      const newSettings = { ...profile.settings, apiProviders: newProviders };
      if (newProviders.length === 1) {
        newSettings.activeAiProviderId = newProvider.id;
      }
      setProfile({ ...profile, settings: newSettings });
    }
  };

  const removeProvider = (index: number) => {
    if (profile && profile.settings.apiProviders) {
      const provider = profile.settings.apiProviders[index];
      showModal(
        'Confirm Removal',
        `Are you sure you want to remove the provider "${provider.name}"?`,
        () => {
          if (profile && profile.settings.apiProviders) {
            const newProviders = [...profile.settings.apiProviders];
            newProviders.splice(index, 1);
            const newSettings = { ...profile.settings, apiProviders: newProviders };
            if (profile.settings.activeAiProviderId === provider.id) {
              newSettings.activeAiProviderId = newProviders.length > 0 ? newProviders[0].id : undefined;
            }
            setProfile({ ...profile, settings: newSettings });
          }
        }
      );
    }
  };
  
  const setActiveProvider = (id: string) => {
    if (profile) {
      setProfile({ ...profile, settings: { ...profile.settings, activeAiProviderId: id } });
    }
  };

  const handleToggleChange = (field: keyof UserProfile['settings'], value: boolean) => {
    if (profile) {
      setProfile({ ...profile, settings: { ...profile.settings, [field]: value } });
    }
  };

  const handleLockoutDelayChange = (value: number) => {
    if (profile) {
      setProfile({ ...profile, settings: { ...profile.settings, lockoutDelay: value } });
    }
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

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-bold text-slate-800">Settings</h1>
      
      <div className="p-8 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg space-y-6">
        <h2 className="text-3xl font-semibold text-slate-800 flex items-center"><FiKey className="mr-3 text-slate-500" />AI Provider Settings</h2>
        
        {profile.settings.apiProviders?.map((provider, index) => (
          <div key={provider.id} className="p-4 border border-slate-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={provider.name} onChange={(e) => handleProviderChange(index, 'name', e.target.value)} className="p-3 bg-white/50 border border-slate-300 rounded-xl">
                <option value="OpenAI">OpenAI</option>
                <option value="Gemini">Gemini</option>
              </select>
              <input type="password" placeholder="API Key" value={provider.apiKey} onChange={(e) => handleProviderChange(index, 'apiKey', e.target.value)} className="p-3 bg-white/50 border border-slate-300 rounded-xl" />
              <div className="col-span-2 flex items-center gap-2">
                <select value={provider.model} onChange={(e) => handleProviderChange(index, 'model', e.target.value)} className="p-3 w-full bg-white/50 border border-slate-300 rounded-xl">
                  {provider.name === 'OpenAI' ? (
                    <>
                      <option value="gpt-4-0613">gpt-4-0613</option>
                      <option value="gpt-4">gpt-4</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      <option value="gpt-5-nano">gpt-5-nano</option>
                      <option value="gpt-5">gpt-5</option>
                      <option value="gpt-5-mini-2025-08-07">gpt-5-mini-2025-08-07</option>
                      <option value="gpt-5-mini">gpt-5-mini</option>
                      <option value="gpt-5-nano-2025-08-07">gpt-5-nano-2025-08-07</option>
                      <option value="davinci-002">davinci-002</option>
                      <option value="babbage-002">babbage-002</option>
                      <option value="gpt-3.5-turbo-instruct">gpt-3.5-turbo-instruct</option>
                      <option value="gpt-3.5-turbo-instruct-0914">gpt-3.5-turbo-instruct-0914</option>
                      <option value="dall-e-3">dall-e-3</option>
                      <option value="dall-e-2">dall-e-2</option>
                      <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
                      <option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</option>
                      <option value="tts-1-hd">tts-1-hd</option>
                      <option value="tts-1-1106">tts-1-1106</option>
                      <option value="tts-1-hd-1106">tts-1-hd-1106</option>
                      <option value="text-embedding-3-small">text-embedding-3-small</option>
                      <option value="text-embedding-3-large">text-embedding-3-large</option>
                      <option value="gpt-4-0125-preview">gpt-4-0125-preview</option>
                      <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
                      <option value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</option>
                      <option value="gpt-4-turbo">gpt-4-turbo</option>
                      <option value="gpt-4-turbo-2024-04-09">gpt-4-turbo-2024-04-09</option>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-2024-05-13">gpt-4o-2024-05-13</option>
                      <option value="gpt-4o-mini-2024-07-18">gpt-4o-mini-2024-07-18</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-4o-2024-08-06">gpt-4o-2024-08-06</option>
                      <option value="chatgpt-4o-latest">chatgpt-4o-latest</option>
                      <option value="o1-mini-2024-09-12">o1-mini-2024-09-12</option>
                      <option value="o1-mini">o1-mini</option>
                      <option value="gpt-4o-realtime-preview-2024-10-01">gpt-4o-realtime-preview-2024-10-01</option>
                      <option value="gpt-4o-audio-preview-2024-10-01">gpt-4o-audio-preview-2024-10-01</option>
                      <option value="gpt-4o-audio-preview">gpt-4o-audio-preview</option>
                      <option value="gpt-4o-realtime-preview">gpt-4o-realtime-preview</option>
                      <option value="omni-moderation-latest">omni-moderation-latest</option>
                      <option value="omni-moderation-2024-09-26">omni-moderation-2024-09-26</option>
                      <option value="gpt-4o-realtime-preview-2024-12-17">gpt-4o-realtime-preview-2024-12-17</option>
                      <option value="gpt-4o-audio-preview-2024-12-17">gpt-4o-audio-preview-2024-12-17</option>
                      <option value="gpt-4o-mini-realtime-preview-2024-12-17">gpt-4o-mini-realtime-preview-2024-12-17</option>
                      <option value="gpt-4o-mini-audio-preview-2024-12-17">gpt-4o-mini-audio-preview-2024-12-17</option>
                      <option value="o1-2024-12-17">o1-2024-12-17</option>
                      <option value="o1">o1</option>
                      <option value="gpt-4o-mini-realtime-preview">gpt-4o-mini-realtime-preview</option>
                      <option value="gpt-4o-mini-audio-preview">gpt-4o-mini-audio-preview</option>
                      <option value="computer-use-preview">computer-use-preview</option>
                      <option value="o3-mini">o3-mini</option>
                      <option value="o3-mini-2025-01-31">o3-mini-2025-01-31</option>
                      <option value="gpt-4o-2024-11-20">gpt-4o-2024-11-20</option>
                      <option value="computer-use-preview-2025-03-11">computer-use-preview-2025-03-11</option>
                      <option value="gpt-4o-search-preview-2025-03-11">gpt-4o-search-preview-2025-03-11</option>
                      <option value="gpt-4o-search-preview">gpt-4o-search-preview</option>
                      <option value="gpt-4o-mini-search-preview-2025-03-11">gpt-4o-mini-search-preview-2025-03-11</option>
                      <option value="gpt-4o-mini-search-preview">gpt-4o-mini-search-preview</option>
                      <option value="gpt-4o-transcribe">gpt-4o-transcribe</option>
                      <option value="gpt-4o-mini-transcribe">gpt-4o-mini-transcribe</option>
                      <option value="o1-pro-2025-03-19">o1-pro-2025-03-19</option>
                      <option value="o1-pro">o1-pro</option>
                      <option value="gpt-4o-mini-tts">gpt-4o-mini-tts</option>
                      <option value="o3-2025-04-16">o3-2025-04-16</option>
                      <option value="o4-mini-2025-04-16">o4-mini-2025-04-16</option>
                      <option value="o3">o3</option>
                      <option value="o4-mini">o4-mini</option>
                      <option value="gpt-4.1-2025-04-14">gpt-4.1-2025-04-14</option>
                      <option value="gpt-4.1">gpt-4.1</option>
                      <option value="gpt-4.1-mini-2025-04-14">gpt-4.1-mini-2025-04-14</option>
                      <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                      <option value="gpt-4.1-nano-2025-04-14">gpt-4.1-nano-2025-04-14</option>
                      <option value="gpt-4.1-nano">gpt-4.1-nano</option>
                      <option value="gpt-image-1">gpt-image-1</option>
                      <option value="codex-mini-latest">codex-mini-latest</option>
                      <option value="gpt-4o-realtime-preview-2025-06-03">gpt-4o-realtime-preview-2025-06-03</option>
                      <option value="gpt-4o-audio-preview-2025-06-03">gpt-4o-audio-preview-2025-06-03</option>
                      <option value="o4-mini-deep-research">o4-mini-deep-research</option>
                      <option value="o4-mini-deep-research-2025-06-26">o4-mini-deep-research-2025-06-26</option>
                      <option value="gpt-5-chat-latest">gpt-5-chat-latest</option>
                      <option value="gpt-5-2025-08-07">gpt-5-2025-08-07</option>
                      <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
                      <option value="tts-1">tts-1</option>
                      <option value="whisper-1">whisper-1</option>
                      <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                    </>
                  ) : (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                      <option value="gemini-1.0-pro">gemini-1.0-pro</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setActiveProvider(provider.id)} disabled={profile.settings.activeAiProviderId === provider.id} className="text-sm text-blue-500 disabled:text-gray-400">
                {profile.settings.activeAiProviderId === provider.id ? 'Active' : 'Set as Active'}
              </button>
              <button onClick={() => removeProvider(index)} className="text-red-500"><FiTrash2 /></button>
            </div>
          </div>
        ))}
        
        <button onClick={addProvider} className="flex items-center text-blue-500"><FiPlus className="mr-2" />Add Provider</button>
        
      </div>

      <div className="p-8 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg space-y-6">
        <h2 className="text-3xl font-semibold text-slate-800 flex items-center"><FiLock className="mr-3 text-slate-500" />Passcode Settings</h2>
        <Toggle enabled={profile.settings.passcodeEnabled} onChange={(val) => handleToggleChange('passcodeEnabled', val)} label="Enable Passcode" Icon={profile.settings.passcodeEnabled ? FiToggleRight : FiToggleLeft} />
        
        {profile.settings.passcodeEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-slate-700">New Passcode (.4 digits):</label>
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
                value={profile.settings.lockoutDelay}
                onChange={(e) => handleLockoutDelayChange(Number(e.target.value))}
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
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalContent.onConfirm}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
};

export default SettingsPage;
