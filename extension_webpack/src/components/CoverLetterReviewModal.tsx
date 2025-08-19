import React from 'react';
import Modal from './ui/Modal';

interface CoverLetterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  coverLetterText: string;
}

const CoverLetterReviewModal: React.FC<CoverLetterReviewModalProps> = ({ isOpen, onClose, onCopy, coverLetterText }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Cover Letter">
      <div className="p-6">
        <textarea 
          className="w-full h-96 p-2 border rounded-md bg-gray-50" 
          value={coverLetterText} 
          readOnly 
        />
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
            Close
          </button>
          <button onClick={onCopy} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CoverLetterReviewModal;