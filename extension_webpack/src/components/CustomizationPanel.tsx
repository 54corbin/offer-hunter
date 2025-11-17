import React from 'react';
import { FiBriefcase, FiUser, FiTarget } from 'react-icons/fi';

interface CustomizationPanelProps {
  selectedTone: 'professional' | 'casual' | 'technical';
  onToneChange: (tone: 'professional' | 'casual' | 'technical') => void;
  selectedLength: 'short' | 'medium' | 'detailed';
  onLengthChange: (length: 'short' | 'medium' | 'detailed') => void;
  selectedFormat: 'paragraph' | 'bullets' | 'list';
  onFormatChange: (format: 'paragraph' | 'bullets' | 'list') => void;
  answerType: string;
  className?: string;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  selectedTone,
  onToneChange,
  selectedLength,
  onLengthChange,
  selectedFormat,
  onFormatChange,
  answerType,
  className = ''
}) => {
  const toneOptions = [
    {
      id: 'professional' as const,
      title: 'Professional',
      description: 'Formal business language',
      icon: <FiBriefcase size={20} />,
      badge: 'Most Common'
    },
    {
      id: 'casual' as const,
      title: 'Casual',
      description: 'Friendly conversational tone',
      icon: <FiUser size={20} />,
      badge: null
    },
    {
      id: 'technical' as const,
      title: 'Technical',
      description: 'Detailed technical language',
      icon: <FiTarget size={20} />,
      badge: null
    }
  ];

  const lengthOptions = [
    { id: 'short' as const, label: 'Short', description: '1-2 sentences', words: '~25 words' },
    { id: 'medium' as const, label: 'Medium', description: '3-5 sentences', words: '~75 words' },
    { id: 'detailed' as const, label: 'Detailed', description: '6+ sentences', words: '~150 words' }
  ];

  const formatOptions = [
    { id: 'paragraph' as const, label: 'Paragraph', description: 'Continuous text flow' },
    { id: 'bullets' as const, label: 'Bullet Points', description: 'Structured list format' },
    { id: 'list' as const, label: 'Numbered List', description: 'Step-by-step format' }
  ];

  return (
    <div className={`customization-panel ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Customize Your Answer
        </h3>
        <p className="text-sm text-gray-600">
          Adjust tone, length, and format for {answerType}
        </p>
      </div>

      {/* Tone Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tone Preference
        </label>
        <div className="grid grid-cols-1 gap-3">
          {toneOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onToneChange(option.id)}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${selectedTone === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-1.5 rounded-md
                  ${selectedTone === option.id ? 'text-blue-600' : 'text-gray-500'}
                `}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`
                      font-medium text-sm
                      ${selectedTone === option.id ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {option.title}
                    </span>
                    {option.badge && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {option.description}
                  </p>
                </div>
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${selectedTone === option.id 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                  }
                `}>
                  {selectedTone === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Length Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Length Preference
        </label>
        <div className="grid grid-cols-3 gap-3">
          {lengthOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onLengthChange(option.id)}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all duration-200 text-center
                ${selectedLength === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className={`
                font-medium text-sm mb-1
                ${selectedLength === option.id ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {option.label}
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {option.description}
              </div>
              <div className="text-xs text-gray-500">
                {option.words}
              </div>
              <div className={`
                w-3 h-3 rounded-full border mx-auto mt-2
                ${selectedLength === option.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedLength === option.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.75" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Format Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {formatOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onFormatChange(option.id)}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all duration-200 text-center
                ${selectedFormat === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className={`
                font-medium text-sm mb-1
                ${selectedFormat === option.id ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {option.label}
              </div>
              <div className="text-xs text-gray-600">
                {option.description}
              </div>
              <div className={`
                w-3 h-3 rounded-full border mx-auto mt-2
                ${selectedFormat === option.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedFormat === option.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.75" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;