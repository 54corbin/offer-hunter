"use client";

import React, { useEffect, useState } from 'react';
import { getUserProfile, saveUserProfile } from '../storageService';
import { extractProfileFromResume } from '../llmService';

const defaultProfile = {
  personalInfo: { name: '', email: '', phone: '' },
  experience: [],
  education: [],
  skills: [],
};

const mergeProfiles = (base, incoming) => {
  const merged = { ...base, ...(incoming || {}) };

  merged.personalInfo = {
    ...base.personalInfo,
    ...(incoming?.personalInfo || {}),
  };

  merged.experience = incoming?.experience || base.experience;
  merged.education = incoming?.education || base.education;
  merged.skills = incoming?.skills || base.skills;

  return merged;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile().then(storedProfile => {
      setProfile(mergeProfiles(defaultProfile, storedProfile));
    });
  }, []);

  useEffect(() => {
    if (profile) {
      saveUserProfile(profile);
    }
  }, [profile]);

  const handleInputChange = (value, section, index, field) => {
    const newProfile = { ...profile };

    if (section) {
      if (index !== null) {
        newProfile[section][index][field] = value;
      } else {
        newProfile[section] = { ...newProfile[section], [field]: value };
      }
    } else {
      newProfile[field] = value;
    }

    setProfile(newProfile);
  };

  const addEntry = (section) => {
    const newProfile = { ...profile };
    newProfile[section].push({});
    setProfile(newProfile);
  };

  const removeEntry = (section, index) => {
    const newProfile = { ...profile };
    newProfile[section].splice(index, 1);
    setProfile(newProfile);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const script = document.createElement('script');
      script.src = '/scripts/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/scripts/pdf.worker.min.js';
        const reader = new FileReader();
        reader.onload = async (event) => {
          const pdf = await pdfjsLib.getDocument({ data: event.target.result }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => ('str' in item ? item.str : '')).join(' ');
          }
          parseResumeText(text);
        };
        reader.readAsArrayBuffer(file);
      };
      document.body.appendChild(script);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const script = document.createElement('script');
      script.src = '/scripts/mammoth.browser.min.js';
      script.onload = () => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target.result instanceof ArrayBuffer) {
            const result = await window.mammoth.extractRawText({ arrayBuffer: event.target.result });
            const text = result.value;
            parseResumeText(text);
          }
        };
        reader.readAsArrayBuffer(file);
      };
      document.body.appendChild(script);
    }
  };

  const parseResumeText = async (text) => {
    const extractedProfile = await extractProfileFromResume(text);
    if (extractedProfile) {
      setProfile(currentProfile => mergeProfiles(currentProfile || defaultProfile, extractedProfile));
    }
  };

  if (!profile) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Profile Management</h2>

      <section className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Upload Resume</h3>
        <input 
          type="file" 
          accept=".pdf,.docx" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </section>

      <section className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={profile.personalInfo?.name || ''}
            onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'name')}
            className="p-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            value={profile.personalInfo?.email || ''}
            onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'email')}
            className="p-2 border rounded-md"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={profile.personalInfo?.phone || ''}
            onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'phone')}
            className="p-2 border rounded-md"
          />
        </div>
      </section>

      <section className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
        {profile.experience?.map((exp, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
            <input
              type="text"
              placeholder="Company"
              value={exp.company || ''}
              onChange={(e) => handleInputChange(e.target.value, 'experience', index, 'company')}
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Title"
              value={exp.title || ''}
              onChange={(e) => handleInputChange(e.target.value, 'experience', index, 'title')}
              className="p-2 border rounded-md"
            />
            <button onClick={() => removeEntry('experience', index)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Remove</button>
          </div>
        ))}
        <button onClick={() => addEntry('experience')} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Add Experience</button>
      </section>

      <section className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Education</h3>
        {profile.education?.map((edu, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
            <input
              type="text"
              placeholder="Institution"
              value={edu.institution || ''}
              onChange={(e) => handleInputChange(e.target.value, 'education', index, 'institution')}
              className="p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Degree"
              value={edu.degree || ''}
              onChange={(e) => handleInputChange(e.target.value, 'education', index, 'degree')}
              className="p-2 border rounded-md"
            />
            <button onClick={() => removeEntry('education', index)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Remove</button>
          </div>
        ))}
        <button onClick={() => addEntry('education')} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Add Education</button>
      </section>

      <section className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Skills</h3>
        <textarea
          placeholder="Skills (comma-separated)"
          value={profile.skills?.join(', ') || ''}
          onChange={(e) => handleInputChange(e.target.value.split(',').map(s => s.trim()), null, null, 'skills')}
          className="w-full p-2 border rounded-md"
        />
      </section>
    </div>
  );
};

export default ProfilePage;

