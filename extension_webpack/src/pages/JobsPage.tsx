import React, { useEffect, useState } from 'react';
import { FiSearch, FiExternalLink, FiMapPin, FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { getUserProfile, saveUserProfile, UserProfile, Resume } from '../services/storageService';
import LoadingOverlay from '../components/LoadingOverlay';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReScoring, setIsReScoring] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchJobs = () => {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
        setJobs(result.recommendedJobs.sort((a: any, b: any) => b.score - a.score));
      });
    }
  };

  useEffect(() => {
    fetchJobs();
    getUserProfile().then(setProfile);

    const messageListener = (message: any) => {
      if (message.type === "JOB_MATCHING_PROGRESS") {
        setProgress(message.progress);
      } else if (message.type === "JOB_MATCHING_COMPLETE") {
        setIsLoading(false);
        setProgress(0);
        fetchJobs(); // Refetch jobs to update the list
      } else if (message.type === "RE_SCORE_COMPLETE") {
        setIsReScoring(false);
        fetchJobs(); // Refetch jobs to show new scores
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

  const handleResumeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActiveResumeId = e.target.value;
    if (profile) {
      setIsReScoring(true);
      const updatedProfile = {
        ...profile,
        settings: {
          ...profile.settings,
          activeResumeId: newActiveResumeId,
        },
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile); // Update local state immediately

      // Ask background to re-score jobs with the new active resume
      window.chrome.runtime.sendMessage({ type: "RE_SCORE_JOBS" });
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 85) return 'from-green-400 to-cyan-500';
    if (score > 70) return 'from-blue-400 to-cyan-400';
    return 'from-yellow-400 to-orange-500';
  };

  return (
    <div className="space-y-8">
      {(isLoading || isReScoring) && <LoadingOverlay progress={progress} onCancel={handleCancel} />}
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

      {profile && profile.resumes && profile.resumes.length > 0 && (
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
          <label htmlFor="resume-select" className="font-semibold text-gray-700">Active Resume:</label>
          <div className="relative">
            <select
              id="resume-select"
              value={profile.settings.activeResumeId || ''}
              onChange={handleResumeChange}
              className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {profile.resumes.map(resume => (
                <option key={resume.id} value={resume.id}>{resume.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
      
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden border-b-4 border-blue-500">
              <div className="p-6 flex-grow">
                <p className="text-xl font-bold text-gray-800 truncate">{job.title}</p>
                <p className="text-gray-600 mt-1">{job.company}</p>
                <div className="space-y-2 mt-4 text-sm text-gray-500">
                  {job.location && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2 flex-shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4 h-16 overflow-hidden text-ellipsis">{job.summary || 'No summary available.'}</p>
              </div>
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getScoreColor(job.score)}`}>{job.score}</span>
                  <span className="text-xs text-gray-500">Match Score</span>
                </div>
                <div className="flex items-center space-x-2">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors"
                    title="View Job Posting"
                  >
                    <FiExternalLink size={20} />
                  </a>
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
