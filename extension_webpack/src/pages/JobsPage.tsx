import React, { useEffect, useState } from 'react';
import { FiSearch, FiExternalLink, FiFileText } from 'react-icons/fi';
import { getUserProfile, UserProfile, Resume } from '../services/storageService';
import ResumeSelectionModal from '../components/ResumeSelectionModal';
import LoadingOverlay from '../components/LoadingOverlay';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
        setJobs(result.recommendedJobs.sort((a: any, b: any) => b.score - a.score));
      });
    }
    getUserProfile().then(setProfile);

    const messageListener = (message: any) => {
      if (message.type === "JOB_MATCHING_PROGRESS") {
        setProgress(message.progress);
      } else if (message.type === "JOB_MATCHING_COMPLETE") {
        setIsLoading(false);
        setProgress(0);
        // Refetch jobs to update the list
        window.chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
          setJobs(result.recommendedJobs.sort((a: any, b: any) => b.score - a.score));
        });
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleDiscoverJobs = () => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
      setIsLoading(true);
      setProgress(0);
      window.chrome.runtime.sendMessage({ type: "FETCH_JOBS_FROM_SEEK" });
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
    if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
      window.chrome.runtime.sendMessage({ type: "CANCEL_JOB_FETCH" });
    }
  };

  const handleApply = (job: any) => {
    setSelectedJob(job);
    if (profile?.resumes && profile.resumes.length > 1) {
      setShowModal(true);
    } else if (profile?.resumes && profile.resumes.length === 1) {
      // Auto-select the only resume
      handleResumeSelect(profile.resumes[0]);
    } else {
      // No resumes
      setShowModal(true);
    }
  };

  const handleResumeSelect = (resume: Resume) => {
    console.log(`Applying to ${selectedJob.title} with resume: ${resume.name}`);
    // In a real scenario, this would trigger the auto-fill process with the selected resume data.
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {isLoading && <LoadingOverlay progress={progress} onCancel={handleCancel} />}
      {showModal && profile && (
        <ResumeSelectionModal
          resumes={profile.resumes || []}
          onSelect={handleResumeSelect}
          onClose={() => setShowModal(false)}
        />
      )}
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
                <div className="flex items-center space-x-2">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-500 hover:underline"
                  >
                    View Posting <FiExternalLink className="ml-1" />
                  </a>
                  <button onClick={() => handleApply(job)} className="flex items-center text-sm text-green-500 hover:underline">
                    Apply <FiFileText className="ml-1" />
                  </button>
                </div>
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
