"use client";

import React, { useEffect, useState } from 'react';

const HistoryPage = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ trackedApplications: [] }, (result) => {
        setApplications(result.trackedApplications);
      });
    }
  }, []);

  return (
    <div>
      <h2>Application History</h2>
      {applications.length > 0 ? (
        <ul>
          {applications.map((app, index) => (
            <li key={index}>
              <strong>{app.title}</strong> at {app.company}
              <br />
              Applied on: {new Date(app.date).toLocaleDateString()}
              <br />
              <a href={app.url} target="_blank" rel="noopener noreferrer">View Job Posting</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tracked applications yet.</p>
      )}
    </div>
  );
};

export default HistoryPage;
