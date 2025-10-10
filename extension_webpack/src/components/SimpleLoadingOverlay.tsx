import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface SimpleLoadingOverlayProps {
  message: string;
}

const SimpleLoadingOverlay: React.FC<SimpleLoadingOverlayProps> = ({ message }) => {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all duration-300 scale-95 hover:scale-100">
        <FiLoader className="animate-spin text-blue-500 text-5xl mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
      </div>
    </div>
  );
};

export default SimpleLoadingOverlay;
