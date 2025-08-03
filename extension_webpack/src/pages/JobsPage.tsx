import React, { useEffect, useState } from 'react';
import { FiSearch, FiExternalLink } from 'react-icons/fi';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
        setJobs(result.recommendedJobs.sort((a: any, b: any) => b.score - a.score));
      });
    }
  }, []);

  const handleDiscoverJobs = () => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
      window.chrome.runtime.sendMessage({ type: "FETCH_JOBS_FROM_SEEK" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-bold text-slate-800">Recommended Jobs</h2>
        <button 
          onClick={handleDiscoverJobs}
          className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <FiSearch className="mr-2" />
          Find Jobs on Seek.com.au
        </button>
      </div>
      
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div key={index} className="bg-white/80 rounded-2xl shadow-xl backdrop-blur-lg p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <p className="font-bold text-xl text-slate-800">{job.title}</p>
                <p className="text-slate-600 mt-1">{job.company}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 text-lg">Score: {job.score}</p>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-500 hover:underline"
                >
                  View Posting <FiExternalLink className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
          <h3 className="text-3xl font-semibold text-slate-700">No recommended jobs yet.</h3>
          <p className="mt-2 text-slate-500">Click the button above to find jobs on Seek.com.au.</p>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
