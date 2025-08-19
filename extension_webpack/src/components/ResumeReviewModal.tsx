
import React from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface ResumeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  resumeText: string;
}

const ResumeReviewModal: React.FC<ResumeReviewModalProps> = ({ isOpen, onClose, onDownload, resumeText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-2xl font-bold text-slate-800">Review Generated Resume</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <ReactMarkdown
            components={{
              div: ({...props}) => <div className="prose max-w-none" {...props} />
            }}
          >
            {resumeText}
          </ReactMarkdown>
        </div>
        <div className="flex justify-end p-4 border-t">
          <button 
            onClick={onClose}
            className="mr-4 px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={onDownload}
            className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FiDownload className="mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeReviewModal;
