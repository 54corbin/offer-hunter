import React, { useMemo } from 'react';
import { FiEye, FiClock, FiType, FiLayout } from 'react-icons/fi';

interface AnswerPreviewProps {
  selectedText: string;
  selectedType: string;
  selectedTone: 'professional' | 'casual' | 'technical';
  selectedLength: 'short' | 'medium' | 'detailed';
  selectedFormat: 'paragraph' | 'bullets' | 'list';
  isGenerating?: boolean;
  className?: string;
}

const AnswerPreview: React.FC<AnswerPreviewProps> = ({
  selectedText,
  selectedType,
  selectedTone,
  selectedLength,
  selectedFormat,
  isGenerating = false,
  className = ''
}) => {
  const previewContent = useMemo(() => {
    // Generate a realistic preview based on selections
    const lengthMultipliers = {
      short: 0.3,
      medium: 0.7,
      detailed: 1.0
    };

    const formatExamples = {
      paragraph: `"Based on your experience with ${selectedText.substring(0, 20).toLowerCase()}..., you can effectively address this requirement by highlighting your relevant skills and background. This approach demonstrates your understanding of the topic while showcasing your qualifications."`,
      
      bullets: `• Key point 1: Experience with ${selectedText.substring(0, 15).toLowerCase()}...
• Key point 2: Relevant technical skills and knowledge
• Key point 3: Practical application in similar contexts
• Key point 4: Measurable results and outcomes`,
      
      list: `1. First, demonstrate your understanding of the core concept
2. Then, connect it to your relevant experience
3. Finally, show how you would apply this knowledge
4. Provide concrete examples from your background`
    };

    const basePreview = formatExamples[selectedFormat];
    const estimatedWords = Math.floor(50 * lengthMultipliers[selectedLength]);
    const estimatedTime = Math.max(10, Math.floor(estimatedWords / 3));

    return {
      content: basePreview,
      wordCount: estimatedWords,
      readingTime: estimatedTime,
      tone: selectedTone,
      format: selectedFormat,
      length: selectedLength
    };
  }, [selectedText, selectedType, selectedTone, selectedLength, selectedFormat]);

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'text-blue-600';
      case 'casual': return 'text-green-600';
      case 'technical': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'paragraph': return <FiType size={14} />;
      case 'bullets': return <FiLayout size={14} />;
      case 'list': return <FiLayout size={14} />;
      default: return <FiType size={14} />;
    }
  };

  if (isGenerating) {
    return (
      <div className={`answer-preview ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FiEye className="text-blue-600" size={18} />
            Live Preview
          </h3>
          <p className="text-sm text-gray-600">
            Generating preview based on your selections...
          </p>
        </div>

        {/* Skeleton Loading */}
        <div className="bg-gray-50 p-4 rounded-lg border animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`answer-preview ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FiEye className="text-blue-600" size={18} />
          Live Preview
        </h3>
        <p className="text-sm text-gray-600">
          Here's how your answer will look
        </p>
      </div>

      {/* Preview Content */}
      <div className="bg-gray-50 p-4 rounded-lg border mb-4">
        <div className="bg-white p-4 rounded-md border">
          {selectedFormat === 'paragraph' && (
            <p className="text-sm text-gray-800 leading-relaxed">
              {previewContent.content}
            </p>
          )}
          
          {selectedFormat === 'bullets' && (
            <div className="text-sm text-gray-800">
              {previewContent.content.split('\n').map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))}
            </div>
          )}
          
          {selectedFormat === 'list' && (
            <div className="text-sm text-gray-800">
              {previewContent.content.split('\n').map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Answer Stats */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
          📊 Answer Stats
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FiType size={12} className="text-blue-600" />
            <span className="text-blue-800">
              Length: <strong>{previewContent.wordCount} words</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock size={12} className="text-blue-600" />
            <span className="text-blue-800">
              Reading: <strong>{previewContent.readingTime}s</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getFormatIcon(previewContent.format)}
            <span className="text-blue-800">
              Format: <strong className="capitalize">{previewContent.format}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getToneColor(previewContent.tone).replace('text-', 'bg-')}`}></div>
            <span className="text-blue-800">
              Tone: <strong className="capitalize">{previewContent.tone}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Regenerate Suggestion */}
      <div className="mt-3 text-center">
        <button className="text-xs text-blue-600 hover:text-blue-800 underline">
          🔄 Regenerate with different settings
        </button>
      </div>
    </div>
  );
};

export default AnswerPreview;