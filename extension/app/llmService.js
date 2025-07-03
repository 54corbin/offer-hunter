// extension/app/llmService.js

import { getUserProfile } from './storageService';

const getApiKey = async () => {
  const profile = await getUserProfile();
  return profile?.apiKey;
};

/**
 * Generates content using an LLM API.
 * @param {string} prompt The prompt to send to the LLM.
 * @returns {Promise<string>} A promise that resolves with the generated content.
 */
export const generateContent = async (prompt) => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("API key not found. Please set it in the extension settings.");
  }

  // Replace with the actual API endpoint and payload structure for your chosen LLM provider.
  const response = await fetch("https://api.example.com/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.generated_text;
};

/**
 * Analyzes the relevance of a job to a user's profile.
 * @param {UserProfile} profile The user's profile.
 * @param {object} jobDetails The job details.
 * @returns {Promise<{score: number, summary: string}>} A promise that resolves with the relevance score and summary.
 */
export const getRelevanceScore = async (profile, jobDetails) => {
  const prompt = `As a recruiter, please analyze the following user profile and job description. Provide a relevance score from 1 to 100 and a brief summary of why the user is a good or bad fit.
  
  User Profile:
  ${JSON.stringify(profile, null, 2)}

  Job Description:
  ${JSON.stringify(jobDetails, null, 2)}

  Respond in the following JSON format:
  {
    "score": <number>,
    "summary": "<string>"
  }
  `;

  const response = await generateContent(prompt);
  return JSON.parse(response);
};
