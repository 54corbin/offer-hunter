import { getUserProfile, saveJobsForResume, getJobsForResume, saveUserProfile } from '../services/storageService';
import { getMatchScore, extractKeywordsFromResume, generateAnswerForQuestion, generateResumeForJob, generateCoverLetterForJob } from '../services/llmService';

let isCancelled = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Offer Hunter extension installed.");
  chrome.contextMenus.create({
    id: "offer-hunter-autofill",
    title: "Autofill Form",
    contexts: ["page"],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRIGGER_AUTOFILL' && message.tabId && message.resumeId) {
    triggerAutofill(message.tabId, message.resumeId);
    sendResponse({ status: "ok" });
  } else if (message.type === 'GENERATE_ANSWER') {
    handleGenerateAnswer(message.questionText, message.jobDescription, sender.tab?.id)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  } else if (message.type === "FETCH_JOBS_FROM_SEEK") {
    isCancelled = false;
    fetchAndScrapeJobs(message.resumeId, message.filters);
    sendResponse({ status: "ok" });
  } else if (message.type === "SCRAPED_JOB_DATA") {
    handleScrapedJobs(message.data, message.resumeId);
    sendResponse({ status: "ok" });
  } else if (message.type === "CANCEL_JOB_FETCH") {
    isCancelled = true;
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    sendResponse({ status: "cancelled" });
  } else if (message.type === "GENERATE_RESUME_FOR_JOB") {
    handleGenerateResumeForJob(message.job, message.resumeId);
    sendResponse({ status: "ok" });
  } else if (message.type === "DOWNLOAD_RESUME") {
    handleDownloadResume(message.resumeText, message.jobTitle);
    sendResponse({ status: "ok" });
  } else if (message.type === "GENERATE_COVER_LETTER_FOR_JOB") {
    handleGenerateCoverLetterForJob(message.job, message.resumeId);
    sendResponse({ status: "ok" });
  }
  return true;
});

async function handleGenerateAnswer(questionText: string, jobDescription: string, tabId: number | undefined) {
  if (!tabId) throw new Error("Tab ID not provided.");
  
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    throw new Error("No profile or resumes found.");
  }
  
  // Since there's no global active resume, we'll use the first one for now.
  // A future improvement could be to ask the user which resume to use for generating answers.
  const resume = profile.resumes[0];
  if (!resume) throw new Error("No resume found.");

  const answer = await generateAnswerForQuestion(questionText, jobDescription, resume.text);
  
  const responseType = answer ? 'ANSWER_GENERATED' : 'ANSWER_FAILED';
  chrome.tabs.sendMessage(tabId, {
    type: responseType,
    questionText: questionText,
    answer: answer,
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "offer-hunter-autofill" && tab?.id) {
    await triggerAutofill(tab.id);
  }
});

async function triggerAutofill(tabId: number, resumeId?: string) {
  const profile = await getUserProfile();
  // If a specific resumeId is provided, find that resume.
  // Otherwise, fall back to the first resume in the list.
  const resume = resumeId 
    ? profile?.resumes?.find(r => r.id === resumeId)
    : profile?.resumes?.[0];

  if (!profile || !resume) {
    console.error("Could not find profile or a suitable resume for autofill.");
    chrome.runtime.openOptionsPage();
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["autofill.bundle.js"],
    });
    await chrome.tabs.sendMessage(tabId, {
      type: 'AUTOFILL_DATA',
      profile: profile,
      resume: resume,
    });
  } catch (e) {
    console.error("Failed to inject script or send message:", e);
  }
}

