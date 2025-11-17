import React from 'react';
import { FiZap, FiHelpCircle, FiTarget, FiFileText, FiList, FiRefreshCw } from 'react-icons/fi';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  selectedText: string;
  onSummarize: () => void;
  onExplain: () => void;
  onApplyContext: () => void;
  onWriteCoverLetter?: () => void;
  onCreateBullets?: () => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  selectedText,
  onSummarize,
  onExplain,
  onApplyContext,
  onWriteCoverLetter,
  onCreateBullets,
  className = ''
}) => {
  // Analyze text to determine context and suggest relevant actions
  const getQuickActions = (): QuickAction[] => {
    const text = selectedText.toLowerCase();
    const actions: QuickAction[] = [];

    // Always include core actions
    actions.push(
      {
        id: 'summarize',
        title: 'Summarize',
        description: 'Get a concise overview',
        icon: <FiZap size={16} />,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
        action: onSummarize
      },
      {
        id: 'explain',
        title: 'Explain',
        description: 'Break down the concept',
        icon: <FiHelpCircle size={16} />,
        color: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
        action: onExplain
      },
      {
        id: 'apply-context',
        title: 'Apply Context',
        description: 'Tailor to my resume',
        icon: <FiTarget size={16} />,
        color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
        action: onApplyContext
      }
    );

    // Job-related content suggestions
    if (text.includes('job') || text.includes('position') || text.includes('role') || 
        text.includes('requirements') || text.includes('qualifications') || 
        text.includes('experience') || text.includes('skills')) {
      actions.push({
        id: 'cover-letter',
        title: 'Write Cover Letter',
        description: 'Generate cover letter',
        icon: <FiFileText size={16} />,
        color: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
        action: onWriteCoverLetter || (() => {})
      });
    }

    // Technical content suggestions
    if (text.includes('code') || text.includes('technical') || text.includes('api') ||
        text.includes('system') || text.includes('framework') || text.includes('database')) {
      actions.push({
        id: 'bullets',
        title: 'Create Bullets',
        description: 'Convert to bullet points',
        icon: <FiList size={16} />,
        color: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
        action: onCreateBullets || (() => {})
      });
    }

    // Interview-related content
    if (text.includes('interview') || text.includes('tell me') || text.includes('describe')) {
      actions.push({
        id: 'regenerate',
        title: 'Optimize for Interview',
        description: 'Interview-ready format',
        icon: <FiRefreshCw size={16} />,
        color: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
        action: onApplyContext
      });
    }

    return actions.slice(0, 4); // Limit to 4 actions for better UX
  };

  const quickActions = getQuickActions();

  return (
    <div className={`quick-actions ${className}`}>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          Quick Actions
        </h4>
        <p className="text-xs text-gray-600">
          One-click operations based on your text
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              relative p-3 rounded-lg border transition-all duration-200 text-left group
              ${action.color}
            `}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs mb-1">
                  {action.title}
                </div>
                <div className="text-xs opacity-80 leading-tight">
                  {action.description}
                </div>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200" />
          </button>
        ))}
      </div>

      {/* Context indicator */}
      {selectedText && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">
              Text analyzed: <strong className="text-gray-800">
                {selectedText.length > 50 ? `${selectedText.substring(0, 50)}...` : selectedText}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;