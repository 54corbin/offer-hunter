import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HistoryPage from './pages/HistoryPage';
import JobsPage from './pages/JobsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DesignSystemPage from './pages/DesignSystemPage';
import PasscodeComponent from './components/passcode/PasscodeComponent';
import { getUserProfile, saveUserProfile } from './services/storageService';
import CryptoJS from 'crypto-js';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  const [storedPasscodeHash, setStoredPasscodeHash] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile?.settings?.passcodeEnabled && profile?.settings?.passcodeHash) {
        const { lastActiveTime, lockoutDelay } = profile.settings;
        if ((lockoutDelay ?? 0) === 0 || !lastActiveTime || (Date.now() - lastActiveTime > (lockoutDelay ?? 0))) {
          setIsLocked(true);
        }
        setStoredPasscodeHash(profile.settings.passcodeHash);
      } else {
        setIsLocked(false);
      }
    });
  }, []);

  const handleUnlock = (enteredPasscode: string) => {
    if (enteredPasscode.length < 4) return; 
    const hashedEnteredPasscode = CryptoJS.SHA256(enteredPasscode).toString();
    if (hashedEnteredPasscode === storedPasscodeHash) {
      setIsLocked(false);
      setPasscodeError(false);
      getUserProfile().then(profile => {
        if (profile) {
          const newProfile = {
            ...profile,
            settings: {
              ...profile.settings,
              lastActiveTime: Date.now(),
            }
          };
          saveUserProfile(newProfile);
        }
      });
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 600);
    }
  };

  return (
    <>
      {isLocked && <PasscodeComponent onUnlock={handleUnlock} isError={passcodeError} />}
      <div className={isLocked ? 'blur-sm' : '' }>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </>
  );
};

export default App;
