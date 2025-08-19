import { UserProfile, Resume } from '../services/storageService';

console.log("Offer Hunter autofill script loaded and ready.");

const fieldMappings: { [key: string]: string[] } = {
  'personalInfo.name': ['name', 'full-name', 'fullName'],
  'personalInfo.email': ['email', 'email-address', 'emailAddress'],
  'personalInfo.phone': ['phone', 'phone-number', 'phoneNumber'],
};

const fillSimpleFields = (profile: UserProfile) => {
  console.log("Autofilling simple fields with profile:", profile);
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
  let fieldsFilled = 0;

  inputs.forEach(input => {
    const el = input as HTMLInputElement;
    const id = el.id?.toLowerCase() || '';
    const name = el.name?.toLowerCase() || '';
    const placeholder = el.placeholder?.toLowerCase() || '';
    const ariaLabel = el.ariaLabel?.toLowerCase() || '';

    const searchTerms = [id, name, placeholder, ariaLabel].filter(Boolean);

    for (const key in fieldMappings) {
      const terms = fieldMappings[key];
      if (searchTerms.some(searchTerm => terms.some(term => searchTerm.includes(term)))) {
        const value = getProfileValue(profile, key);
        if (value) {
          el.value = value;
          fieldsFilled++;
        }
        break;
      }
    }
  });
  return fieldsFilled;
};

const getProfileValue = (profile: UserProfile, key: string): string | undefined => {
  const keys = key.split('.');
  let value: any = profile;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  return typeof value === 'string' ? value : undefined;
};

const handleOpenQuestions = () => {
  const textareas = document.querySelectorAll('textarea');
  console.log(`Found ${textareas.length} textarea(s) to analyze.`);
  
  textareas.forEach(textarea => {
    const questionText = findLabelForTextarea(textarea);
    if (questionText) {
      textarea.placeholder = 'Generating answer with AI...';
      
      // For simplicity, we'll assume the main content of the page is the job description.
      // A more robust solution would use a specific selector.
      const jobDescription = document.body.innerText || '';

      console.log(`Requesting answer for question: "${questionText}"`);
      chrome.runtime.sendMessage({
        type: 'GENERATE_ANSWER',
        questionText,
        jobDescription,
      });
    }
  });
};

const findLabelForTextarea = (textarea: HTMLTextAreaElement): string | null => {
  // 1. Check for a direct `for` attribute match
  if (textarea.id) {
    const label = document.querySelector(`label[for="${textarea.id}"]`);
    if (label) return label.textContent?.trim() || null;
  }
  // 2. Check for a parent label element
  if (textarea.parentElement?.tagName === 'LABEL') {
    return textarea.parentElement.textContent?.trim() || null;
  }
  // 3. Look for a label as a previous sibling
  const prevSibling = textarea.previousElementSibling;
  if (prevSibling && prevSibling.tagName === 'LABEL') {
    return prevSibling.textContent?.trim() || null;
  }
  // 4. A common pattern is a div containing a label and then the input
  if (textarea.parentElement?.previousElementSibling?.tagName === 'LABEL') {
    return textarea.parentElement.previousElementSibling.textContent?.trim() || null;
  }
  
  console.warn("Could not find a label for textarea:", textarea);
  return null;
};



const fillSelectFields = (profile: UserProfile) => {
  console.log("Autofilling select fields with profile:", profile);
  const selects = document.querySelectorAll('select');
  let fieldsFilled = 0;

  selects.forEach(select => {
    const el = select as HTMLSelectElement;
    const id = el.id?.toLowerCase() || '';
    const name = el.name?.toLowerCase() || '';
    const ariaLabel = el.ariaLabel?.toLowerCase() || '';
    const searchTerms = [id, name, ariaLabel].filter(Boolean);

    for (const key in fieldMappings) {
      const terms = fieldMappings[key];
      if (searchTerms.some(searchTerm => terms.some(term => searchTerm.includes(term)))) {
        const value = getProfileValue(profile, key);
        if (value) {
          for (let i = 0; i < el.options.length; i++) {
            const option = el.options[i];
            if (option.value.toLowerCase() === value.toLowerCase() || option.text.toLowerCase() === value.toLowerCase()) {
              el.value = option.value;
              fieldsFilled++;
              break;
            }
          }
        }
        break;
      }
    }
  });
  return fieldsFilled;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTOFILL_DATA') {
    const { profile, resume } = message;
    if (profile && resume) {
      const simpleFieldsFilled = fillSimpleFields(profile);
      const selectFieldsFilled = fillSelectFields(profile);
      handleOpenQuestions();
      sendResponse({ status: `success, ${simpleFieldsFilled + selectFieldsFilled} fields filled.` });
    } else {
      sendResponse({ status: "error", message: "Profile or resume data missing." });
    }
  } else if (message.type === 'ANSWER_GENERATED') {
    const { questionText, answer } = message;
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const label = findLabelForTextarea(textarea);
      if (label === questionText) {
        textarea.value = answer;
        textarea.placeholder = 'Answer generated by Offer Hunter AI.';
      }
    });
  } else if (message.type === 'ANSWER_FAILED') {
    const { questionText } = message;
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const label = findLabelForTextarea(textarea);
      if (label === questionText) {
        textarea.placeholder = 'Could not generate an answer. Please try again.';
      }
    });
  }
  return true;
});