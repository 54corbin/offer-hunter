import { getUserProfile } from './storageService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * @typedef {import('./storageService').UserProfile} UserProfile
 */

/**
 * Generates content from a prompt using an LLM.
 * @param {string} prompt The prompt to send to the LLM.
 * @returns {Promise<string | null>} A promise that resolves with the generated content or null on failure.
 */
export const generateContent = async (prompt) => {
  const profile = await getUserProfile();
  const apiKey = profile?.apiKey;

  if (!apiKey) {
    console.error("LLM API key not found.");
    return null;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7, // Higher temperature for more creative output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API request failed:", errorData);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return null;
  }
};

/**
 * Analyzes the relevance of a job to a user's profile.
 * @param {UserProfile} profile The user's profile.
 * @param {object} jobDetails The details of the job.
 * @returns {Promise<{score: number, summary: string} | null>} A promise that resolves with the relevance score and summary or null on failure.
 */
export const getRelevanceScore = async (profile, jobDetails) => {
  const apiKey = profile?.apiKey;

  if (!apiKey) {
    console.error("LLM API key not found.");
    return null;
  }

  const prompt = `
    You are a professional recruiter. Analyze the following user profile and job description, and return a relevance score from 1 to 100, where 100 is a perfect match. Also, provide a brief summary of why it is a match or not. Your response must be a JSON object with the keys "score" and "summary".

    User Profile:
    ---
    ${JSON.stringify(profile, null, 2)}
    ---

    Job Description:
    ---
    ${JSON.stringify(jobDetails, null, 2)}
    ---
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API request failed:", errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse LLM response JSON:", e);
        return null;
      }
    } else {
      console.error("LLM response did not contain content.");
      return null;
    }
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return null;
  }
};

/**
 * Generates a structured user profile from resume text using an LLM.
 * @param {string} resumeText The raw text extracted from a resume.
 * @returns {Promise<UserProfile | null>} A promise that resolves with the structured user profile or null on failure.
 */
export const extractProfileFromResume = async (resumeText) => {
  const profile = await getUserProfile();
  const apiKey = profile?.apiKey;

  if (!apiKey) {
    console.error("LLM API key not found.");
    return null;
  }

  const prompt = `
    You are an expert HR data extractor. Based on the following resume text, extract the user's professional information and return it as a JSON object. The JSON object must strictly adhere to the following schema:

    {
      "personalInfo": {
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "experience": [
        {
          "company": "string",
          "title": "string",
          "startDate": "string",
          "endDate": "string",
          "responsibilities": ["string"]
        }
      ],
      "education": [
        {
          "institution": "string",
          "degree": "string",
          "fieldOfStudy": "string",
          "graduationDate": "string"
        }
      ],
      "skills": ["string"]
    }

    Rules:
    - If a value is not found, use an empty string for string types or an empty array for array types.
    - Dates should be in a consistent format (e.g., YYYY-MM-DD), but if not specified, use the format found in the text.

    Resume Text:
    ---
    ${resumeText}
    ---
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Lower temperature for more deterministic output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API request failed:", errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      // The LLM might return the JSON wrapped in markdown, so we need to extract it.
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      try {
        const parsedProfile = JSON.parse(jsonString);
        return parsedProfile;
      } catch (e) {
        console.error("Failed to parse LLM response JSON:", e);
        return null;
      }
    } else {
      console.error("LLM response did not contain content.");
      return null;
    }
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return null;
  }
};