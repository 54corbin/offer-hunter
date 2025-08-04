import React from 'react';
import { Resume } from '../services/storageService';

interface ResumeSelectionModalProps {
  resumes: Resume[];
  onSelect: (resume: Resume) => void;
  onClose: () => void;
}

const ResumeSelectionModal: React.FC<ResumeSelectionModalProps> = ({ resumes, onSelect, onClose }) => {
  if (resumes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">No Resumes Found</h3>
          <p>Please upload a resume in the Profile page before applying.</p>
          <button onClick={onClose} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Select a Resume</h3>
        <div className="space-y-2">
          {resumes.map(resume => (
            <button
              key={resume.id}
              onClick={() => onSelect(resume)}
              className="w-full text-left p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              {resume.name}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg">Cancel</button>
      </div>
    </div>
  );
};

export default ResumeSelectionModal;
