chrome.runtime.onInstalled.addListener(() => {
  console.log("Offer Hunter extension installed.");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_JOBS_FROM_SEEK") {
    console.log("Received message to fetch jobs from Seek.");
    // Placeholder for actual job fetching logic
    sendResponse({ status: "ok" });
  }
  return true; // Keep the message channel open for async response
});
