"use client";

import React, { useEffect, useState } from 'react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
        setJobs(result.recommendedJobs.sort((a, b) => b.score - a.score));
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
        <h2 className="text-2xl font-bold text-gray-800">Recommended Jobs</h2>
        <button 
          onClick={handleDiscoverJobs}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Find Jobs on Seek.com.au
        </button>
      </div>
      
      {jobs.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {jobs.map((job, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-lg">{job.title}</p>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-500">Score: {job.score}</p>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Job Posting
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <p>No recommended jobs yet. Click the button above to find jobs on Seek.com.au.</p>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
