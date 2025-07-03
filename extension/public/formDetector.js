// extension/public/formDetector.js

console.log("Form detector script injected.");

const fieldSelectors = {
  "firstName": "input[name*='firstName'], input[name*='first_name'], input[id*='firstName'], input[id*='first_name']",
  "lastName": "input[name*='lastName'], input[name*='last_name'], input[id*='lastName'], input[id*='last_name']",
  "email": "input[type='email'], input[name*='email'], input[id*='email']",
  "phone": "input[type='tel'], input[name*='phone'], input[id*='phone']",
};

const jobDescriptionSelectors = {
  "linkedin.com": {
    title: ".job-details-jobs-unified-top-card__job-title",
    description: ".jobs-description-content__text"
  },
  "indeed.com": {
    title: ".jobsearch-JobInfoHeader-title",
    description: "#jobDescriptionText"
  },
  "glassdoor.com": {
    title: ".JobDetails_jobTitle__s_j5h",
    description: ".JobDetails_jobDescription__6VeGq"
  },
  "ziprecruiter.com": {
    title: ".job_title",
    description: ".job_description"
  }
};

const detectedFields = {};

for (const [fieldName, selector] of Object.entries(fieldSelectors)) {
  const element = document.querySelector(selector);
  if (element) {
    detectedFields[fieldName] = element;
  }
}

console.log("Detected form fields:", detectedFields);

const getJobDetails = () => {
  const host = window.location.hostname;
  let selectors;

  if (host.includes("linkedin.com")) {
    selectors = jobDescriptionSelectors["linkedin.com"];
  } else if (host.includes("indeed.com")) {
    selectors = jobDescriptionSelectors["indeed.com"];
  } else if (host.includes("glassdoor.com")) {
    selectors = jobDescriptionSelectors["glassdoor.com"];
  } else if (host.includes("ziprecruiter.com")) {
    selectors = jobDescriptionSelectors["ziprecruiter.com"];
  }

  if (selectors) {
    const titleElement = document.querySelector(selectors.title);
    const descriptionElement = document.querySelector(selectors.description);

    const title = titleElement ? titleElement.innerText.trim() : "Title not found";
    const description = descriptionElement ? descriptionElement.innerText.trim() : "Description not found";

    return { title, description };
  }

  return { title: "Not a supported job board", description: "" };
};

const jobDetails = getJobDetails();
console.log("Job Details:", jobDetails);

const fillForm = (profile) => {
  for (const [field, element] of Object.entries(detectedFields)) {
    if (element && profile.personalInfo[field]) {
      element.value = profile.personalInfo[field];
      element.style.border = "2px solid green";
    }
  }
};

const addFillButton = () => {
  const button = document.createElement("button");
  button.innerHTML = "&#x1F525;"; // Fire icon
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.width = "50px";
  button.style.height = "50px";
  button.style.borderRadius = "50%";
  button.style.backgroundColor = "blue";
  button.style.color = "white";
  button.style.border = "none";
  button.style.fontSize = "24px";
  button.style.cursor = "pointer";

  button.onclick = () => {
    chrome.runtime.sendMessage({ type: "GET_USER_PROFILE" }, (response) => {
      if (response.profile) {
        fillForm(response.profile);
        button.textContent = "Filled";
        button.style.backgroundColor = "green";
      } else {
        alert("Please set your profile in the extension popup.");
      }
    });
  };
  document.body.appendChild(button);
};

const addGenerateButtons = () => {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach((textarea, index) => {
    const button = document.createElement("button");
    button.textContent = "Generate Answer";
    button.style.display = "block";
    button.style.marginBottom = "5px";
    button.onclick = () => {
      const label = document.querySelector(`label[for='${textarea.id}']`);
      const question = label ? label.innerText : "Could not determine the question.";
      
      button.textContent = "Generating...";
      button.disabled = true;

      chrome.runtime.sendMessage({ type: "GENERATE_ANSWER", question, jobDetails }, (response) => {
        if (response.answer) {
          textarea.value = response.answer;
        } else {
          alert("Could not generate an answer.");
        }
        button.textContent = "Generate Answer";
        button.disabled = false;
      });
    };
    textarea.parentNode.insertBefore(button, textarea);
  });
};

const addSubmissionListener = () => {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      setTimeout(() => { // Allow time for the success page to load
        if (confirm("Track this application?")) {
          chrome.runtime.sendMessage({ type: "TRACK_APPLICATION", jobDetails: { ...jobDetails, url: window.location.href } });
        }
      }, 2000);
    });
  });
};

const addRelevanceButton = () => {
  const button = document.createElement("button");
  button.textContent = "Get Relevance Score";
  button.style.position = "fixed";
  button.style.bottom = "80px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.onclick = () => {
    chrome.runtime.sendMessage({ type: "GET_RELEVANCE_SCORE", jobDetails }, (response) => {
      if (response) {
        alert(`Relevance Score: ${response.score}\n\nSummary: ${response.summary}`);
      } else {
        alert("Could not get relevance score.");
      }
    });
  };
  document.body.appendChild(button);
};

const jobListingSelectors = {
  "linkedin.com": ".job-card-container--clickable",
  "indeed.com": ".jobsearch-SerpJobCard",
  "glassdoor.com": ".react-job-listing",
  "ziprecruiter.com": ".job_item"
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "DISCOVER_JOBS") {
    const host = window.location.hostname;
    let selector;

    if (host.includes("linkedin.com")) {
      selector = jobListingSelectors["linkedin.com"];
    } else if (host.includes("indeed.com")) {
      selector = jobListingSelectors["indeed.com"];
    } else if (host.includes("glassdoor.com")) {
      selector = jobListingSelectors["glassdoor.com"];
    } else if (host.includes("ziprecruiter.com")) {
      selector = jobListingSelectors["ziprecruiter.com"];
    }

    if (selector) {
      const jobElements = document.querySelectorAll(selector);
      const jobs = Array.from(jobElements).map(el => ({
        title: el.querySelector('a').innerText,
        url: el.querySelector('a').href,
        company: el.querySelector('.company-name, .company, .job-card-container__primary-description').innerText
      }));
      chrome.runtime.sendMessage({ type: "ANALYZE_JOBS", jobs });
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ type: "GET_USER_PROFILE" }, (response) => {
    if (response.profile && response.profile.settings) {
      if (response.profile.settings.autoFillEnabled) {
        addFillButton();
        addSubmissionListener();
      }
      if (response.profile.settings.aiRecommendationsEnabled) {
        addGenerateButtons();
        addRelevanceButton();
      }
    }
  });
});
