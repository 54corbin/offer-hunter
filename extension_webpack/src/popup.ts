import { getUserProfile } from './services/storageService';

const setupResumeSelector = async () => {
    const autofillPageBtn = document.getElementById('autofill-page');
    const resumeSelect = document.getElementById('resume-select') as HTMLSelectElement;

    const profile = await getUserProfile();
    if (profile && profile.resumes && resumeSelect) {
        if (profile.resumes.length > 0) {
            profile.resumes.forEach(resume => {
                const option = document.createElement('option');
                option.value = resume.id;
                option.textContent = resume.name;
                resumeSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = 'No resumes found';
            option.disabled = true;
            resumeSelect.appendChild(option);
            autofillPageBtn?.setAttribute('disabled', 'true');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const openDashboardBtn = document.getElementById('open-dashboard');
    const autofillPageBtn = document.getElementById('autofill-page');
    const resumeSelect = document.getElementById('resume-select') as HTMLSelectElement;

    // Setup event listeners immediately
    if (openDashboardBtn) {
        openDashboardBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
            window.close();
        });
    }

    if (autofillPageBtn) {
        autofillPageBtn.addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const selectedResumeId = resumeSelect.value;

            if (tab && tab.id && selectedResumeId) {
                chrome.runtime.sendMessage({ 
                    type: 'TRIGGER_AUTOFILL', 
                    tabId: tab.id,
                    resumeId: selectedResumeId 
                });
            }
            window.close();
        });
    }

    // Populate the dropdown asynchronously
    setupResumeSelector();
});
