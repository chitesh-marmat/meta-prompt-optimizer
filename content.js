console.log("✅ Prompt Optimizer content script loaded");

// Track the current contenteditable element to detect replacements
let currentPromptInput = null;
let injectedButton = null;


// Toast notification helper
function showToast(message) {
  const existingToast = document.getElementById('prompt-optimizer-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'prompt-optimizer-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111',
    color: '#fff',
    padding: '14px 22px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 5000);
} 

// Function to find the ChatGPT prompt contenteditable textbox
function findPromptInput() {
  // Common selector for ChatGPT's main prompt contenteditable element
  // Try multiple selectors for reliability
  return document.querySelector('div[contenteditable="true"][data-id="root"]') ||
         document.querySelector('div[contenteditable="true"][role="textbox"]') ||
         document.querySelector('div[contenteditable="true"][aria-label*="Message"]') ||
         document.querySelector('div[contenteditable="true"][tabindex="0"]');
}

// Helper function to get ChatGPT prompt text from contenteditable elements
function getChatGPTPromptText() {
  // Select all elements with contenteditable="true"
  const contenteditables = document.querySelectorAll('[contenteditable="true"]');
  
  // Iterate through them and return the first non-empty innerText
  for (const element of contenteditables) {
    const text = element.innerText?.trim() || "";
    if (text.length > 0) {
      return { text, element };
    }
  }
  
  // Return null if no editor contains text
  return null;
}

// Function to replace text in contenteditable and trigger ChatGPT's internal state update
function replacePromptText(element, newText) {
  if (!element) return;

  // Focus input
  element.focus();

  // Reliable selection for contenteditable (ChatGPT-safe)
  document.execCommand('selectAll');

  // Copy optimized text to clipboard
  navigator.clipboard.writeText(newText).then(() => {
    console.log('📋 Optimized prompt copied to clipboard:', newText);
    showToast('✨ Prompt optimized — Press ⌘V to replace');
  });

  console.log('✅ Optimized prompt ready:', newText);
}

// Function to inject a visible button near the prompt input
function injectButton(promptInput) {
  // Don't inject if button already exists in the DOM
  if (injectedButton && document.body.contains(injectedButton)) {
    return;
  }

  // Find the parent container (usually a form or input wrapper)
  let container = promptInput.closest('form') || 
                  promptInput.closest('div[class*="input"]') ||
                  promptInput.parentElement;

  if (!container) return;

  // Create button with stable identifier
  const button = document.createElement('button');
  button.id = 'prompt-optimize-btn';
  button.setAttribute('data-prompt-optimizer', 'true');
  button.textContent = 'Optimize';
  button.style.cssText = `
    padding: 8px 16px;
    margin: 8px;
    background-color: #10a37f;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;

  // Attach click handler directly to the button (required for shadow DOM)
  button.addEventListener('click', (e) => {
    console.log('🔥 Optimize button clicked');
    
    // Get the prompt text using the helper function
    const result = getChatGPTPromptText();
    if (result) {
      handleOptimizePrompt(result.text, result.element);
    }
  });

  // Insert button near the prompt input
  if (container.parentElement) {
    container.parentElement.insertBefore(button, container.nextSibling);
    injectedButton = button;
    console.log('🔵 Optimize button injected:', button);
  }
}

// Function to check and log contenteditable detection
function checkPromptInput() {
  const promptInput = findPromptInput();
  
  // If promptInput exists and it's different from the current one
  if (promptInput && promptInput !== currentPromptInput) {
    currentPromptInput = promptInput;
    console.log('ChatGPT textarea detected');
  }
  
  // Always try to inject button if prompt input exists (will skip if already injected)
  if (promptInput) {
    injectButton(promptInput);
  }
}

// Initial check when script loads
checkPromptInput();

// Use MutationObserver to watch for DOM changes (React re-renders)
const observer = new MutationObserver(() => {
  checkPromptInput();
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Function to handle prompt optimization
function handleOptimizePrompt(promptText, element) {
  chrome.runtime.sendMessage(
    {
      action: 'optimizePrompt',
      prompt: promptText
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Runtime error:', chrome.runtime.lastError.message);
        return;
      }

      if (!response) {
        console.error('❌ No response from background script');
        return;
      }

      if (response.error) {
        console.error('❌ Error from background script:', response.error);
        return;
      }

      if (response.optimizedPrompt) {
        // Replace the text in the contenteditable element
        replacePromptText(element, response.optimizedPrompt);
      } else {
        console.error('❌ No optimized prompt received from background script');
      }
    }
  );
}

// Keyboard shortcut handler (Cmd+Shift+O on macOS, Ctrl+Shift+O on Windows/Linux)
document.addEventListener('keydown', (e) => {
  // Check for Cmd+Shift+O (macOS) or Ctrl+Shift+O (Windows/Linux)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? e.metaKey : e.ctrlKey;
  const isShortcut = modifierKey && e.shiftKey && (e.key === 'o' || e.key === 'O');
  
  if (isShortcut) {
    e.preventDefault(); // Prevent any default browser behavior
    
    console.log('🔥 Optimizer triggered via keyboard shortcut');
    
    // Get the prompt text and element using the helper function
    const result = getChatGPTPromptText();
    if (result) {
      console.log('📝 Original prompt text:', result.text);
      handleOptimizePrompt(result.text, result.element);
    } else {
      console.log('⚠️ No prompt text found to optimize');
    }
  }
});
