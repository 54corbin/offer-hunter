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
    <div>
      <h2>Recommended Jobs</h2>
      <button onClick={handleDiscoverJobs}>Find Jobs on Seek.com.au</button>
      {jobs.length > 0 ? (
        <ul>
          {jobs.map((job, index) => (
            <li key={index}>
              <strong>{job.title}</strong> at {job.company} - Score: {job.score}
              <br />
              <a href={job.url} target="_blank" rel="noopener noreferrer">View Job Posting</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recommended jobs yet. Click the button above to find jobs on Seek.com.au.</p>
      )}
    </div>
  );
};

export default JobsPage;
