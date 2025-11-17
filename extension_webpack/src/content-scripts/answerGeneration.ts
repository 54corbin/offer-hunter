console.log("Answer Generation content script loaded.");
console.log("Answer Generation: DOM ready state:", document.readyState);
console.log("Answer Generation: Current URL:", window.location.href);

interface PopupState {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
}

class AnswerGenerationManager {
  private popupState: PopupState = {
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedText: "",
  };

  private popupElement: HTMLElement | null = null;
  private hideTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    console.log("Answer Generation: Initializing AnswerGenerationManager");
    console.log("Answer Generation: Document ready state:", document.readyState);
    this.createPopup();
    this.addEventListeners();
    console.log("Answer Generation: Initialization complete");
  }

  private createPopup(): void {
    console.log("Answer Generation: createPopup called");
    
    // Remove existing popup if present
    this.removePopup();

    const popup = document.createElement("div");
    popup.id = "answer-generation-popup";
    popup.className = "answer-generation-popup";
    
    console.log("Answer Generation: Created popup element:", popup);
    
    // Use simple, aggressive inline styles that override everything
    popup.style.cssText = `
      position: fixed !important;
      z-index: 2147483647 !important;
      background: white !important;
      border: 2px solid #3b82f6 !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
      padding: 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      cursor: pointer !important;
      opacity: 0 !important;
      transform: scale(0.8) !important;
      transition: all 0.2s ease !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      min-width: 120px !important;
      justify-content: center !important;
      background-color: #ffffff !important;
      color: #374151 !important;
      font-weight: 600 !important;
      visibility: hidden !important;
    `;

    // Add icon and text with more explicit styling
    popup.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; color: #3b82f6; font-weight: 600;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        <span>Answer</span>
      </div>
    `;

    console.log("Answer Generation: Popup innerHTML set:", popup.innerHTML);
    
    // Append to body
    document.body.appendChild(popup);
    console.log("Answer Generation: Popup appended to body");
    
    this.popupElement = popup;
    console.log("Answer Generation: Popup element stored:", this.popupElement);

    // Verify popup is in DOM
    const verifyPopup = document.getElementById("answer-generation-popup");
    console.log("Answer Generation: Verified popup in DOM:", verifyPopup);

    // Add hover event listener with delay to prevent premature triggering
    let hoverTimeout: NodeJS.Timeout;
    popup.addEventListener("mouseenter", () => {
      console.log("Answer Generation: Mouse entered popup");
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.showFullMenu();
      }, 300); // Delay to prevent accidental triggers
    });
    
    popup.addEventListener("mouseleave", () => {
      console.log("Answer Generation: Mouse left popup");
      clearTimeout(hoverTimeout);
      // Don't auto-hide immediately on mouse leave, let the timeout handle it
    });
    
    console.log("Answer Generation: Hover event listeners added");
  }

  private removePopup(): void {
    const existingPopup = document.getElementById("answer-generation-popup");
    if (existingPopup) {
      existingPopup.remove();
    }
    this.popupElement = null;
  }

  private addEventListeners(): void {
    console.log("Answer Generation: Adding event listeners");
    
    // Listen for text selection with debouncing
    let selectionTimeout: NodeJS.Timeout;
    document.addEventListener("mouseup", () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        this.handleTextSelection();
      }, 100); // Small delay to avoid multiple triggers
    });
    
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.hidePopup();
      }
    });

    // Don't hide popup when clicking outside if we're still in selection mode
    document.addEventListener("click", (e) => {
      console.log("Answer Generation: Document click detected");
      if (this.popupState.isVisible && this.popupElement) {
        const target = e.target as Node;
        const isPopupClick = this.popupElement.contains(target);
        const isSelectionClick = this.isSelection(target);
        
        console.log("Answer Generation: Click analysis:", { isPopupClick, isSelectionClick });
        
        if (!isPopupClick && !isSelectionClick) {
          console.log("Answer Generation: Hiding popup due to outside click");
          this.hidePopup();
        }
      }
    });
    
    console.log("Answer Generation: Event listeners added");
  }

  private isSelection(node: Node): boolean {
    const selection = window.getSelection();
    return selection?.containsNode(node) || false;
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
    console.log("Answer Generation: Selected text length:", selectedText.length);
    console.log("Answer Generation: Selected text preview:", selectedText.substring(0, 50));
    
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
      y: rect.top - 10
    };

    console.log("Answer Generation: Calculated position:", position);
    this.showPopup(position);
  }

  private showPopup(position: { x: number; y: number }): void {
    console.log("Answer Generation: showPopup called with position:", position);
    
    if (!this.popupElement) {
      console.log("Answer Generation: Popup element not found!");
      return;
    }
    
    console.log("Answer Generation: Popup element found:", this.popupElement);

    this.popupState.position = position;
    this.popupState.isVisible = true;

    // Position the popup with better logic
    const adjustedX = Math.max(10, Math.min(position.x - 60, window.innerWidth - 140));
    const adjustedY = Math.max(10, position.y - 50);
    
    console.log("Answer Generation: Adjusted position:", { adjustedX, adjustedY });
    console.log("Answer Generation: Window size:", { width: window.innerWidth, height: window.innerHeight });

    // Set position
    this.popupElement.style.left = `${adjustedX}px`;
    this.popupElement.style.top = `${adjustedY}px`;
    console.log("Answer Generation: Position styles applied");

    // Show with animation - make it visible
    this.popupElement.style.opacity = "1";
    this.popupElement.style.transform = "scale(1)";
    this.popupElement.style.pointerEvents = "auto";
    this.popupElement.style.display = "flex";
    this.popupElement.style.visibility = "visible";
    
    console.log("Answer Generation: Visibility styles applied");
    console.log("Answer Generation: Current popup state:", {
      opacity: this.popupElement.style.opacity,
      display: this.popupElement.style.display,
      visibility: this.popupElement.style.visibility,
      left: this.popupElement.style.left,
      top: this.popupElement.style.top
    });

    // Force a reflow to ensure styles are applied
    this.popupElement.offsetHeight;
    
    console.log("Answer Generation: Popup should now be visible");

    // Schedule hide AFTER a minimum display time
    setTimeout(() => {
      if (this.popupState.isVisible) {
        console.log("Answer Generation: Minimum display time elapsed, scheduling hide");
        this.scheduleHide();
      }
    }, 1000); // Wait at least 1 second before scheduling auto-hide
  }

  private scheduleHide(): void {
    console.log("Answer Generation: Scheduling popup hide in 5 seconds");
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = setTimeout(() => {
      console.log("Answer Generation: Auto-hiding popup after timeout");
      this.hidePopup();
    }, 5000); // Increased from 3 to 5 seconds
  }

  public hidePopup(): void {
    console.log("Answer Generation: hidePopup called", { 
      isVisible: this.popupState.isVisible, 
      hasElement: !!this.popupElement 
    });
    
    if (this.popupElement && this.popupState.isVisible) {
      console.log("Answer Generation: Hiding popup");
      
      this.popupElement.style.opacity = "0";
      this.popupElement.style.transform = "scale(0.8)";
      this.popupElement.style.pointerEvents = "none";
      this.popupElement.style.visibility = "hidden";
      
      setTimeout(() => {
        if (this.popupElement) {
          this.popupElement.style.display = "none";
          console.log("Answer Generation: Popup display set to none");
        }
      }, 200);

      this.popupState.isVisible = false;
    } else {
      console.log("Answer Generation: Skipping hide - not visible or no element");
    }

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
      console.log("Answer Generation: Cleared hide timeout");
    }
  }

  public testPopup(): void {
    console.log("Answer Generation: Manual test popup called");
    
    // Simulate text selection by creating a test position
    const testPosition = { x: 200, y: 200 };
    this.popupState.selectedText = "This is test text for popup verification. Select any text to test the real functionality.";
    
    console.log("Answer Generation: Showing test popup at position:", testPosition);
    this.showPopup(testPosition);
    
    console.log("Answer Generation: Test popup displayed - now try selecting real text!");
  }

  public debugPopup(): void {
    console.log("Answer Generation: Debug popup state:", {
      popupElement: this.popupElement,
      popupState: this.popupState,
      isInDOM: !!document.getElementById("answer-generation-popup"),
      computedStyles: this.popupElement ? window.getComputedStyle(this.popupElement) : null
    });
  }

  public showFullMenu(): void {
    console.log("Answer Generation: showFullMenu called");
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (!this.popupElement) {
      console.log("Answer Generation: Popup element not found in showFullMenu");
      return;
    }

    // Send message to background script to open full menu
    console.log("Answer Generation: Sending OPEN_ANSWER_GENERATION_MENU message");
    chrome.runtime.sendMessage({
      type: "OPEN_ANSWER_GENERATION_MENU",
      data: {
        selectedText: this.popupState.selectedText,
        position: this.popupState.position
      }
    }, (response) => {
      console.log("Answer Generation: Message response:", response);
    });
  }
}

// Initialize the manager
console.log("Answer Generation: Creating AnswerGenerationManager instance");
const answerGenerationManager = new AnswerGenerationManager();

// Make test methods globally available for debugging
(window as any).testAnswerGenerationPopup = () => answerGenerationManager.testPopup();
(window as any).debugAnswerGenerationPopup = () => answerGenerationManager.debugPopup();

console.log("Answer Generation: Test methods available:");
console.log("- window.testAnswerGenerationPopup() - Test popup manually");
console.log("- window.debugAnswerGenerationPopup() - Debug popup state");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Answer Generation: Received message:", message);
  if (message.type === "HIDE_ANSWER_POPUP") {
    console.log("Answer Generation: Hiding popup via message");
    answerGenerationManager.hidePopup();
  }
  sendResponse({ status: "ok" });
});