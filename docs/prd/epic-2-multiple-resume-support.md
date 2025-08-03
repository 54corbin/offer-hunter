# Epic 2: Multiple Resume Support - Brownfield Enhancement

## Epic Goal

To allow users to upload, store, and manage multiple resumes within their profile, enabling them to select the most relevant resume for each job application.

## Epic Description

### Existing System Context

*   **Current relevant functionality**: The application currently supports only a single resume per user profile. The `UserProfile` data structure needs to be updated.
*   **Technology stack**: React, TypeScript, Tailwind CSS, Webpack.
*   **Integration points**: This feature will require changes to `storageService.ts` to handle the new data structure and modifications to the Profile/Settings UI to manage the resumes.

### Enhancement Details

*   **What's being added/changed**: A new feature will be added to allow users to upload, name, and delete multiple resumes. The `UserProfile` data structure will be modified to store an array of resume objects.
*   **How it integrates**: The `storageService.ts` will be updated to handle the new resume array. The UI on the Profile/Settings page will be updated to include a resume management section.
*   **Success criteria**:
    *   Users can upload and save multiple resumes to their profile.
    *   Users can assign a custom name to each resume.
    *   Users can delete resumes.
    *   Users can select a specific resume during the job application process.

### Stories

1.  **Story 2.1: Update Data Structure for Multiple Resumes**: Modify the `UserProfile` data structure in `storageService.ts` to support an array of resumes, ensuring backward compatibility with existing profiles.
2.  **Story 2.2: Implement Resume Upload and Management UI**: Create the UI components within the Profile/Settings page for users to upload new resumes, assign names to them, and delete existing ones.
3.  **Story 2.3: Integrate Resume Selection into Application Flow**: Add a UI element (e.g., a dropdown) to the job application process that allows users to select which of their saved resumes to use.

### Compatibility Requirements

*   [x] The change to the `UserProfile` data structure must be backward compatible. Existing users with a single resume should not experience any issues.
*   [x] The new UI components must be consistent with the new design system from Epic 1.

### Risk Mitigation

*   **Primary Risk**: Data loss or corruption for existing user profiles during the data structure migration.
*   **Mitigation**: The `storageService.ts` update must include a migration path for existing user profiles to safely transition to the new data structure.
*   **Rollback Plan**: The changes will be developed on a separate Git branch.

### Definition of Done

*   [ ] All stories are completed, and their acceptance criteria are met.
*   [ ] The new resume management functionality is fully tested and working correctly.
*   [ ] Existing user profiles are migrated to the new data structure without any data loss.
*   [ ] The PRD and Architecture documents are updated to reflect the new data structure.
