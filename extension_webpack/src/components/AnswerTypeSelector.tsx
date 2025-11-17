import React from 'react';
import { FiMessageSquare, FiBriefcase, FiCode, FiMic, FiZap, FiList } from 'react-icons/fi';

export type AnswerType = 
  | 'general' 
  | 'job_application' 
  | 'technical' 
  | 'interview' 
  | 'quick_summary' 
  | 'bullet_points';

interface AnswerTypeCard {
  id: AnswerType;
  title: string;
  description: string;
  icon: React.ReactNode;
  example: string;
  wordCount: string;
  category: string;
}

const answerTypes: AnswerTypeCard[] = [
  {
    id: 'general',
    title: 'General Inquiry',
    description: 'Explain concepts and provide helpful information',
    icon: <FiMessageSquare size={24} />,
    example: 'Explain the concept of microservices architecture and its benefits for modern applications.',
    wordCount: '~15 words',
    category: 'explanation'
  },
  {
    id: 'job_application',
    title: 'Job Application',
    description: 'Tailor response to job posting requirements',
    icon: <FiBriefcase size={24} />,
    example: 'Based on your experience with React and TypeScript development, you can effectively address this technical requirement by highlighting your proficiency in modern JavaScript frameworks...',
    wordCount: '~80 words',
    category: 'professional'
  },
  {
    id: 'technical',
    title: 'Technical Question',
    description: 'Provide detailed technical explanations',
    icon: <FiCode size={24} />,
    example: 'To implement this feature, you would follow these steps: 1) Set up the API endpoint, 2) Configure authentication middleware, 3) Add request validation...',
    wordCount: '~50 words',
    category: 'technical'
  },
  {
    id: 'interview',
    title: 'Interview Question',
    description: 'Practice interview responses with context',
    icon: <FiMic size={24} />,
    example: 'Question: "Tell me about a challenging project you worked on." Answer: "In my previous role at XYZ Company, I led the development of a real-time analytics dashboard that processed over 1 million events per day..."',
    wordCount: '~120 words',
    category: 'interview'
  },
  {
    id: 'quick_summary',
    title: 'Quick Summary',
    description: 'Concise overview of selected content',
    icon: <FiZap size={24} />,
    example: '• Key point 1: Main requirement is experience with React\n• Key point 2: Must have TypeScript knowledge\n• Key point 3: Preference for AWS/cloud platforms',
    wordCount: '~25 words',
    category: 'summary'
  },
  {
    id: 'bullet_points',
    title: 'Bullet Points',
    description: 'Convert to structured bullet format',
    icon: <FiList size={24} />,
    example: '• Strong proficiency in React and TypeScript\n• Experience with modern JavaScript frameworks\n• Knowledge of cloud platforms (AWS/Azure)\n• Background in full-stack development',
    wordCount: '~30 words',
    category: 'structured'
  }
];

interface AnswerTypeSelectorProps {
  selectedType: AnswerType | null;
  onTypeSelect: (type: AnswerType) => void;
  className?: string;
}

const AnswerTypeSelector: React.FC<AnswerTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  className = ''
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'explanation': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'professional': return 'bg-green-50 border-green-200 text-green-800';
      case 'technical': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'interview': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'summary': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'structured': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`answer-type-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Answer Type
        </h3>
        <p className="text-sm text-gray-600">
          Select how you'd like to format your answer
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {answerTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedType === type.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            {/* Category Badge */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(type.category)}`}>
              {type.category}
            </div>

            {/* Icon and Title */}
            <div className="flex items-start gap-3 mb-2">
              <div className={`
                p-2 rounded-lg
                ${selectedType === type.id ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {type.icon}
              </div>
              <div className="flex-1">
                <h4 className={`
                  font-semibold mb-1
                  ${selectedType === type.id ? 'text-blue-900' : 'text-gray-900'}
                `}>
                  {type.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {type.description}
                </p>
              </div>
            </div>

            {/* Example Preview */}
            <div className="bg-gray-50 p-3 rounded-md mb-3">
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "{type.example}"
              </p>
            </div>

            {/* Word Count */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {type.wordCount}
              </span>
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selectedType === type.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedType === type.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerTypeSelector;