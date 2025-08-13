import React, { useState } from 'react';
import { UserProfile, Resume, saveUserProfile } from '../services/storageService';
import { extractProfileFromResume } from '../services/llmService';
import { FiUpload, FiEdit, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';

declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
  }
}

interface ResumeManagerProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ profile, onProfileUpdate }) => {
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const fileData = event.target.result as string;
        
        if (file.type === 'application/pdf') {
          const script = document.createElement('script');
          script.src = 'scripts/pdf.min.js';
          script.onload = () => {
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'scripts/pdf.worker.min.js';
            const loadingTask = pdfjsLib.getDocument({ data: atob(fileData.split(',')[1]) });
            loadingTask.promise.then(async (pdf: any) => {
              let text = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ');
              }
              processResume(file, fileData, text);
            });
          };
          document.body.appendChild(script);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const script = document.createElement('script');
          script.src = 'scripts/mammoth.browser.min.js';
          script.onload = () => {
            const arrayBuffer = new Uint8Array(atob(fileData.split(',')[1]).split('').map(char => char.charCodeAt(0))).buffer;
            window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
              .then((result: any) => {
                processResume(file, fileData, result.value);
              });
          };
          document.body.appendChild(script);
        } else {
          processResume(file, fileData, '');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const processResume = async (file: File, fileData: string, text: string) => {
    const newResume: Resume = {
      id: new Date().toISOString(),
      name: file.name,
      data: fileData,
      text: text,
    };

    const extractedProfile = await extractProfileFromResume(text);
    
    let updatedProfile = { ...profile };
    if (extractedProfile) {
      updatedProfile = {
        ...updatedProfile,
        personalInfo: extractedProfile.personalInfo || updatedProfile.personalInfo,
        experience: extractedProfile.experience || updatedProfile.experience,
        education: extractedProfile.education || updatedProfile.education,
        skills: extractedProfile.skills || updatedProfile.skills,
      };
    }
    
    const updatedResumes = [...(updatedProfile.resumes || []), newResume];
    updatedProfile.resumes = updatedResumes;
    
    onProfileUpdate(updatedProfile);
    await saveUserProfile(updatedProfile);
  };

  const handleRename = (resume: Resume) => {
    setEditingResumeId(resume.id);
    setNewName(resume.name);
  };

  const handleSaveRename = async (resumeId: string) => {
    const updatedResumes = profile.resumes?.map(r =>
      r.id === resumeId ? { ...r, name: newName } : r
    );
    const updatedProfile = { ...profile, resumes: updatedResumes };
    onProfileUpdate(updatedProfile);
    await saveUserProfile(updatedProfile);
    setEditingResumeId(null);
    setNewName('');
  };

  const handleDelete = async (resumeId: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      const updatedResumes = profile.resumes?.filter(r => r.id !== resumeId);
      const updatedProfile = { ...profile, resumes: updatedResumes };
      onProfileUpdate(updatedProfile);
      await saveUserProfile(updatedProfile);
    }
  };

  return (
    <section className="p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-4 text-slate-700">Manage Resumes</h3>
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer">
          <FiUpload className="mr-2" />
          <span>Upload New Resume</span>
          <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      <div className="space-y-2">
        {profile.resumes?.map(resume => (
          <div key={resume.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            {editingResumeId === resume.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="p-1 border border-slate-300 rounded-lg"
              />
            ) : (
              <span className="text-slate-700">{resume.name}</span>
            )}
            <div className="flex items-center space-x-4">
              {editingResumeId === resume.id ? (
                <>
                  <button onClick={() => handleSaveRename(resume.id)} className="p-2 text-green-500 hover:text-green-70Ã00"><FiSave size={20} /></button>
                  <button onClick={() => setEditingResumeId(null)} className="p-2 text-red-500 hover:text-red-700"><FiXCircle size={20} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => handleRename(resume)} className="p-2 text-blue-500 hover:text-blue-700"><FiEdit size={20} /></button>
                </>
              )}
              <button onClick={() => handleDelete(resume.id)} className="p-2 text-red-500 hover:text-red-700"><FiTrash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeManager;