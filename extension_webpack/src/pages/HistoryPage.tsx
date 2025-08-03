import React, { useEffect, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';

const HistoryPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ trackedApplications: [] }, (result) => {
        setApplications(result.trackedApplications);
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-5xl font-bold text-slate-800">Application History</h2>
      
      {applications.length > 0 ? (
        <div className="bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
          <ul className="divide-y divide-slate-200">
            {applications.map((app, index) => (
              <li key={index} className="p-6 hover:bg-slate-200/40 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-xl text-slate-800">{app.title}</p>
                    <p className="text-slate-600 mt-1">{app.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">
                      Applied on: {new Date(app.date).toLocaleDateString()}
                    </p>
                    <a 
                      href={app.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-end text-sm text-blue-500 hover:underline"
                    >
                      View Job Posting <FiExternalLink className="ml-1" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center p-12 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
          <h3 className="text-3xl font-semibold text-slate-700">No tracked applications yet.</h3>
          <p className="mt-2 text-slate-500">Your application history will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
