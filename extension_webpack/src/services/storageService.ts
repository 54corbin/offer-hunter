import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-super-secret-key'; // In a real app, this should be managed more securely.

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
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
  data: string; // Base64 encoded resume data
  text: string; // Extracted plain text
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
  resume?: string; // For migration from old structure
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

const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const getUserProfile = (): Promise<UserProfile | null> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["userProfile"], (result) => {
        if (result.userProfile) {
          const profile: UserProfile = result.userProfile;

          // Migration logic for resumes
          if (profile.resume && (!profile.resumes || profile.resumes.length === 0)) {
            const resumeText = atob(profile.resume.split(',')[1] || '');
            profile.resumes = [{
              id: new Date().toISOString(),
              name: 'Default Resume',
              data: profile.resume,
              text: resumeText,
            }];
            delete profile.resume;
          } else if (!profile.resumes) {
            profile.resumes = [];
          }

          const decryptedProfile: UserProfile = {
            ...profile,
          };
          resolve(decryptedProfile);
        } else {
          resolve(null);
        }
      });
    } else {
      console.warn("chrome.storage.local is not available. Using mock data.");
      resolve({
        personalInfo: { name: "John Doe", email: "john.doe@example.com", phone: "123-456-7890" },
        experience: [],
        education: [],
        skills: [],
        resumes: [],
        settings: { autoFillEnabled: true, aiRecommendationsEnabled: true, passcodeEnabled: false, passcodeHash: '', lockoutDelay: 0, lastActiveTime: 0, apiProviders: [] },
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
      delete profileToSave.resume; // Ensure old resume field is not saved

      const encryptedProfile = {
        ...profileToSave,
      };

      chrome.storage.local.set({ userProfile: encryptedProfile }, () => {
        resolve();
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking save.");
      resolve();
    }
  });
};

export const updateProfileField = async (key: string, value: any): Promise<void> => {
  const userProfile = await getUserProfile();
  if (userProfile) {
    const keys = key.split(".");
    let current: any = userProfile;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    await saveUserProfile(userProfile);
  }
};

export const trackApplication = async (jobDetails: any): Promise<void> => {
  if (chrome && chrome.storage && chrome.storage.local) {
    const { trackedApplications = [] } = await new Promise<{ trackedApplications?: any[] }>((resolve) => chrome.storage.local.get({ trackedApplications: [] }, resolve));
    trackedApplications.push({ ...jobDetails, date: new Date().toISOString() });
    await new Promise<void>((resolve) => chrome.storage.local.set({ trackedApplications }, resolve));
  } else {
    console.warn("chrome.storage.local is not available. Mocking application tracking.");
  }
};

export const getRecommendedJobs = (): Promise<any[]> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ recommendedJobs: [] }, (result) => {
        resolve(result.recommendedJobs);
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking get recommended jobs.");
      resolve([]);
    }
  });
};

export const saveRecommendedJobs = (jobs: any[]): Promise<void> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ recommendedJobs: jobs }, () => {
        resolve();
      });
    } else {
      console.warn("chrome.storage.local is not available. Mocking save recommended jobs.");
      resolve();
    }
  });
};
