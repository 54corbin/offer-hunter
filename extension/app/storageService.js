import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-super-secret-key'; // In a real app, this should be managed more securely.

/**
 * @typedef {object} PersonalInfo
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {object} WorkExperience
 * @property {string} company
 * @property {string} title
 * @property {string} startDate
 * @property {string} endDate
 * @property {string[]} responsibilities
 */

/**
 * @typedef {object} Education
 * @property {string} institution
 * @property {string} degree
 * @property {string} fieldOfStudy
 * @property {string} graduationDate
 */

/**
 * @typedef {object} UserProfile
 * @property {PersonalInfo} personalInfo
 * @property {WorkExperience[]} experience
 * @property {Education[]} education
 * @property {string[]} skills
 * @property {string} apiKey
 * @property {{ autoFillEnabled: boolean, aiRecommendationsEnabled: boolean, passcodeEnabled: boolean, passcodeHash?: string, lockoutDelay?: number, lastActiveTime?: number }} settings
 */

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Retrieves the user profile from chrome.storage.local.
 * @returns {Promise<UserProfile | null>} A promise that resolves with the user profile object or null if not found.
 */
export const getUserProfile = () => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["userProfile"], (result) => {
        if (result.userProfile) {
          const decryptedProfile = {
            ...result.userProfile,
            apiKey: result.userProfile.apiKey ? decryptData(result.userProfile.apiKey) : ''
          };
          resolve(decryptedProfile);
        } else {
          resolve(null);
        }
      });
    } else {
      // Mock data for development outside the extension environment
      console.warn("chrome.storage.local is not available. Using mock data.");
      resolve({
        personalInfo: { name: "John Doe", email: "john.doe@example.com", phone: "123-456-7890" },
        experience: [],
        education: [],
        skills: [],
        apiKey: "",
        settings: { autoFillEnabled: true, aiRecommendationsEnabled: true, passcodeEnabled: false, passcodeHash: '', lockoutDelay: 0, lastActiveTime: 0 },
      });
    }
  });
};

/**
 * Saves the user profile to chrome.storage.local.
 * @param {UserProfile} data The user profile object to save.
 * @returns {Promise<void>} A promise that resolves when the data is saved.
 */
export const saveUserProfile = (data) => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      const profileToSave = { ...data };

      // Hash the passcode if it is provided and enabled
      if (profileToSave.settings?.passcodeEnabled && profileToSave.settings.passcode) {
        profileToSave.settings.passcodeHash = CryptoJS.SHA256(profileToSave.settings.passcode).toString();
      } else if (!profileToSave.settings?.passcodeEnabled) {
        // If passcode is disabled, remove the hash
        delete profileToSave.settings.passcodeHash;
      }
      // Always remove the plaintext passcode before saving
      delete profileToSave.settings.passcode;

      const encryptedProfile = {
        ...profileToSave,
        apiKey: profileToSave.apiKey ? encryptData(profileToSave.apiKey) : ''
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

/**
 * Updates a specific field in the user profile.
 * @param {string} key The key of the profile field to update (e.g., "personalInfo.name").
 * @param {any} value The new value for the field.
 * @returns {Promise<void>} A promise that resolves when the field is updated.
 */
export const updateProfileField = async (key, value) => {
  const userProfile = await getUserProfile();
  if (userProfile) {
    const keys = key.split(".");
    let current = userProfile;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    await saveUserProfile(userProfile);
  }
};
