console.log("Seek content script loaded.");

let currentResumeId: string | null = null;

function scrapeSeekJobs() {
  console.log("Scraping Seek jobs for resumeId:", currentResumeId);
  if (!currentResumeId) {
    console.error("No resumeId provided to the scraper.");
    return;
  }
  const jobs: any[] = [];
  document.querySelectorAll('article').forEach((article, index) => {
    console.log(`Processing article ${index + 1}`);
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
        const job = { title, company, description, url, salary, location, source: 'seek' };
        console.log("Found job:", job);
        jobs.push(job);
      }
    }
  });
  
  console.log(`Found ${jobs.length} jobs.`);
  if (jobs.length > 0) {
    console.log("Sending scraped job data to background script.");
    chrome.runtime.sendMessage({ type: "SCRAPED_JOB_DATA", data: jobs, resumeId: currentResumeId });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in seek content script:", message);
  if (message.type === "INITIATE_SCRAPE") {
    currentResumeId = message.resumeId;
    scrapeSeekJobs();
  }
});
