document.addEventListener('DOMContentLoaded', () => {
    const openDashboardBtn = document.getElementById('open-dashboard');
    const autofillPageBtn = document.getElementById('autofill-page');

    if (openDashboardBtn) {
        openDashboardBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
            window.close(); // Close the popup
        });
    }

    if (autofillPageBtn) {
        autofillPageBtn.addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                // The background script already has the main logic.
                // We just need to tell it which tab to target.
                chrome.runtime.sendMessage({ type: 'TRIGGER_AUTOFILL', tabId: tab.id });
            }
            window.close(); // Close the popup
        });
    }
});