async function fetchAndScrapeJobs(resumeId: string, filters: any) {
  const profile = await getUserProfile();
  const resume = profile?.resumes?.find(r => r.id === resumeId);

  if (!resume) {
    console.error("Could not find the specified resume to start job search.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }

  const keywords = await extractKeywordsFromResume(resume.text);
  if (!keywords) {
    console.error("Could not extract keywords from resume.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }

  const { classification, location, workType, salary } = filters;
  const keywordString = encodeURIComponent(keywords.join('-'));
  let seekUrl = `https://www.seek.com.au/${keywordString}-jobs`;

  const queryParams = new URLSearchParams();
  if (classification) queryParams.append('classification', classification);
  if (location) queryParams.append('where', location);
  if (workType) queryParams.append('work_type', workType);
  if (salary) queryParams.append('salaryrange', salary);

  if (queryParams.toString()) {
    seekUrl += `?${queryParams.toString()}`;
  }
  
  chrome.tabs.create({ url: seekUrl, active: false }, (tab) => {
    if (tab.id) {
      const tabId = tab.id;
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["seek.bundle.js"],
        }, () => {
          // Pass resumeId to the content script after injection
          chrome.tabs.sendMessage(tabId, { type: "INITIATE_SCRAPE", resumeId: resumeId });
          setTimeout(() => chrome.tabs.remove(tabId), 2000);
        });
      }, 5000);
    }
  });
}

async function handleScrapedJobs(jobs: any[], resumeId: string) {
  const profile = await getUserProfile();
  const resume = profile?.resumes?.find(r => r.id === resumeId);

  if (!resume) {
    console.log("Specified resume not found for matching jobs.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }
  
  const resumeSummaryText = resume.text;
  const scoredJobs = [];
  for (let i = 0; i < jobs.length; i++) {
    if (isCancelled) {
      console.log("Job matching cancelled.");
      break;
    }
    const job = jobs[i];
    const result = await getMatchScore(job, resumeSummaryText);
    if (result) {
      scoredJobs.push({ ...job, score: result.score, summary: result.summary });
    }
    const progress = ((i + 1) / jobs.length) * 100;
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_PROGRESS", progress });
  }

  if (!isCancelled) {
    const existingJobs = await getJobsForResume(resumeId);
    const newJobs = [...existingJobs, ...scoredJobs];
    const uniqueJobs = Array.from(new Map(newJobs.map(job => [job.url, job])).values());
    await saveJobsForResume(resumeId, uniqueJobs);
  }
  
  chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
}

async function handleGenerateResumeForJob(job: any, resumeId: string) {
  const profile = await getUserProfile();
  if (!profile) {
    console.error("Could not find user profile.");
    chrome.runtime.sendMessage({ type: "RESUME_GENERATION_COMPLETE" });
    return;
  }

  const resume = profile.resumes?.find(r => r.id === resumeId);

  if (!resume) {
    console.error("Could not find the specified resume to generate a new one.");
    chrome.runtime.sendMessage({ type: "RESUME_GENERATION_COMPLETE" });
    return;
  }

  const newResumeText = await generateResumeForJob(job, resume.text);

  if (newResumeText) {
    const newResume = {
      id: `resume-${Date.now()}`,
      name: `${resume.name} for ${job.title}`,
      text: newResumeText,
      createdAt: new Date().toISOString(),
    };

    if (!profile.resumes) {
      profile.resumes = [];
    }
    profile.resumes.push(newResume);
    await saveUserProfile(profile);

    chrome.runtime.sendMessage({ 
      type: "RESUME_GENERATION_SUCCESS",
      resumeText: newResumeText,
      job: job
    });
  } else {
    chrome.runtime.sendMessage({ type: "RESUME_GENERATION_COMPLETE" });
  }
}

async function handleDownloadResume(resumeText: string, jobTitle: string) {
  const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(resumeText);
  const filename = `resume_${jobTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
  
  await chrome.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: true
  });
}

async function handleGenerateCoverLetterForJob(job: any, resumeId: string) {
  const profile = await getUserProfile();
  if (!profile) {
    console.error("Could not find user profile.");
    chrome.runtime.sendMessage({ type: "COVER_LETTER_GENERATION_FAILURE" });
    return;
  }

  const resume = profile.resumes?.find(r => r.id === resumeId);

  if (!resume) {
    console.error("Could not find the specified resume to generate a cover letter.");
    chrome.runtime.sendMessage({ type: "COVER_LETTER_GENERATION_FAILURE" });
    return;
  }

  const coverLetter = await generateCoverLetterForJob(job, resume.text);

  if (coverLetter) {
    chrome.runtime.sendMessage({ 
      type: "COVER_LETTER_GENERATION_SUCCESS",
      coverLetter: coverLetter,
      job: job
    });
  } else {
    chrome.runtime.sendMessage({ type: "COVER_LETTER_GENERATION_FAILURE" });
  }
}
