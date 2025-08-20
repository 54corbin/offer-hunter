import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-super-secret-key'; // In a real app, this should be managed more securely.

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  gender?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  summary: string;
  responsibilities: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
}

export interface Resume {
  id: string;
  name: string;
  data?: string; // Base64 encoded resume data
  text: string; // Extracted plain text
  parsedInfo?: {
    personalInfo?: PersonalInfo;
    experience?: WorkExperience[];
    education?: Education[];
    skills?: string[];
  };
}

export interface ApiProvider {
  id: string;
  name: 'OpenAI' | 'Gemini';
  apiKey: string;
  model: string;
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  resumes?: Resume[];
  settings: {
    autoFillEnabled: boolean;
    aiRecommendationsEnabled: boolean;
    passcodeEnabled: boolean;
    passcodeHash?: string;
    lockoutDelay?: number;
    lastActiveTime?: number;
    passcode?: string; // Plaintext passcode, should be removed before saving
    activeAiProviderId?: string;
    apiProviders?: ApiProvider[];
    activeResumeId?: string;
  };
}

// ... (encryption/decryption functions remain the same) ...

export const getUserProfile = (): Promise<UserProfile | null> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["userProfile"], (result) => {
        if (result.userProfile) {
          const profile: UserProfile = result.userProfile;

          // Ensure resumes array exists
          if (!profile.resumes) {
            profile.resumes = [];
          }

          resolve(profile);
        } else {
          resolve(null);
        }
      });
    } else {
      // Mock data for environments where storage is not available
      console.warn("chrome.storage.local is not available. Using mock data.");
      resolve({
        personalInfo: { name: "John Doe", email: "john.doe@example.com", phone: "123-456-7890" },
        experience: [],
        education: [],
        skills: [],
        resumes: [],
        settings: { autoFillEnabled: true, aiRecommendationsEnabled: true, passcodeEnabled: false, apiProviders: [] },
      });
    }
  });
};

export const saveUserProfile = (data: UserProfile): Promise<void> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      const profileToSave = { ...data };

      if (profileToSave.settings?.passcodeEnabled && profileToSave.settings.passcode) {
        profileToSave.settings.passcodeHash = CryptoJS.SHA256(profileToSave.settings.passcode).toString();
      } else if (!profileToSave.settings?.passcodeEnabled) {
        delete profileToSave.settings.passcodeHash;
      }
      delete profileToSave.settings.passcode;

      chrome.storage.local.set({ userProfile: profileToSave }, () => {
        resolve();
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking save.");
      resolve();
    }
  });
};

// ... (updateProfileField and trackApplication remain the same) ...

export const getJobsForResume = (resumeId: string): Promise<any[]> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ jobLists: {} }, (result) => {
        resolve(result.jobLists[resumeId] || []);
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking get jobs.");
      resolve([]);
    }
  });
};

export const saveJobsForResume = (resumeId: string, jobs: any[]): Promise<void> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ jobLists: {} }, (result) => {
        const newJobLists = { ...result.jobLists, [resumeId]: jobs };
        chrome.storage.local.set({ jobLists: newJobLists }, () => {
          resolve();
        });
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking save jobs.");
      resolve();
    }
  });
};

