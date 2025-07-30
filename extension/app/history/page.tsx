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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Application History</h2>
      
      {applications.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((app, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-lg">{app.title}</p>
                    <p className="text-gray-600">{app.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Applied on: {new Date(app.date).toLocaleDateString()}
                    </p>
                    <a 
                      href={app.url} 
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
          <p>No tracked applications yet.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
