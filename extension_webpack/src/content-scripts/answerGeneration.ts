console.log("Answer Generation content script loaded.");
console.log("Answer Generation: DOM ready state:", document.readyState);
console.log("Answer Generation: Current URL:", window.location.href);

interface PopupState {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
  isInjected: boolean;
}

class AnswerGenerationManager {
  private popupState: PopupState = {
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedText: "",
    isInjected: false,
  };

  private popupElement: HTMLElement | null = null;
  private hideTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    console.log("Answer Generation: Initializing AnswerGenerationManager");
    console.log(
      "Answer Generation: Document ready state:",
      document.readyState,
    );
    this.addEventListeners();
    console.log("Answer Generation: Initialization complete");
  }

  private addEventListeners(): void {
    console.log("Answer Generation: Adding event listeners");

    // Listen for text selection with debouncing
    let selectionTimeout: NodeJS.Timeout;
    document.addEventListener("mouseup", () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        this.handleTextSelection();
      }, 300); // Delay per design spec for stable selection
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.hidePopup();
      }
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Answer Generation: Received message:", message);
      if (message.type === "SHOW_ANSWER_POPUP") {
        console.log("Answer Generation: Showing injected popup");
        this.showInjectedPopup(
          message.data.selectedText,
          message.data.position,
        );
        sendResponse({ status: "ok" });
      } else if (message.type === "HIDE_ANSWER_POPUP") {
        console.log("Answer Generation: Hiding popup via message");
        this.hidePopup();
        sendResponse({ status: "ok" });
      }
    });

    console.log("Answer Generation: Event listeners added");
  }

  private handleTextSelection(): void {
    console.log("Answer Generation: Text selection event triggered");
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      console.log("Answer Generation: No selection or collapsed selection");
      this.hidePopup();
      return;
    }

    const selectedText = selection.toString().trim();
    console.log(
      "Answer Generation: Selected text length:",
      selectedText.length,
    );
    console.log(
      "Answer Generation: Selected text preview:",
      selectedText.substring(0, 50),
    );

    if (selectedText.length < 10) {
      console.log("Answer Generation: Selection too short (minimum 10 chars)");
      this.hidePopup();
      return;
    }

    // Cancel any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
      console.log("Answer Generation: Cancelled pending hide timeout");
    }

    this.popupState.selectedText = selectedText;
    console.log("Answer Generation: Storing selected text:", selectedText);

    // Get selection position
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    console.log("Answer Generation: Selection rect:", rect);

    // Calculate position
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    };

    console.log("Answer Generation: Calculated position:", position);
    this.showIcon(position);
  }

  private showIcon(position: { x: number; y: number }): void {
    console.log("Answer Generation: showIcon called with position:", position);

    // Remove existing icon if present
    this.removeIcon();

    // Create icon element
    const icon = document.createElement("div");
    icon.id = "answer-generation-icon";

    // Use clean, modern inline styles
    icon.style.cssText = `
      position: fixed !important;
      z-index: 2147483647 !important;
      background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
      border: none !important;
      border-radius: 16px !important;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3) !important;
      padding: 8px 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 13px !important;
      cursor: pointer !important;
      opacity: 0 !important;
      transform: scale(0.8) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      justify-content: center !important;
      color: white !important;
      font-weight: 600 !important;
      visibility: hidden !important;
      user-select: none !important;
    `;

    // Add icon content
    icon.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; color: white;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.9;">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style="font-size: 12px; font-weight: 500;">AI</span>
      </div>
    `;

    // Position the icon
    const adjustedX = Math.max(
      10,
      Math.min(position.x - 25, window.innerWidth - 70),
    );
    const adjustedY = Math.max(10, position.y - 35);

    icon.style.left = `${adjustedX}px`;
    icon.style.top = `${adjustedY}px`;

    // Add click event listener
    icon.addEventListener("click", () => {
      console.log("Answer Generation: Icon clicked");
      this.showInjectedPopup(this.popupState.selectedText, position);
      this.removeIcon();
    });

    // Append to body
    document.body.appendChild(icon);
    this.popupElement = icon;
    console.log("Answer Generation: Icon appended to body");

    // Show with animation
    setTimeout(() => {
      if (this.popupElement) {
        this.popupElement.style.opacity = "1";
        this.popupElement.style.transform = "scale(1)";
        this.popupElement.style.pointerEvents = "auto";
        this.popupElement.style.visibility = "visible";
      }
    }, 50);

    // Schedule hide AFTER a minimum display time
    setTimeout(() => {
      if (this.popupState.isVisible) {
        console.log(
          "Answer Generation: Minimum display time elapsed, scheduling hide",
        );
        this.scheduleHide();
      }
    }, 1500);
  }

  private removeIcon(): void {
    const existingIcon = document.getElementById("answer-generation-icon");
    if (existingIcon) {
      existingIcon.remove();
    }
    this.popupElement = null;
  }

  private scheduleHide(): void {
    console.log("Answer Generation: Scheduling icon hide in 8 seconds");

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      console.log("Answer Generation: Auto-hiding icon after timeout");
      this.removeIcon();
    }, 8000);
  }

  public hidePopup(): void {
    console.log("Answer Generation: hidePopup called");

    // Remove injected popup
    const injectedPopup = document.getElementById("injected-answer-popup");
    if (injectedPopup) {
      injectedPopup.remove();
    }

    // Remove icon
    this.removeIcon();

    this.popupState.isVisible = false;

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
      console.log("Answer Generation: Cleared hide timeout");
    }
  }

  public showInjectedPopup(
    selectedText: string,
    position: { x: number; y: number },
  ): void {
    console.log("Answer Generation: showInjectedPopup called");

    // Remove existing popup
    this.hidePopup();

    // Create main popup container
    const popup = document.createElement("div");
    popup.id = "injected-answer-popup";
    popup.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
    `;

    console.log("Answer Generation: Popup container created with z-index:", popup.style.zIndex);

    // Create popup content
    const popupContent = document.createElement("div");
    popupContent.style.cssText = `
      position: absolute !important;
      pointer-events: auto !important;
    `;

    console.log("Answer Generation: Popup content created with pointer-events:", popupContent.style.pointerEvents);

    // Position the popup
    const adjustedX = Math.min(position.x + 20, window.innerWidth - 500);
    const adjustedY = Math.max(position.y - 10, 10);
    popupContent.style.left = `${adjustedX}px`;
    popupContent.style.top = `${adjustedY}px`;

    // Create the complete popup HTML with full functionality
    popupContent.innerHTML = `
      <div style="
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        border: 1px solid #e5e7eb !important;
        width: 480px !important;
        max-height: 600px !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      ">
        <!-- Header -->
        <div style="
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 16px !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: linear-gradient(to right, #eff6ff, #e0e7ff) !important;
        ">
          <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
            <div style="
              width: 32px !important;
              height: 32px !important;
              background: #2563eb !important;
              border-radius: 8px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-weight: bold !important;
              font-size: 14px !important;
            ">
              AI
            </div>
            <div>
              <h3 style="margin: 0 !important; font-size: 18px !important; font-weight: 600 !important; color: #111827 !important;">
                Answer Generation
              </h3>
              <p style="margin: 0 !important; font-size: 12px !important; color: #6b7280 !important;">
                AI-powered responses for your selected text
              </p>
            </div>
          </div>
          <button onclick="this.closest('#injected-answer-popup').remove()" style="
            background: none !important;
            border: none !important;
            cursor: pointer !important;
            padding: 4px !important;
            border-radius: 6px !important;
            color: #6b7280 !important;
            font-size: 18px !important;
          ">
            ×
          </button>
        </div>

        <!-- Content -->
        <div style="padding: 16px !important; max-height: 500px !important; overflow-y: auto !important;">
          <!-- Error Display -->
          <div id="popup-error" style="display: none !important; margin-bottom: 16px !important; padding: 12px !important; background: #fef2f2 !important; border: 1px solid #fecaca !important; border-radius: 8px !important;">
            <p id="error-message" style="margin: 0 !important; font-size: 14px !important; color: #b91c1c !important;"></p>
          </div>

          <!-- Selected Text -->
          <div style="margin-bottom: 16px !important;">
            <label style="display: block !important; font-size: 14px !important; font-weight: 500 !important; color: #374151 !important; margin-bottom: 8px !important;">
              Selected Text:
            </label>
            <div style="
              background: #eff6ff !important;
              padding: 12px !important;
              border-radius: 8px !important;
              border: 1px solid #dbeafe !important;
              max-height: 80px !important;
              overflow-y: auto !important;
            ">
              <p id="selected-text-display" style="margin: 0 !important; font-size: 14px !important; color: #374151 !important; font-style: italic !important;">
                "${selectedText.length > 100 ? selectedText.substring(0, 100) + "..." : selectedText}"
              </p>
            </div>
          </div>

          <!-- Prompt Templates -->
          <div style="margin-bottom: 16px !important;">
            <label style="display: block !important; font-size: 14px !important; font-weight: 500 !important; color: #374151 !important; margin-bottom: 8px !important;">
              Prompt Template:
            </label>
            <select id="template-selector" style="
              width: 100% !important;
              padding: 8px 12px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: white !important;
              margin-bottom: 8px !important;
            ">
              <option value="job-application">💼 Job Application - Tailored responses</option>
              <option value="technical-question">⚙️ Technical Question - Detailed explanations</option>
              <option value="interview-response">🎤 Interview Response - STAR method</option>
              <option value="general-explanation">💬 General Explanation - Clear information</option>
            </select>

            <!-- Quick Settings -->
            <div style="margin-bottom: 12px !important;">
              <label style="display: block !important; font-size: 12px !important; font-weight: 500 !important; color: #6b7280 !important; margin-bottom: 4px !important;">
                Tone:
              </label>
              <div style="display: flex !important; gap: 4px !important; margin-bottom: 8px !important;">
                <button data-setting="tone" data-value="professional" class="setting-btn" style="
                  padding: 4px 8px !important;
                  font-size: 12px !important;
                  border: 1px solid #d1d5db !important;
                  border-radius: 4px !important;
                  background: #2563eb !important;
                  color: white !important;
                  cursor: pointer !important;
                ">Professional</button>
                <button data-setting="tone" data-value="casual" class="setting-btn" style="
                  padding: 4px 8px !important;
                  font-size: 12px !important;
                  border: 1px solid #d1d5db !important;
                  border-radius: 4px !important;
                  background: white !important;
                  color: #374151 !important;
                  cursor: pointer !important;
                ">Casual</button>
                <button data-setting="tone" data-value="technical" class="setting-btn" style="
                  padding: 4px 8px !important;
                  font-size: 12px !important;
                  border: 1px solid #d1d5db !important;
                  border-radius: 4px !important;
                  background: white !important;
                  color: #374151 !important;
                  cursor: pointer !important;
                ">Technical</button>
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          <button id="generate-btn" onclick="(window.safeAnswerGenerationManager||{}).generateAnswer && (window.safeAnswerGenerationManager).generateAnswer()" style="
            width: 100% !important;
            background: linear-gradient(to right, #2563eb, #4f46e5) !important;
            color: white !important;
            border: none !important;
            padding: 12px 16px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            margin-bottom: 16px !important;
            transition: all 0.2s ease !important;
          ">
            🚀 Generate Answer
          </button>

          <!-- Loading State -->
          <div id="loading-state" style="display: none !important; text-align: center !important; margin-bottom: 16px !important;">
            <div style="
              display: inline-flex !important;
              align-items: center !important;
              gap: 8px !important;
              color: #6b7280 !important;
              font-size: 14px !important;
            ">
              <div style="
                width: 16px !important;
                height: 16px !important;
                border: 2px solid #e5e7eb !important;
                border-top: 2px solid #2563eb !important;
                border-radius: 50% !important;
                animation: spin 1s linear infinite !important;
              "></div>
              Generating answer...
            </div>
          </div>

          <!-- Generated Answer -->
          <div id="answer-section" style="display: none !important; margin-bottom: 16px !important;">
            <label style="display: block !important; font-size: 14px !important; font-weight: 500 !important; color: #374151 !important; margin-bottom: 8px !important;">
              Generated Answer:
            </label>
            <div style="
              background: #f0fdf4 !important;
              padding: 16px !important;
              border-radius: 8px !important;
              border: 1px solid #bbf7d0 !important;
              max-height: 200px !important;
              overflow-y: auto !important;
            ">
              <p id="generated-answer" style="margin: 0 !important; font-size: 14px !important; color: #1f2937 !important; white-space: pre-wrap !important; line-height: 1.5 !important;"></p>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex !important; gap: 8px !important; margin-top: 12px !important; flex-wrap: wrap !important;">
              <button onclick="(window.safeAnswerGenerationManager||{}).copyAnswer && (window.safeAnswerGenerationManager).copyAnswer('plain')" style="
                padding: 8px 12px !important;
                background: #2563eb !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                font-size: 12px !important;
                cursor: pointer !important;
                transition: background 0.2s ease !important;
              ">📋 Copy</button>

              <button onclick="(window.safeAnswerGenerationManager||{}).copyAnswer && (window.safeAnswerGenerationManager).copyAnswer('linkedin')" style="
                padding: 8px 12px !important;
                background: #0077b5 !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                font-size: 12px !important;
                cursor: pointer !important;
                transition: background 0.2s ease !important;
              ">💼 LinkedIn</button>

              <button onclick="(window.safeAnswerGenerationManager||{}).exportAnswer && (window.safeAnswerGenerationManager).exportAnswer()" style="
                padding: 8px 12px !important;
                background: #10b981 !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                font-size: 12px !important;
                cursor: pointer !important;
                transition: background 0.2s ease !important;
              ">💾 Export</button>
            </div>
          </div>

          <!-- Copy Success Message -->
          <div id="copy-success" style="display: none !important; text-align: center !important; margin-top: 12px !important; padding: 8px !important; background: #d1fae5 !important; color: #065f46 !important; border-radius: 6px !important; font-size: 12px !important;">
            ✅ Answer copied to clipboard!
          </div>

          <!-- Resume Context -->
          <div id="resume-context" style="
            margin-top: 16px !important;
            padding: 16px !important;
            background: linear-gradient(135deg, #eff6ff, #f0f9ff) !important;
            border: 1px solid #dbeafe !important;
            border-radius: 12px !important;
            display: none !important;
            position: relative !important;
          ">
            <div style="
              display: flex !important; 
              align-items: center !important; 
              gap: 8px !important; 
              margin-bottom: 8px !important;
            ">
              <div style="
                width: 12px !important; 
                height: 12px !important; 
                background: #10b981 !important; 
                border-radius: 50% !important;
                animation: pulse 2s infinite !important;
              "></div>
              <span style="
                font-size: 14px !important; 
                font-weight: 600 !important; 
                color: #1e40af !important;
              ">
                🎯 Active Resume Profile
              </span>
            </div>
            <p id="resume-info" style="
              margin: 0 !important; 
              font-size: 13px !important; 
              color: #1e3a8a !important; 
              line-height: 1.4 !important;
            "></p>
            <div style="
              display: flex !important; 
              align-items: center !important; 
              gap: 8px !important; 
              margin-top: 8px !important;
            ">
              <p id="relevance-score" style="
                margin: 0 !important; 
                font-size: 11px !important; 
                color: #059669 !important;
                background: rgba(16, 185, 129, 0.1) !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-weight: 500 !important;
              "></p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add CSS animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .setting-btn:hover {
        opacity: 0.8 !important;
      }
    `;
    document.head.appendChild(style);

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    console.log("Answer Generation: Popup appended to body");

    // Store popup state
    this.popupState.isVisible = true;
    this.popupState.selectedText = selectedText;

    // Debug final popup state
    console.log("Answer Generation: Final popup state:", {
      popupExists: !!document.getElementById("injected-answer-popup"),
      popupZIndex: (document.getElementById("injected-answer-popup") as HTMLElement)?.style.zIndex,
      popupPointerEvents: (document.getElementById("injected-answer-popup") as HTMLElement)?.style.pointerEvents,
      contentPointerEvents: (popupContent as HTMLElement).style.pointerEvents,
      bodyHasPopup: document.body.contains(popup)
    });

    // Initialize popup functionality
    this.initializePopupFunctionality();

    console.log("Answer Generation: Full featured popup created");
  }

  private initializePopupFunctionality(): void {
    console.log("Answer Generation: Initializing popup functionality");

    // Auto-detect best template based on selected text
    this.autoDetectTemplate();

    // Load resume information
    this.loadResumeContext();

    // Setup settings buttons
    this.setupSettingsButtons();

    // Setup generate button with both inline onclick AND event listener as fallback
    this.setupGenerateButton();

    // Store reference for access by buttons
    (window as any).answerGenerationManager = this;
  }

  private setupGenerateButton(): void {
    console.log("Answer Generation: Setting up generate button");
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement;
      console.log("Answer Generation: Generate button found:", !!generateBtn);
      
      if (generateBtn) {
        console.log("Answer Generation: Generate button details:", {
          id: generateBtn.id,
          disabled: generateBtn.disabled,
          style: generateBtn.style.cssText,
          visible: generateBtn.offsetWidth > 0 && generateBtn.offsetHeight > 0,
          zIndex: generateBtn.style.zIndex,
          pointerEvents: generateBtn.style.pointerEvents
        });

        // Add a direct event listener as fallback
        generateBtn.addEventListener("click", (e) => {
          console.log("Answer Generation: Generate button clicked via event listener!");
          e.preventDefault();
          e.stopPropagation();
          this.generateAnswer();
        });

        console.log("Answer Generation: Event listener added to generate button");
      } else {
        console.error("Answer Generation: Generate button not found!");
      }
    }, 100);
  }

  private autoDetectTemplate(): void {
    const selectedText = this.popupState.selectedText.toLowerCase();
    const templateSelector = document.getElementById(
      "template-selector",
    ) as HTMLSelectElement;

    if (
      selectedText.includes("job") ||
      selectedText.includes("position") ||
      selectedText.includes("requirements")
    ) {
      templateSelector.value = "job-application";
    } else if (
      selectedText.includes("code") ||
      selectedText.includes("technical") ||
      selectedText.includes("api")
    ) {
      templateSelector.value = "technical-question";
    } else if (
      selectedText.includes("interview") ||
      selectedText.includes("tell me") ||
      selectedText.includes("describe")
    ) {
      templateSelector.value = "interview-response";
    } else {
      templateSelector.value = "general-explanation";
    }
  }

  private async loadResumeContext(): Promise<void> {
    try {
      const selectedText = this.popupState.selectedText.toLowerCase();

      const resumeContext = document.getElementById("resume-context")!;
      const resumeInfo = document.getElementById("resume-info")!;
      const relevanceScore = document.getElementById("relevance-score")!;

      // Only show resume context for job-related content
      if (
        selectedText.includes("job") ||
        selectedText.includes("position") ||
        selectedText.includes("experience") ||
        selectedText.includes("skills") ||
        selectedText.includes("qualification") ||
        selectedText.includes("requirement")
      ) {
        // Fetch user profile from storage
        const profile = await this.getUserProfileFromStorage();
        
        if (profile && profile.resumes && profile.resumes.length > 0) {
          // Find the active resume
          const activeResumeId = profile.settings?.activeResumeId;
          const activeResume = profile.resumes.find((r: any) => r.id === activeResumeId) || profile.resumes[0];
          
          if (activeResume) {
            // Display resume information
            const personalInfo = activeResume.parsedInfo?.personalInfo;
            const skills = activeResume.parsedInfo?.skills || [];
            const experience = activeResume.parsedInfo?.experience || [];
            
            let infoText = `Using "${activeResume.name}" as active resume`;
            
            if (personalInfo?.name) {
              infoText += ` • ${personalInfo.name}`;
            }
            
            if (experience.length > 0) {
              const latestExp = experience[0];
              infoText += ` • ${latestExp.title} at ${latestExp.company}`;
            }
            
            if (skills.length > 0) {
              const topSkills = skills.slice(0, 3).join(", ");
              infoText += ` • Skills: ${topSkills}`;
            }
            
            resumeInfo.textContent = infoText;
            
            // Calculate relevance based on resume content vs selected text
            const relevance = this.calculateRelevanceScore(selectedText, activeResume.text, skills);
            relevanceScore.textContent = `✓ ${relevance}% relevance based on your background`;
            
            (resumeContext as HTMLElement).style.display = "block";
          } else {
            console.log("No active resume found");
          }
        } else {
          // No resumes found
          resumeInfo.textContent = "No resume profile found. Upload a resume to enable personalized responses.";
          relevanceScore.textContent = "";
          (resumeContext as HTMLElement).style.display = "block";
        }
      }
    } catch (error) {
      console.error("Error loading resume context:", error);
      // Hide the resume context section on error
      const resumeContext = document.getElementById("resume-context") as HTMLElement;
      if (resumeContext) {
        resumeContext.style.display = "none";
      }
    }
  }

  private async getUserProfileFromStorage(): Promise<any> {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["userProfile"], (result) => {
          if (result.userProfile) {
            resolve(result.userProfile);
          } else {
            resolve(null);
          }
        });
      } else {
        console.warn("chrome.storage.local is not available. Cannot fetch resume context.");
        resolve(null);
      }
    });
  }

  private calculateRelevanceScore(selectedText: string, resumeText: string, skills: string[]): number {
    let score = 0;
    const selectedWords = selectedText.toLowerCase().split(/\s+/);
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    
    // Check for skill matches
    const skillMatches = skills.filter(skill => 
      selectedText.toLowerCase().includes(skill.toLowerCase())
    ).length;
    score += Math.min(skillMatches * 20, 60); // Max 60% from skills
    
    // Check for keyword matches
    const keywordMatches = selectedWords.filter(word => 
      word.length > 3 && resumeWords.some(resumeWord => resumeWord.includes(word))
    ).length;
    score += Math.min(keywordMatches * 2, 30); // Max 30% from keywords
    
    // Base score for having relevant content
    if (score === 0 && (
      selectedText.includes("job") || 
      selectedText.includes("position") || 
      selectedText.includes("experience")
    )) {
      score = 40; // Base relevance for job-related content
    }
    
    return Math.min(Math.max(score, 25), 95); // Clamp between 25% and 95%
  }

  private setupSettingsButtons(): void {
    const buttons = document.querySelectorAll(".setting-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const setting = target.getAttribute("data-setting");
        const value = target.getAttribute("data-value");

        // Update button states
        const groupButtons = document.querySelectorAll(
          `[data-setting="${setting}"]`,
        );
        groupButtons.forEach((btn) => {
          (btn as HTMLElement).style.background = "white";
          (btn as HTMLElement).style.color = "#374151";
        });
        (target as HTMLElement).style.background = "#2563eb";
        (target as HTMLElement).style.color = "white";
      });
    });
  }

  public async generateAnswer(): Promise<void> {
    console.log("Answer Generation: Starting answer generation");
    console.log("Answer Generation: Method called on manager:", this);
    console.log("Answer Generation: Document ready state:", document.readyState);
    console.log("Answer Generation: Selected text:", this.popupState.selectedText);
    console.log("Answer Generation: Popup visible:", this.popupState.isVisible);

    // Check if popup exists
    const popup = document.getElementById("injected-answer-popup");
    console.log("Answer Generation: Popup exists:", !!popup);

    const generateBtn = document.getElementById(
      "generate-btn",
    ) as HTMLButtonElement;
    const loadingState = document.getElementById(
      "loading-state",
    ) as HTMLDivElement;
    const answerSection = document.getElementById(
      "answer-section",
    ) as HTMLDivElement;
    const errorDiv = document.getElementById("popup-error") as HTMLDivElement;
    const errorMsg = document.getElementById(
      "error-message",
    ) as HTMLParagraphElement;

    console.log("Answer Generation: DOM elements found:", {
      generateBtn: !!generateBtn,
      loadingState: !!loadingState,
      answerSection: !!answerSection,
      errorDiv: !!errorDiv,
      errorMsg: !!errorMsg,
    });

    // Show loading state
    (generateBtn as HTMLElement).style.display = "none";
    (loadingState as HTMLElement).style.display = "block";
    (answerSection as HTMLElement).style.display = "none";
    (errorDiv as HTMLElement).style.display = "none";

    try {
      console.log("Answer Generation: Entering try block");

      // Get current settings
      const template = (
        document.getElementById("template-selector") as HTMLSelectElement
      ).value;
      console.log("Answer Generation: Template selected:", template);

      const toneButton = document.querySelector(
        '.setting-btn[style*="background: #2563eb"]',
      ) as HTMLElement;
      const tone = toneButton?.getAttribute("data-value") || "professional";
      console.log("Answer Generation: Tone selected:", tone);

      // Create prompt based on template and settings
      const prompt = this.createPrompt(template, tone);

      console.log(
        "Answer Generation: Generated prompt:",
        prompt.substring(0, 200) + "...",
      );

      // Simulate API call (replace with actual implementation)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      // Generate mock answer based on template
      const answer = this.generateMockAnswer(template, tone);

      // Display answer
      const answerElement = document.getElementById(
        "generated-answer",
      ) as HTMLParagraphElement;
      answerElement.textContent = answer;
      (answerSection as HTMLElement).style.display = "block";
    } catch (error) {
      console.error("Answer generation error:", error);
      errorMsg.textContent = "Failed to generate answer. Please try again.";
      (errorDiv as HTMLElement).style.display = "block";
    } finally {
      (generateBtn as HTMLElement).style.display = "block";
      (loadingState as HTMLElement).style.display = "none";
    }
  }

  private createPrompt(template: string, tone: string): string {
    const selectedText = this.popupState.selectedText;

    const prompts = {
      "job-application": `You are a professional career coach. Generate a compelling response for a job application based on this text: "${selectedText}". Use a ${tone} tone and highlight relevant qualifications and experience.`,

      "technical-question": `You are a technical expert. Provide a detailed explanation of this technical concept: "${selectedText}". Use a ${tone} tone with specific examples and clear explanations.`,

      "interview-response": `You are an interview coach. Help craft a thoughtful response to this interview question: "${selectedText}". Use the STAR method and a ${tone} tone to showcase relevant experience.`,

      "general-explanation": `You are a helpful assistant. Provide a clear, informative explanation about: "${selectedText}". Use a ${tone} tone and make it easy to understand.`,
    };

    return (
      prompts[template as keyof typeof prompts] ||
      prompts["general-explanation"]
    );
  }

  private generateMockAnswer(template: string, tone: string): string {
    const answers = {
      "job-application": `Based on the requirements you've outlined, I believe I would be an excellent fit for this position. My background includes extensive experience in project management, team leadership, and strategic planning - all key areas you've mentioned as important for success in this role.

In my previous position, I successfully managed cross-functional teams of 15+ members, delivering complex projects on time and under budget. This experience has given me strong skills in communication, problem-solving, and stakeholder management that directly align with what you're looking for.

I'm particularly excited about the opportunity to contribute to your organization's growth and would welcome the chance to discuss how my experience can benefit your team.`,

      "technical-question": `This is an excellent technical question that requires a comprehensive approach. Here's how I would address it:

**Technical Analysis:**
- The core issue involves understanding the underlying architecture and data flow
- Performance considerations are critical when scaling to production levels
- Security implications must be evaluated throughout the implementation

**Recommended Solution:**
1. Begin with a solid foundation using established patterns
2. Implement proper error handling and validation
3. Add comprehensive testing coverage
4. Consider monitoring and observability from day one

**Best Practices:**
- Follow SOLID principles and clean architecture patterns
- Use dependency injection for better testability
- Implement proper logging and monitoring
- Ensure code is well-documented and maintainable

The key is to balance immediate functionality with long-term maintainability and scalability.`,

      "interview-response": `That's a great question. Let me tell you about a challenging project that really demonstrated my problem-solving abilities.

**Situation:** In my previous role, we faced a critical system failure just before a major client presentation. The application's performance had degraded significantly due to database issues, and we had less than 24 hours to resolve it.

**Task:** As the technical lead, I needed to diagnose the root cause quickly and implement a solution that wouldn't break anything else.

**Action:** I immediately gathered the team and created a diagnostic plan. We discovered that database queries weren't optimized, causing slow response times. I worked with the database team to implement query optimization and added proper indexing. I also implemented caching to reduce database load.

**Result:** We not only fixed the immediate issue but improved overall system performance by 40%. The presentation went perfectly, and the client was impressed with both the solution and our responsiveness.

This experience taught me the importance of systematic problem-solving and the value of cross-team collaboration under pressure.`,

      "general-explanation": `Let me break this down into clear, manageable components:

**Key Concepts:**
- This topic involves multiple interconnected elements that work together
- Understanding the fundamental principles makes the details much clearer
- Real-world examples help illustrate abstract concepts

**Practical Application:**
- Start with the basics and build complexity gradually
- Focus on understanding *why* something works, not just *how*
- Practice with hands-on examples to reinforce learning
- Don't hesitate to ask questions when something isn't clear

**Best Approach:**
1. Begin with the high-level overview to see the big picture
2. Dive into specific components one at a time
3. Look for patterns and connections between different parts
4. Apply what you've learned to practical scenarios

The most effective way to master this topic is through consistent practice and gradual exposure to increasingly complex scenarios.`,
    };

    return (
      answers[template as keyof typeof answers] ||
      answers["general-explanation"]
    );
  }

  public async copyAnswer(format: string): Promise<void> {
    const answerElement = document.getElementById(
      "generated-answer",
    ) as HTMLParagraphElement;
    const answer = answerElement.textContent || "";

    let formattedAnswer = answer;

    if (format === "linkedin") {
      formattedAnswer = `💼 ${answer}\n\n#Career #Professional #JobSearch`;
    }

    try {
      await navigator.clipboard.writeText(formattedAnswer);

      // Show success message
      const successMsg = document.getElementById(
        "copy-success",
      ) as HTMLDivElement;
      (successMsg as HTMLElement).style.display = "block";

      setTimeout(() => {
        (successMsg as HTMLElement).style.display = "none";
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard. Please try again.");
    }
  }

  public exportAnswer(): void {
    const answerElement = document.getElementById(
      "generated-answer",
    ) as HTMLParagraphElement;
    const answer = answerElement.textContent || "";
    const template = (
      document.getElementById("template-selector") as HTMLSelectElement
    ).value;
    const timestamp = new Date().toISOString().split("T")[0];

    const content = `# Generated Answer\n\n**Template:** ${template}\n**Generated:** ${new Date().toLocaleString()}\n**Source Text:** ${this.popupState.selectedText}\n\n## Generated Answer:\n${answer}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answer-${template}-${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public testPopup(): void {
    console.log("Answer Generation: Manual test popup called");

    // Simulate text selection
    const testPosition = { x: 200, y: 200 };
    this.popupState.selectedText =
      "This is test text for popup verification. Select any text to test the real functionality.";

    console.log(
      "Answer Generation: Showing test popup at position:",
      testPosition,
    );
    this.showInjectedPopup(this.popupState.selectedText, testPosition);
  }

  public debugPopup(): void {
    console.log("Answer Generation: Debug popup state:", {
      popupElement: this.popupElement,
      popupState: this.popupState,
      isInDOM: !!document.getElementById("answer-generation-popup"),
      injectedPopup: !!document.getElementById("injected-answer-popup"),
    });
  }
}

// CRITICAL: Set up immediate global safety wrapper BEFORE anything else
console.log("Answer Generation: IMMEDIATE wrapper setup starting...");

// Set up immediate global safety wrapper - available before any onclick events
(window as any).safeAnswerGenerationManager = {
  generateAnswer: () => {
    console.log("Safe wrapper: generateAnswer called");
    console.log("Safe wrapper: Manager available:", !!(window as any).answerGenerationManager);
    try {
      const manager = (window as any).answerGenerationManager;
      if (manager && typeof manager.generateAnswer === 'function') {
        console.log("Safe wrapper: Calling manager.generateAnswer");
        return manager.generateAnswer();
      } else {
        console.error("Safe wrapper: Manager not ready yet, waiting...");
        console.log("Safe wrapper: Manager type:", typeof manager);
        console.log("Safe wrapper: Has generateAnswer?", manager && typeof manager.generateAnswer);
        // Wait a bit and retry
        setTimeout(() => {
          const retryManager = (window as any).answerGenerationManager;
          console.log("Safe wrapper: Retry - Manager available:", !!(window as any).retryManager);
          console.log("Safe wrapper: Retry - Manager type:", typeof retryManager);
          console.log("Safe wrapper: Retry - Has generateAnswer?", retryManager && typeof retryManager.generateAnswer);
          if (retryManager && typeof retryManager.generateAnswer === 'function') {
            console.log("Safe wrapper: Retrying manager.generateAnswer");
            return retryManager.generateAnswer();
          } else {
            console.error("Safe wrapper: Manager still not available after retry");
            console.log("Safe wrapper: Available window properties:", Object.keys(window).filter(k => k.includes('answer')));
            if (typeof alert !== 'undefined') {
              alert("Answer Generation: Extension is loading, please try again in a moment.");
            }
          }
        }, 100);
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Safe wrapper: Error in generateAnswer:", error);
      if (typeof alert !== 'undefined') {
        alert("Answer Generation: An error occurred. Please try again.");
      }
      return Promise.resolve();
    }
  },
  
  copyAnswer: (format: string) => {
    console.log(`Safe wrapper: copyAnswer(${format}) called`);
    try {
      const manager = (window as any).answerGenerationManager;
      if (manager && typeof manager.copyAnswer === 'function') {
        return manager.copyAnswer(format);
      } else {
        console.error("Safe wrapper: Manager not ready for copyAnswer");
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Safe wrapper: Error in copyAnswer:", error);
      return Promise.resolve();
    }
  },
  
  exportAnswer: () => {
    console.log("Safe wrapper: exportAnswer called");
    try {
      const manager = (window as any).answerGenerationManager;
      if (manager && typeof manager.exportAnswer === 'function') {
        return manager.exportAnswer();
      } else {
        console.error("Safe wrapper: Manager not ready for exportAnswer");
      }
    } catch (error) {
      console.error("Safe wrapper: Error in exportAnswer:", error);
    }
  }
};

console.log("Answer Generation: IMMEDIATE wrapper setup complete");
console.log("Answer Generation: Wrapper available:", typeof (window as any).safeAnswerGenerationManager);

// Also provide a backup global for onclick handlers
(window as any).AGWrapper = (window as any).safeAnswerGenerationManager;

console.log("Answer Generation: Backup wrapper AGWrapper also set");

// Main content script starts here
console.log("Answer Generation: Creating AnswerGenerationManager instance");
const answerGenerationManager = new AnswerGenerationManager();

// Make manager globally accessible for popup onclick handlers
(window as any).answerGenerationManager = answerGenerationManager;

// Also expose individual methods as globals for direct onclick access
(window as any).generateAnswer = () => answerGenerationManager.generateAnswer();
(window as any).copyAnswer = (format: string) =>
  answerGenerationManager.copyAnswer(format);
(window as any).exportAnswer = () => answerGenerationManager.exportAnswer();

// Make test methods globally available for debugging
(window as any).testAnswerGenerationPopup = () =>
  answerGenerationManager.testPopup();
(window as any).debugAnswerGenerationPopup = () =>
  answerGenerationManager.debugPopup();
(window as any).manualTestGenerate = () => {
  console.log("Manual test: Calling generateAnswer directly");
  return answerGenerationManager.generateAnswer();
};

console.log("Answer Generation: Test methods available:");
console.log("- window.testAnswerGenerationPopup() - Test popup manually");
console.log("- window.debugAnswerGenerationPopup() - Debug popup state");
console.log("- window.manualTestGenerate() - Test generateAnswer directly");
