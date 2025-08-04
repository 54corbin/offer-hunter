import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingOverlayProps {
  progress: number;
  onCancel: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, onCancel }) => {
  const getStatusText = (progress: number) => {
    if (progress < 20) return 'Initializing job search...';
    if (progress < 50) return 'Fetching job listings from Seek...';
    if (progress < 80) return 'Analyzing your profile and matching jobs...';
    return 'Finalizing recommendations...';
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all duration-300 scale-95 hover:scale-100">
        <FiLoader className="animate-spin text-blue-500 text-5xl mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Finding Your Next Opportunity</h2>
        <p className="text-gray-600 mb-6">{getStatusText(progress)}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-6">{Math.round(progress)}%</p>

        <button 
          onClick={onCancel} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
};

export default LoadingOverlay;