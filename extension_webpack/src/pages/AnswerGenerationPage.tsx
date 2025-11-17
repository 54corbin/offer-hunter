import React from 'react';

/**
 * AnswerGenerationPage - Placeholder for answer generation functionality
 * 
 * Note: Answer generation is now handled directly on the page via the content script.
 * When you select text on any webpage, an [AI] icon appears. Click it to open the
 * answer generation popup menu directly on that page.
 * 
 * This page is kept for compatibility with existing routes.
 */
const AnswerGenerationPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Answer Generation</h1>
        </div>
        
        <div className="space-y-4 text-gray-600">
          <p className="text-lg">
            Answer generation is now integrated directly into your browsing experience!
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">How to use:</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Navigate to any webpage with a job application or form</li>
              <li>Select text you want to generate an answer for</li>
              <li>Click the blue <strong>[AI]</strong> icon that appears</li>
              <li>Choose your template and settings</li>
              <li>Generate and copy your AI-powered answer</li>
            </ol>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Multiple prompt templates (Job Application, Technical, Interview, General)</li>
              <li>Customizable tone (Professional, Casual, Technical)</li>
              <li>Copy to clipboard in multiple formats</li>
              <li>Export answers as Markdown files</li>
              <li>Resume context integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerGenerationPage;