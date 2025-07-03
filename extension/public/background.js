// extension/public/background.js

import { getUserProfile } from '../app/storageService.js';
import { generateContent, getRelevanceScore } from '../app/llmService.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_USER_PROFILE") {
    getUserProfile().then(profile => {
      sendResponse({ profile });
    });
    return true; // Indicates that the response is sent asynchronously
  }

  if (request.type === "GENERATE_ANSWER") {
    getUserProfile().then(profile => {
      const prompt = `Based on my profile (${JSON.stringify(profile)}) and the job description (${JSON.stringify(request.jobDetails)}), answer this question: ${request.question}`;
      generateContent(prompt).then(answer => {
        sendResponse({ answer });
      });
    });
    return true; // Indicates that the response is sent asynchronously
  }

  if (request.type === "TRACK_APPLICATION") {
    chrome.storage.local.get({ trackedApplications: [] }, (result) => {
      const trackedApplications = result.trackedApplications;
      trackedApplications.push({
        ...request.jobDetails,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ trackedApplications });
    });
  }

  if (request.type === "ANALYZE_JOBS") {
    getUserProfile().then(async (profile) => {
      const recommendedJobs = [];
      for (const job of request.jobs) {
        // In a real application, you would fetch the full job description here.
        // For this example, we'll just use the title as the description.
        const jobDetails = { title: job.title, description: job.title, company: job.company, url: job.url };
        const { score, summary } = await getRelevanceScore(profile, jobDetails);
        recommendedJobs.push({ ...jobDetails, score, summary });
      }
      chrome.storage.local.set({ recommendedJobs });
    });
  }
});