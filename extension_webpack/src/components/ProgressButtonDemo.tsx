import React from 'react';
import ProgressButton from './ProgressButton';

export default function ProgressButtonDemo() {
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const handleStop = () => {
    console.log('Stop button clicked at', progress, '%');
  };

  const simulateProgress = () => {
    setLoading(true);
    setCompleted(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setCompleted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ProgressButton Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Usage */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
          <ProgressButton 
            progress={progress} 
            onClick={handleStop}
            className="mb-4"
          />
          <button
            onClick={simulateProgress}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Simulating...' : 'Start Progress'}
          </button>
        </div>

        {/* Loading State */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading State</h2>
          <ProgressButton 
            progress={75} 
            onClick={handleStop}
            isLoading={true}
            variant="primary"
            className="mb-4"
          />
          <div className="text-sm text-gray-600">Loading with spinner</div>
        </div>

        {/* Completed State */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Completed State</h2>
          <ProgressButton 
            progress={100} 
            onClick={handleStop}
            isCompleted={true}
            variant="primary"
            className="mb-4"
          />
          <div className="text-sm text-gray-600">Completed with checkmark</div>
        </div>

        {/* Danger Variant */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Danger Variant</h2>
          <ProgressButton 
            progress={25} 
            onClick={handleStop}
            variant="danger"
            className="mb-4"
          />
          <div className="text-sm text-gray-600">Danger state variant</div>
        </div>

        {/* Different Sizes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
          <div className="space-y-3">
            <ProgressButton 
              progress={50} 
              onClick={handleStop}
              size="sm"
            />
            <ProgressButton 
              progress={50} 
              onClick={handleStop}
              size="md"
            />
            <ProgressButton 
              progress={50} 
              onClick={handleStop}
              size="lg"
            />
          </div>
        </div>

        {/* Disabled State */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Disabled State</h2>
          <ProgressButton 
            progress={30} 
            onClick={handleStop}
            disabled={true}
            className="mb-4"
          />
          <div className="text-sm text-gray-600">Button is disabled</div>
        </div>
      </div>

      {/* Real-time Progress Display */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Real-time Progress</h2>
        <div className="flex items-center space-x-4">
          <ProgressButton 
            progress={progress} 
            onClick={handleStop}
            isLoading={loading}
            isCompleted={completed}
            className="flex-1"
          />
          <div className="text-lg font-mono min-w-16">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}