import { getUserProfile, UserProfile } from './storageService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const generateContent = async (prompt: string): Promise<string | null> => {
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
        temperature: 0.7,
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

export const getRelevanceScore = async (profile: UserProfile, jobDetails: any): Promise<{score: number, summary: string} | null> => {
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
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        let jsonString = jsonMatch ? jsonMatch[1] : content;
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse LLM response JSON:", e, "Raw content:", content);
        return { score: 0, summary: "Could not analyze relevance." };
      }
    } else {
      console.error("LLM response did not contain content.");
      return { score: 0, summary: "Could not analyze relevance." };
    }
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return null;
  }
};

export const extractProfileFromResume = async (resumeText: string): Promise<UserProfile | null> => {
  const profile = await getUserProfile();
  const apiKey = profile?.apiKey;

  if (!apiKey) {
    console.error("LLM API key not found.");
    return null;
  }

  const sanitizedResumeText = resumeText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  console.log("Sanitized resume text:", sanitizedResumeText);

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
    ${sanitizedResumeText}
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
    console.log("LLM response content:", content);

    if (content) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      console.log("JSON string to parse:", jsonString);
      
      try {
        const parsedProfile = JSON.parse(jsonString);
        console.log("Parsed profile:", parsedProfile);
        return parsedProfile;
      } catch (e) {
        console.error("Failed to parse LLM response JSON:", e);
        console.error("Invalid JSON string:", jsonString);
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