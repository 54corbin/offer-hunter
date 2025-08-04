console.log("LinkedIn content script loaded.");

function scrapeLinkedInJobs() {
  const jobs: any[] = [];
  document.querySelectorAll('.job-search-card').forEach(card => {
    const titleElement = card.querySelector('.job-card-list__title');
    const companyElement = card.querySelector('.job-card-container__primary-description');
    const urlElement = card.querySelector('a.job-card-list__title');

    if (titleElement && companyElement && urlElement) {
      const title = titleElement.textContent?.trim();
      const company = companyElement.textContent?.trim();
      const url = (urlElement as HTMLAnchorElement).href;
      // Description is not easily available on the search results page, 
      // would require clicking each job. For now, we'll use the title as a placeholder.
      const description = title; 

      if (title && company && url) {
        jobs.push({ title, company, description, url, source: 'linkedin' });
      }
    }
  });

  if (jobs.length > 0) {
    chrome.runtime.sendMessage({ type: "SCRAPED_JOB_DATA", data: jobs });
  }
}

// Run the scraper
scrapeLinkedInJobs();
