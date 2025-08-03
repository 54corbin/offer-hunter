chrome.runtime.onInstalled.addListener(() => {
  console.log("Offer Hunter extension installed.");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});
