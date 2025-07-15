"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import JobsPage from './jobs/page';
import HistoryPage from './history/page';
import SettingsPage from './settings/page';
import { generateContent } from './llmService';
import { getUserProfile } from './storageService';
import PasscodePage from './passcode/PasscodeComponent';
import CryptoJS from 'crypto-js';

const ProfilePage = dynamic(() => import('./profile/page'), { ssr: false });

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [storedPasscodeHash, setStoredPasscodeHash] = useState(null);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile?.settings?.passcodeEnabled && profile?.settings?.passcodeHash) {
        setIsLocked(true);
        setStoredPasscodeHash(profile.settings.passcodeHash);
      } else {
        setIsLocked(false);
      }
    });
  }, []);

  const handleUnlock = (enteredPasscode) => {
    const hashedEnteredPasscode = CryptoJS.SHA256(enteredPasscode).toString();
    if (hashedEnteredPasscode === storedPasscodeHash) {
      setIsLocked(false);
    } else {
      alert("Incorrect passcode.");
    }
  };

  const handleGenerateCoverLetter = async () => {
    const profile = await getUserProfile();
    // This is a placeholder for getting job details from the content script
    const jobDetails = { title: "Software Engineer", description: "We are looking for a skilled software engineer..." };
    const prompt = `Based on my profile (${JSON.stringify(profile)}) and the job description (${JSON.stringify(jobDetails)}), write a professional cover letter.`;
    
    const generatedLetter = await generateContent(prompt);
    setCoverLetter(generatedLetter);
    setShowModal(true);
  };

  const renderContent = () => {
    if (isLocked) {
      return <PasscodePage onUnlock={handleUnlock} />;
    }

    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'jobs':
        return <JobsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h2>Offer Hunter</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => setActiveTab('profile')}>Profile</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => setActiveTab('jobs')}>Recommended Jobs</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => setActiveTab('history')}>Application History</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => setActiveTab('settings')}>Settings</a></li>
          </ul>
        </nav>
        <button onClick={handleGenerateCoverLetter} style={{ marginTop: '20px' }}>Generate Cover Letter</button>
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        {renderContent()}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', width: '80%', maxHeight: '80%', overflowY: 'auto' }}>
            <h3>Generated Cover Letter</h3>
            <p>{coverLetter}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
