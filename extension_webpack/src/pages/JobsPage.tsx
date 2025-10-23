import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiExternalLink, FiMapPin, FiDollarSign, FiFileText, FiLoader, FiMail } from 'react-icons/fi';
import { getUserProfile, UserProfile, Resume, getJobsForResume, saveUserProfile } from '../services/storageService';
import LoadingOverlay from '../components/LoadingOverlay';
import ResumeReviewModal from '../components/ResumeReviewModal';
import CoverLetterReviewModal from '../components/CoverLetterReviewModal';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatingResumeId, setGeneratingResumeId] = useState<string | null>(null);
  const [generatingCoverLetterId, setGeneratingCoverLetterId] = useState<string | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isCoverLetterReviewModalOpen, setCoverLetterReviewModalOpen] = useState(false);
  const [generatedResumeText, setGeneratedResumeText] = useState('');
  const [generatedCoverLetterText, setGeneratedCoverLetterText] = useState('');
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [classification, setClassification] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('');
  const [salary, setSalary] = useState('');

  const classifications = ["Accounting", "Administration & Office Support", "Advertising, Arts & Media", "Banking & Financial Services", "Call Centre & Customer Service", "Education & Training", "Government & Defence", "Healthcare & Medical", "Sales"];
  const workTypes = ["Full-time", "Part-time", "Casual", "Contract/Temp"];


  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchJobsForTab = useCallback(async (resumeId: string) => {
    const jobsForResume = await getJobsForResume(resumeId);
    setJobs(jobsForResume.sort((a, b) => b.score - a.score));
  }, []);

  useEffect(() => {
    getUserProfile().then(profile => {
      setProfile(profile);
      const activeResumeId = profile?.settings?.activeResumeId;
      const firstResumeId = profile?.resumes?.[0]?.id;
      const initialResumeId = activeResumeId || firstResumeId;
      if (initialResumeId) {
        setSelectedResumeId(initialResumeId);
        fetchJobsForTab(initialResumeId);
      }
      setIsProfileLoading(false);
    });

    const messageListener = (message: any) => {
      if (message.type === "JOB_MATCHING_PROGRESS") {
        setIsLoading(true);
        setProgress(message.progress);
      } else if (message.type === "JOB_MATCHING_COMPLETE") {
        setIsLoading(false);
        setProgress(0);
        if (selectedResumeId) {
          fetchJobsForTab(selectedResumeId);
        }
      } else if (message.type === "RESUME_GENERATION_COMPLETE") {
        setGeneratingResumeId(null);
      } else if (message.type === "RESUME_GENERATION_SUCCESS") {
        setGeneratingResumeId(null);
        setGeneratedResumeText(message.resumeText);
        setReviewModalOpen(true);

        if (selectedResumeId && message.job) {
          const cacheKey = `generated-resume-${selectedResumeId}-${message.job.id}`;
          chrome.storage.local.set({ [cacheKey]: message.resumeText });
        }
      } else if (message.type === "COVER_LETTER_GENERATION_SUCCESS") {
        setGeneratingCoverLetterId(null);
        setGeneratedCoverLetterText(message.coverLetter);
        setCoverLetterReviewModalOpen(true);
        // Maybe show a toast notification here
      } else if (message.type === "COVER_LETTER_GENERATION_FAILURE") {
        setGeneratingCoverLetterId(null);
        // Maybe show a toast notification here
      }

    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [fetchJobsForTab, selectedResumeId]);

  const handleDiscoverJobs = () => {
    if (selectedResumeId) {
      setIsLoading(true);
      setProgress(0);
      chrome.runtime.sendMessage({
        type: "FETCH_JOBS_FROM_SEEK",
        resumeId: selectedResumeId,
        filters: {
          classification,
          location,
          workType,
          salary,
        },
      });
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
    chrome.runtime.sendMessage({ type: "CANCEL_JOB_FETCH" });
  };

  const handleGenerateCoverLetter = (job: any) => {
    if (selectedResumeId) {
      setGeneratingCoverLetterId(job.id);
      chrome.runtime.sendMessage({
        type: "GENERATE_COVER_LETTER_FOR_JOB",
        job,
        resumeId: selectedResumeId,
      });
    }
  };

  const handleGenerateResume = async (job: any) => {
    if (selectedResumeId) {
      setCurrentJob(job);
      const cacheKey = `generated-resume-${selectedResumeId}-${job.id}`;
      const cachedResume = await chrome.storage.local.get(cacheKey);

      if (cachedResume[cacheKey]) {
        setGeneratedResumeText(cachedResume[cacheKey]);
        setReviewModalOpen(true);
      } else {
        setGeneratingResumeId(job.id);
        chrome.runtime.sendMessage({
          type: "GENERATE_RESUME_FOR_JOB",
          job,
          resumeId: selectedResumeId,
        });
      }
    }
  };

  const handleDownloadResume = () => {
    chrome.runtime.sendMessage({
      type: "DOWNLOAD_RESUME",
      resumeText: generatedResumeText,
      jobTitle: currentJob.title
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedCoverLetterText);
    setCoverLetterReviewModalOpen(false);
  };

  const handleResumeTabClick = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    fetchJobsForTab(resumeId);

    if (profile) {
      const updatedProfile = {
        ...profile,
        settings: {
          ...profile.settings,
          activeResumeId: resumeId,
        },
      };
      setProfile(updatedProfile);
      await saveUserProfile(updatedProfile);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 85) return 'from-green-400 to-cyan-500';
    if (score > 70) return 'from-blue-400 to-cyan-400';
    return 'from-yellow-400 to-orange-500';
  };

  return (
    <div className="space-y-8">
      {isLoading && <LoadingOverlay progress={progress} onCancel={handleCancel} />}
      <ResumeReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onDownload={handleDownloadResume}
        resumeText={generatedResumeText}
      />
      <CoverLetterReviewModal
        isOpen={isCoverLetterReviewModalOpen}
        onClose={() => setCoverLetterReviewModalOpen(false)}
        onCopy={handleCopyToClipboard}
        coverLetterText={generatedCoverLetterText}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-bold text-slate-800">Recommended Jobs</h2>
      </div>

      {isProfileLoading ? (
        <div className="text-center p-12 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
          <h3 className="text-3xl font-semibold text-slate-700">Loading Profile...</h3>
        </div>
      ) : (
        <>
          {profile && profile.resumes && profile.resumes.length > 0 ? (
            <div className="border-b border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-2 border rounded"
                />
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">All Work Types</option>
                  {workTypes.map(wt => <option key={wt} value={wt}>{wt}</option>)}
                </select>
              </div>
              <nav className="-mb-px flex space-x-8 items-center" aria-label="Tabs">
                {profile.resumes.map(resume => (
                  <button
                    key={resume.id}
                    onClick={() => handleResumeTabClick(resume.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      selectedResumeId === resume.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {resume.name}
                  </button>
                ))}
                <button
                  onClick={handleDiscoverJobs}
                  className="ml-auto flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                  disabled={!selectedResumeId}
                >
                  <FiSearch className="mr-2" />
                  Refresh Jobs
                </button>
              </nav>
            </div>
          ) : (
            <div className="text-center p-12 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
              <h3 className="text-3xl font-semibold text-slate-700">No resumes found.</h3>
              <p className="mt-2 text-slate-500">Please upload a resume on the Profile page to start finding jobs.</p>
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
                      {job.location && ( <div className="flex items-center"> <FiMapPin className="mr-2 flex-shrink-0" /> <span>{job.location}</span> </div> )}
                      {job.salary && ( <div className="flex items-center"> <FiDollarSign className="mr-2 flex-shrink-0" /> <span>{job.salary}</span> </div> )}
                    </div>
                    <p className="text-sm text-gray-600 mt-4 h-16 overflow-hidden text-ellipsis">{job.summary || 'No summary available.'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getScoreColor(job.score)}`}>{job.score}</span>
                      <span className="text-xs text-gray-500">Match Score</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors" title="View Job Posting">
                        <FiExternalLink size={20} />
                      </a>
                      <button 
                        onClick={() => handleGenerateResume(job)} 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors" 
                        title="Generate tailored resume"
                        disabled={generatingResumeId === job.id}
                      >
                        {generatingResumeId === job.id ? (
                          <FiLoader className="animate-spin" size={20} />
                        ) : (
                          <FiFileText size={20} />
                        )}
                      </button>
                      <button 
                        onClick={() => handleGenerateCoverLetter(job)} 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-100 transition-colors" 
                        title="Generate and copy cover letter"
                        disabled={generatingCoverLetterId === job.id}
                      >
                        {generatingCoverLetterId === job.id ? (
                          <FiLoader className="animate-spin" size={20} />
                        ) : (
                          <FiMail size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isProfileLoading && (
              <div className="text-center p-12 bg-white/80 rounded-3xl shadow-xl backdrop-blur-lg">
                <h3 className="text-3xl font-semibold text-slate-700">No recommended jobs for this resume.</h3>
                <p className="mt-2 text-slate-500">Click "Refresh Jobs" to start a search.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default JobsPage; for this resume.</h3>
                <p className="mt-2 text-slate-500">Click "Refresh Jobs" to start a search.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default JobsPage;