// extension/public/background.js

import { getUserProfile } from '../app/storageService.js';
import { generateContent, getRelevanceScore } from '../app/llmService.js';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

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

  if (request.type === 'FETCH_JOBS_FROM_SEEK') {
    fetch('https://www.seek.com.au/software-engineer-jobs')
      .then(response => response.text())
      .then(async (html) => {
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
        chrome.runtime.sendMessage({
          type: 'SCRAPE_SEEK',
          target: 'offscreen',
          html: html
        }, (response) => {
          if (response && response.jobs) {
            analyzeAndStoreJobs(response.jobs);
          }
        });
      });
    return true;
  }
});

async function analyzeAndStoreJobs(jobs) {
  const profile = await getUserProfile();
  const recommendedJobs = [];
  for (const job of jobs) {
    const jobDetails = { title: job.title, description: job.title, company: job.company, url: job.url };
    const relevance = await getRelevanceScore(profile, jobDetails);
    if (relevance) {
      const { score, summary } = relevance;
      recommendedJobs.push({ ...jobDetails, score, summary });
    }
  }
  chrome.storage.local.set({ recommendedJobs });
}

async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true;
    }
  }
  return false;
}

async function setupOffscreenDocument(path) {
  if (await hasOffscreenDocument(path)) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['DOM_PARSER'],
    justification: 'to parse HTML from fetch request'
  });
}
