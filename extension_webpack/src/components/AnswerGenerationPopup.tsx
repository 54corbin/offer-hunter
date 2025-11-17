import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiX, FiMessageSquare, FiLoader, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { generateAnswerForSelection, copyToClipboard, getActiveResumeInfo, AnswerGenerationRequest } from '../services/answerGenerationService';
import { Resume, UserProfile } from '../services/storageService';
import AnswerTypeSelector from './AnswerTypeSelector';
import CustomizationPanel from './CustomizationPanel';
import AnswerPreview from './AnswerPreview';
import QuickActions from './QuickActions';
import CopyOptions from './CopyOptions';

type AnswerType = 'general' | 'job_application' | 'technical' | 'interview' | 'quick_summary' | 'bullet_points';
type Tone = 'professional' | 'casual' | 'technical';
type Length = 'short' | 'medium' | 'detailed';
type Format = 'paragraph' | 'bullets' | 'list';
type Step = 'select-type' | 'customize' | 'preview';

interface AnswerGenerationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  position: { x: number; y: number };
}

const AnswerGenerationPopup: React.FC<AnswerGenerationPopupProps> = ({
  isOpen,
  onClose,
  selectedText,
  position
}) => {
  // Main state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // New state for redesigned interface
  const [currentStep, setCurrentStep] = useState<Step>('select-type');
  const [selectedType, setSelectedType] = useState<AnswerType | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [selectedLength, setSelectedLength] = useState<Length>('medium');
  const [selectedFormat, setSelectedFormat] = useState<Format>('paragraph');

  useEffect(() => {
    if (isOpen) {
      checkActiveResume();
      // Auto-detect best answer type based on text
      autoDetectAnswerType();
    }
  }, [isOpen, selectedText]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const checkActiveResume = async () => {
    const result = await getActiveResumeInfo();
    if (result.error) {
      setError(result.error);
    } else {
      setActiveResume(result.resume);
      setUserProfile(result.profile);
      setError('');
    }
  };

  const autoDetectAnswerType = () => {
    const text = selectedText.toLowerCase();
    
    // Job-related keywords
    if (text.includes('job') || text.includes('position') || text.includes('requirements') || 
        text.includes('qualifications') || text.includes('experience')) {
      setSelectedType('job_application');
      return;
    }
    
    // Technical keywords
    if (text.includes('code') || text.includes('technical') || text.includes('api') || 
        text.includes('system') || text.includes('framework')) {
      setSelectedType('technical');
      return;
    }
    
    // Interview keywords
    if (text.includes('interview') || text.includes('tell me') || text.includes('describe')) {
      setSelectedType('interview');
      return;
    }
    
    // Default to general
    setSelectedType('general');
  };

  const handleGenerateAnswer = async () => {
    if (!selectedText.trim() || !selectedType) {
      setError('No text selected or answer type chosen');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedAnswer('');

    try {
      const request: AnswerGenerationRequest = {
        selectedText: selectedText.trim(),
        questionType: selectedType === 'job_application' ? 'application' : 
                     selectedType === 'technical' ? 'technical' :
                     selectedType === 'interview' ? 'interview' : 'general'
      };

      const response = await generateAnswerForSelection(request);
      
      if (response.error) {
        setError(response.error);
      } else {
        setGeneratedAnswer(response.answer);
        setCurrentStep('preview');
      }
    } catch (err) {
      setError('Failed to generate answer. Please try again.');
      console.error('Answer generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (format: string, content: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        return true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand("copy");
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  };

  const handleClose = () => {
    setGeneratedAnswer('');
    setError('');
    setCopied(false);
    setCurrentStep('select-type');
    onClose();
  };

  const nextStep = () => {
    if (currentStep === 'select-type' && selectedType) {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('preview');
    }
  };

  const prevStep = () => {
    if (currentStep === 'customize') {
      setCurrentStep('select-type');
    } else if (currentStep === 'preview') {
      setCurrentStep('customize');
    }
  };

  const canProceed = () => {
    if (currentStep === 'select-type') return selectedType !== null;
    if (currentStep === 'customize') return true;
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'select-type': return 'Choose Answer Type';
      case 'customize': return 'Customize Answer';
      case 'preview': return 'Preview & Generate';
      default: return 'Generate Answer';
    }
  };

  if (!isOpen) return null;

  // Calculate popup position (ensure it stays within viewport)
  const popupStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x + 20, window.innerWidth - 500) + 'px',
    top: Math.max(position.y - 10, 10) + 'px',
    zIndex: 2147483647
  };

  return (
    <div style={popupStyle} className="answer-generation-overlay">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[480px] max-w-sm max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            {currentStep !== 'select-type' && (
              <button
                onClick={prevStep}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <FiArrowLeft size={18} className="text-gray-600" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getStepTitle()}
              </h3>
              <p className="text-xs text-gray-600">
                Step {currentStep === 'select-type' ? '1' : currentStep === 'customize' ? '2' : '3'} of 3
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <FiX size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-gray-50">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${step <= (currentStep === 'select-type' ? 1 : currentStep === 'customize' ? 2 : 3)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`
                    flex-1 h-0.5
                    ${step < (currentStep === 'select-type' ? 1 : currentStep === 'customize' ? 2 : 3)
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('resume') && (
                <button
                  onClick={() => window.open(chrome.runtime.getURL('popup.html#/profile'), '_blank')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Open Profile Settings
                </button>
              )}
            </div>
          )}

          {/* Selected Text Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Text:
            </label>
            <div className="bg-gray-50 p-3 rounded-lg border max-h-20 overflow-y-auto">
              <p className="text-sm text-gray-800 italic">
                "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
              </p>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'select-type' && (
            <AnswerTypeSelector
              selectedType={selectedType}
              onTypeSelect={setSelectedType}
            />
          )}

          {currentStep === 'customize' && selectedType && (
            <CustomizationPanel
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
              selectedLength={selectedLength}
              onLengthChange={setSelectedLength}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              answerType={selectedType}
            />
          )}

          {currentStep === 'preview' && (
            <div className="space-y-4">
              <AnswerPreview
                selectedText={selectedText}
                selectedType={selectedType || 'general'}
                selectedTone={selectedTone}
                selectedLength={selectedLength}
                selectedFormat={selectedFormat}
                isGenerating={isGenerating}
              />
              
              {/* Generate Button */}
              <button
                onClick={handleGenerateAnswer}
                disabled={isGenerating || !selectedText.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    Generating Answer...
                  </>
                ) : (
                  <>
                    <FiMessageSquare size={16} />
                    Generate Answer
                  </>
                )}
              </button>

              {/* Generated Answer */}
              {generatedAnswer && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Generated Answer:
                  </label>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {generatedAnswer}
                    </p>
                  </div>
                  
                  <CopyOptions
                    generatedAnswer={generatedAnswer}
                    onCopy={handleCopy}
                  />
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {currentStep !== 'preview' && (
            <div className="mt-6">
              <QuickActions
                selectedText={selectedText}
                onSummarize={() => {
                  setSelectedType('quick_summary');
                  setCurrentStep('customize');
                }}
                onExplain={() => {
                  setSelectedType('general');
                  setCurrentStep('customize');
                }}
                onApplyContext={() => {
                  setSelectedType('job_application');
                  setCurrentStep('customize');
                }}
                onWriteCoverLetter={() => {
                  setSelectedType('job_application');
                  setCurrentStep('customize');
                }}
                onCreateBullets={() => {
                  setSelectedType('bullet_points');
                  setCurrentStep('customize');
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {currentStep !== 'preview' && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              {selectedType && (
                <span>Selected: <strong className="text-gray-700">
                  {selectedType === 'job_application' ? 'Job Application' :
                   selectedType === 'technical' ? 'Technical' :
                   selectedType === 'interview' ? 'Interview' :
                   selectedType === 'quick_summary' ? 'Quick Summary' :
                   selectedType === 'bullet_points' ? 'Bullet Points' : 'General'}
                </strong></span>
              )}
            </div>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
              <FiArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Active Resume Info */}
        {activeResume && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Using resume: <span className="font-medium">{activeResume.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerGenerationPopup;