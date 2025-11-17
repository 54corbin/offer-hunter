import React, { useState, useEffect } from 'react';
import AnswerGenerationPopup from '../components/AnswerGenerationPopup';
import * as chrome from 'webextension-polyfill';

const AnswerGenerationPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Get data from storage when component mounts
    const loadAnswerGenerationData = async () => {
      try {
        const result = await chrome.storage.session.get(null) as Record<string, any>;
        
        // Find the most recent answer generation data
        const keys = Object.keys(result).filter(key => key.startsWith('answer_generation_'));
        if (keys.length > 0) {
          const latestKey = keys.sort().pop()!; // Get the most recent one
          const data = result[latestKey];
          
          if (data && typeof data === 'object') {
            setSelectedText(data.selectedText || '');
            setPosition(data.position || { x: 0, y: 0 });
            setIsPopupOpen(true);
            
            // Clean up the stored data
            await chrome.storage.session.remove(latestKey);
          }
        }
      } catch (error) {
        console.error('Error loading answer generation data:', error);
      }
    };

    loadAnswerGenerationData();
  }, []);

  const handleClose = () => {
    setIsPopupOpen(false);
    
    // Close the popup window
    if (chrome.windows) {
      chrome.windows.getCurrent().then((window) => {
        if (window.id) {
          chrome.windows.remove(window.id);
        }
      }).catch((error) => {
        console.error('Error closing window:', error);
      });
    }
  };

  return (
    <div className="w-full h-full">
      <AnswerGenerationPopup
        isOpen={isPopupOpen}
        onClose={handleClose}
        selectedText={selectedText}
        position={position}
      />
    </div>
  );
};

export default AnswerGenerationPage;