// extension/public/offscreen.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCRAPE_SEEK') {
    const { html } = request;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const jobs = [];

    doc.querySelectorAll('article[data-card-type="JobCard"]').forEach(el => {
      const titleElement = el.querySelector('a[data-automation="jobTitle"]');
      const companyElement = el.querySelector('a[data-automation="jobCompany"]');
      
      if (titleElement && companyElement) {
        const title = titleElement.innerText;
        const url = new URL(titleElement.href).pathname;
        const company = companyElement.innerText;
        
        jobs.push({ 
          title, 
          url: `https://www.seek.com.au${url}`, 
          company 
        });
      }
    });
    
    sendResponse({ jobs });
  }
  return true; // Keep the message channel open for async response
});
