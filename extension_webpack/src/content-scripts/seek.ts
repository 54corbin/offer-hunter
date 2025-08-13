console.log("Seek content script loaded.");

let currentResumeId: string | null = null;

function scrapeSeekJobs() {
  if (!currentResumeId) {
    console.error("No resumeId provided to the scraper.");
    return;
  }
  const jobs: any[] = [];
  document.querySelectorAll('article').forEach(article => {
    const titleElement = article.querySelector('a[data-automation="jobTitle"]');
    const companyElement = article.querySelector('a[data-automation="jobCompany"]');
    const descriptionElement = article.querySelector('span[data-automation="jobShortDescription"]');
    const salaryElement = article.querySelector('span[data-automation="jobSalary"]');
    const locationElement = article.querySelector('a[data-automation="jobLocation"]');

    if (titleElement && companyElement && descriptionElement) {
      const title = titleElement.textContent?.trim();
      const company = companyElement.textContent?.trim();
      const description = descriptionElement.textContent?.trim();
      const url = (titleElement as HTMLAnchorElement).href;
      const salary = salaryElement?.textContent?.trim() || null;
      const location = locationElement?.textContent?.trim() || null;

      if (title && company && description && url) {
        jobs.push({ title, company, description, url, salary, location, source: 'seek' });
      }
    }
  });
  
  if (jobs.length > 0) {
    chrome.runtime.sendMessage({ type: "SCRAPED_JOB_DATA", data: jobs, resumeId: currentResumeId });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INITIATE_SCRAPE") {
    currentResumeId = message.resumeId;
    scrapeSeekJobs();
  }
});
