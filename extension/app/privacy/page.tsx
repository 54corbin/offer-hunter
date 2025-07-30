"use client";

import React, { useState, useEffect } from 'react';

const PrivacyPolicyPage = () => {
  const [policy, setPolicy] = useState('');

  useEffect(() => {
    // In a real app, you'd fetch this from a server or a local file.
    // For this example, we'll just paste the text.
    const policyText = `# Privacy Policy for Offer Hunter\n\n**Last Updated:** 2025-06-29\n\nThis Privacy Policy describes how Offer Hunter ("we," "us," or "our") collects, uses, and discloses your information.\n\n## Information We Collect\n\nWe collect the following information:\n\n*   **User Profile Data:** All the information you provide in the extension's profile section, including your name, email, phone number, work experience, education, and skills.\n*   **LLM API Key:** Your API key for the Large Language Model (LLM) provider you choose to use.\n*   **Tracked Applications:** A list of jobs you've applied to using the extension, including the job title, company, and date applied.\n\n## How We Use Your Information\n\nWe use the information we collect to:\n\n*   Provide and improve the extension's services.\n*   Auto-fill job applications on your behalf.\n*   Generate AI-powered content, such as cover letters and answers to application questions.\n*   Track your application history.\n\n## How We Store Your Information\n\nAll of your data is stored locally on your computer using \`chrome.storage.local\`. Your LLM API key is encrypted before being stored. We do not transmit any of your personal data to our servers.\n\n## Third-Party Services\n\nWe use the following third-party services:\n\n*   **Large Language Model (LLM) Provider:** We send your profile information and job descriptions to your chosen LLM provider to generate content. We are not responsible for the privacy practices of these providers. Please review their privacy policies before use.\n\n## Contact Us\n\nIf you have any questions about this Privacy Policy, please contact us at [Your Contact Information].\n`;
    setPolicy(policyText);
  }, []);

  return (
    <div className="p-10 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <pre className="whitespace-pre-wrap font-sans text-gray-700">
        {policy}
      </pre>
    </div>
  );
};

export default PrivacyPolicyPage;
