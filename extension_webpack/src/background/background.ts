import { getUserProfile, saveRecommendedJobs, getRecommendedJobs } from '../services/storageService';
import { getMatchScore, extractProfileFromResume, extractKeywordsFromResume } from '../services/llmService';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Offer Hunter extension installed.");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

let isCancelled = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_JOBS_FROM_SEEK") {
    console.log("Received message to fetch jobs from Seek.");
    isCancelled = false;
    fetchAndScrapeJobs();
  } else if (message.type === "SCRAPED_JOB_DATA") {
    console.log("Received scraped job data:", message.data);
    handleScrapedJobs(message.data);
  } else if (message.type === "CANCEL_JOB_FETCH") {
    console.log("Received message to cancel job fetch.");
    isCancelled = true;
  }
  return true; // Keep the message channel open for async response
});

async function fetchAndScrapeJobs() {
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    console.log("No profile or resumes found to generate search keywords.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }

  const activeResumeId = profile.settings.activeResumeId;
  const resume = profile.resumes.find(r => r.id === activeResumeId) || profile.resumes[0];

  const keywords = await extractKeywordsFromResume(resume.text);
  if (!keywords) {
    console.error("Could not extract keywords from resume.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }

  const seekUrl = `https://www.seek.com.au/${encodeURIComponent(keywords.join('-'))}-jobs`;
  
  chrome.tabs.create({ url: seekUrl, active: false }, (tab) => {
    if (tab.id) {
      const tabId = tab.id;
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["seek.bundle.js"],
        }, () => {
          setTimeout(() => chrome.tabs.remove(tabId), 2000); // Close tab after 2s
        });
      }, 5000); // 5-second delay for page load
    }
  });
}

async function handleScrapedJobs(jobs: any[]) {
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    console.log("No profile or resumes found to match jobs against.");
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
    return;
  }

  const activeResumeId = profile.settings.activeResumeId;
  const resume = profile.resumes.find(r => r.id === activeResumeId) || profile.resumes[0];
  
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
      console.log(`Job "${job.title}" scored ${result.score} with summary: ${result.summary}`);
      scoredJobs.push({ ...job, score: result.score, summary: result.summary });
    }
    const progress = ((i + 1) / jobs.length) * 100;
    chrome.runtime.sendMessage({ type: "JOB_MATCHING_PROGRESS", progress });
  }

  if (!isCancelled) {
    const existingJobs = await getRecommendedJobs();
    const newJobs = [...existingJobs, ...scoredJobs];
    // Simple deduplication based on URL
    const uniqueJobs = Array.from(new Map(newJobs.map(job => [job.url, job])).values());
    
    await saveRecommendedJobs(uniqueJobs);
    console.log("Saved recommended jobs.");
  }
  
  chrome.runtime.sendMessage({ type: "JOB_MATCHING_COMPLETE" });
}