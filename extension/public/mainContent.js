// extension/public/mainContent.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "DISCOVER_JOBS") {
    if (window.location.hostname.includes('seek.com.au')) {
      const jobs = [];
      document.querySelectorAll('article[data-card-type="JobCard"]').forEach(el => {
        const titleElement = el.querySelector('a[data-automation="jobTitle"]');
        const companyElement = el.querySelector('a[data-automation="jobCompany"]');
        
        if (titleElement && companyElement) {
          const title = titleElement.innerText;
          const url = new URL(titleElement.href).pathname; // Get relative URL
          const company = companyElement.innerText;
          
          jobs.push({ 
            title, 
            url: `https://www.seek.com.au${url}`, 
            company 
          });
        }
      });
      
      if (jobs.length > 0) {
        chrome.runtime.sendMessage({ type: "ANALYZE_JOBS", jobs });
      } else {
        console.log("No jobs found on this page.");
      }
    }
  }
});
