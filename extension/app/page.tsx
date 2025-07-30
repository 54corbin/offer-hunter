"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateContent } from './llmService';
import { getUserProfile, saveUserProfile } from './storageService';
import PasscodeComponent from './passcode/PasscodeComponent';
import CryptoJS from 'crypto-js';
import Layout from './components/Layout';
import JobsPage from './jobs/page';
import HistoryPage from './history/page';
import SettingsPage from './settings/page';

const ProfilePage = dynamic(() => import('./profile/page'), { ssr: false });

const HomePage = () => {
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [storedPasscodeHash, setStoredPasscodeHash] = useState(null);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile?.settings?.passcodeEnabled && profile?.settings?.passcodeHash) {
        const { lastActiveTime, lockoutDelay } = profile.settings;
        if (lockoutDelay === 0 || !lastActiveTime || (Date.now() - lastActiveTime > lockoutDelay)) {
          setIsLocked(true);
        }
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
      getUserProfile().then(profile => {
        const newProfile = {
          ...profile,
          settings: {
            ...profile.settings,
            lastActiveTime: Date.now(),
          }
        };
        saveUserProfile(newProfile);
      });
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

  const renderContent = (activeTab) => {
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
    <>
      {isLocked && <PasscodeComponent onUnlock={handleUnlock} />}
      <div className={isLocked ? 'blur-sm' : ''}>
        <Layout>
          {(activeTab) => (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <button 
                  onClick={handleGenerateCoverLetter} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Generate Cover Letter
                </button>
              </div>
              {renderContent(activeTab)}
            </>
          )}
        </Layout>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-3/4 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Generated Cover Letter</h3>
            <p className="whitespace-pre-wrap">{coverLetter}</p>
            <button 
              onClick={() => setShowModal(false)} 
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
