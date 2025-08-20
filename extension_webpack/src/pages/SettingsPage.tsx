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
  const [modelLists, setModelLists] = useState<{[key: string]: string[]}>({});
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
            autoFillEnabled: true,
            aiRecommendationsEnabled: true,
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

  const handleFetchModels = async (provider: ApiProvider) => {
    if (!provider.apiKey) {
      showModal("API Key Required", "Please enter an API key first.");
      return;
    }
    const models = await listModels(provider);
    if (models) {
      setModelLists(prev => ({ ...prev, [provider.id]: models }));
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
              <input type="password" placeholder="API Key" value={provider.apiKey} onChange={(e) => handleProviderChange(index, 'apiKey', e.target.value)} onBlur={() => handleFetchModels(provider)} className="p-3 bg-white/50 border border-slate-300 rounded-xl" />
              <div className="col-span-2 flex items-center gap-2">
                <select value={provider.model} onChange={(e) => handleProviderChange(index, 'model', e.target.value)} className="p-3 w-full bg-white/50 border border-slate-300 rounded-xl">
                  {modelLists[provider.id] ? (
                    modelLists[provider.id].map(model => <option key={model} value={model}>{model}</option>)
                  ) : (
                    <option value={provider.model}>{provider.model}</option>
                  )}
                </select>
                <button onClick={() => handleFetchModels(provider)} className="p-3 bg-blue-500 text-white rounded-xl"><FiDownloadCloud /></button>
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
