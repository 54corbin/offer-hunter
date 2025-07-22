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

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile().then(storedProfile => {
      setProfile(storedProfile || defaultProfile);
    });
  }, []);

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
    saveUserProfile(newProfile);
  };

  const addEntry = (section) => {
    const newProfile = { ...profile };
    newProfile[section].push({});
    setProfile(newProfile);
    // Note: You might want to save only on remove or input change to avoid saving an empty object immediately.
    saveUserProfile(newProfile);
  };

  const removeEntry = (section, index) => {
    const newProfile = { ...profile };
    newProfile[section].splice(index, 1);
    setProfile(newProfile);
    saveUserProfile(newProfile);
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
      setProfile(extractedProfile);
      saveUserProfile(extractedProfile);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Profile Management</h2>

      <section>
        <h3>Upload Resume</h3>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      </section>

      <section>
        <h3>Personal Information</h3>
        <input
          type="text"
          placeholder="Name"
          value={profile.personalInfo?.name || ''}
          onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'name')}
        />
        <input
          type="email"
          placeholder="Email"
          value={profile.personalInfo?.email || ''}
          onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'email')}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={profile.personalInfo?.phone || ''}
          onChange={(e) => handleInputChange(e.target.value, 'personalInfo', null, 'phone')}
        />
      </section>

      <section>
        <h3>Work Experience</h3>
        {profile.experience?.map((exp, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Company"
              value={exp.company || ''}
              onChange={(e) => handleInputChange(e.target.value, 'experience', index, 'company')}
            />
            <input
              type="text"
              placeholder="Title"
              value={exp.title || ''}
              onChange={(e) => handleInputChange(e.target.value, 'experience', index, 'title')}
            />
            <button onClick={() => removeEntry('experience', index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => addEntry('experience')}>Add Experience</button>
      </section>

      <section>
        <h3>Education</h3>
        {profile.education?.map((edu, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Institution"
              value={edu.institution || ''}
              onChange={(e) => handleInputChange(e.target.value, 'education', index, 'institution')}
            />
            <input
              type="text"
              placeholder="Degree"
              value={edu.degree || ''}
              onChange={(e) => handleInputChange(e.target.value, 'education', index, 'degree')}
            />
            <button onClick={() => removeEntry('education', index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => addEntry('education')}>Add Education</button>
      </section>

      <section>
        <h3>Skills</h3>
        <textarea
          placeholder="Skills (comma-separated)"
          value={profile.skills?.join(', ') || ''}
          onChange={(e) => handleInputChange(e.target.value.split(',').map(s => s.trim()), null, null, 'skills')}
        />
      </section>
    </div>
  );
};

export default ProfilePage;

