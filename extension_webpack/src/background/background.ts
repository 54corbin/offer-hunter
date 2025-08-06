import { getUserProfile, saveRecommendedJobs, getRecommendedJobs } from '../services/storageService';
import { getMatchScore, extractProfileFromResume, extractKeywordsFromResume, generateAnswerForQuestion } from '../services/llmService';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Offer Hunter extension installed.");
  // Set up a context menu item for development purposes
  chrome.contextMenus.create({
    id: "offer-hunter-autofill",
    title: "Autofill Form",
    contexts: ["page"],
  });
});

// --- Main Action: Trigger Autofill on current page ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRIGGER_AUTOFILL' && message.tabId) {
    console.log(`Received trigger for autofill on tab ${message.tabId}`);
    triggerAutofill(message.tabId);
    sendResponse({ status: "ok" });
  } else if (message.type === 'GENERATE_ANSWER') {
    console.log("Received request to generate an answer.");
    handleGenerateAnswer(message.questionText, message.jobDescription, sender.tab?.id)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
  return true;
});

async function handleGenerateAnswer(questionText: string, jobDescription: string, tabId: number | undefined) {
  if (!tabId) {
    throw new Error("Tab ID not provided for answer generation.");
  }
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    throw new Error("Cannot generate answer: No active profile or resumes found.");
  }
  const activeResumeId = profile.settings.activeResumeId;
  const resume = profile.resumes.find(r => r.id === activeResumeId) || profile.resumes[0];
  if (!resume) {
    throw new Error("Cannot generate answer: Active resume not found.");
  }

  const answer = await generateAnswerForQuestion(questionText, jobDescription, resume.text);
  
  // Send the answer back to the content script
  if (answer) {
    chrome.tabs.sendMessage(tabId, {
      type: 'ANSWER_GENERATED',
      questionText: questionText,
      answer: answer,
    });
  } else {
    chrome.tabs.sendMessage(tabId, {
      type: 'ANSWER_FAILED',
      questionText: questionText,
    });
  }
}

// Also allow triggering from the context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "offer-hunter-autofill" && tab?.id) {
    console.log(`Context menu clicked on tab ${tab.id}. Attempting to inject autofill script.`);
    await triggerAutofill(tab.id);
  }
});


async function triggerAutofill(tabId: number) {
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    console.error("Cannot autofill: No active profile or resumes found.");
    // Optionally, notify the user they need to set up a profile first.
    // You could open the extension's main page here.
    chrome.runtime.openOptionsPage();
    return;
  }

  const activeResumeId = profile.settings.activeResumeId;
  const resume = profile.resumes.find(r => r.id === activeResumeId) || profile.resumes[0];

  if (!resume) {
    console.error("Cannot autofill: Active resume not found.");
    chrome.runtime.openOptionsPage(); // Prompt user to select a resume
    return;
  }

  console.log("Injecting autofill script and sending data...");
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
    console.log("Autofill data sent successfully.");
  } catch (e) {
    console.error("Failed to inject script or send message:", e);
    // This can happen on pages where content scripts are not allowed,
    // like the Chrome Web Store or other extension pages.
  }
}


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
  } else if (message.type === "RE_SCORE_JOBS") {
    console.log("Received message to re-score jobs.");
    handleReScoreJobs();
  }
  return true; // Keep the message channel open for async response
});

async function handleReScoreJobs() {
  const profile = await getUserProfile();
  if (!profile || !profile.resumes || profile.resumes.length === 0) {
    console.log("No profile or resumes found to re-score jobs.");
    chrome.runtime.sendMessage({ type: "RE_SCORE_COMPLETE" });
    return;
  }

  const activeResumeId = profile.settings.activeResumeId;
  const resume = profile.resumes.find(r => r.id === activeResumeId);
  if (!resume) {
    console.log("Active resume not found for re-scoring.");
    chrome.runtime.sendMessage({ type: "RE_SCORE_COMPLETE" });
    return;
  }
  
  const resumeSummaryText = resume.text;
  const existingJobs = await getRecommendedJobs();
  
  const scoredJobs = [];
  for (let i = 0; i < existingJobs.length; i++) {
    const job = existingJobs[i];
    // Preserve existing job details, just update the score and summary
    const result = await getMatchScore(job, resumeSummaryText);
    if (result) {
      scoredJobs.push({ ...job, score: result.score, summary: result.summary });
    } else {
      // If scoring fails, keep the old job data but maybe zero out the score
      scoredJobs.push({ ...job, score: 0, summary: "Re-scoring failed." });
    }
  }

  await saveRecommendedJobs(scoredJobs);
  console.log("Re-scoring complete, saved updated jobs.");
  chrome.runtime.sendMessage({ type: "RE_SCORE_COMPLETE" });
}

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