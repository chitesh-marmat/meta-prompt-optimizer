// Options page script for Prompt Optimizer

// Update UI based on selected provider
function updateUI(provider) {
  const geminiGroup = document.getElementById('geminiKeyGroup');
  const openaiGroup = document.getElementById('openaiKeyGroup');
  const groqGroup = document.getElementById('groqKeyGroup');
  
  // Hide all inputs
  geminiGroup.classList.remove('active');
  openaiGroup.classList.remove('active');
  groqGroup.classList.remove('active');
  
  // Show relevant input
  if (provider === 'gemini') {
    geminiGroup.classList.add('active');
  } else if (provider === 'openai') {
    openaiGroup.classList.add('active');
  } else if (provider === 'groq') {
    groqGroup.classList.add('active');
  }
}

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['selectedProvider', 'geminiApiKey', 'openaiApiKey', 'groqApiKey'], (result) => {
    const provider = result.selectedProvider || 'gemini';
    document.getElementById('provider').value = provider;
    updateUI(provider);
    
    // Load saved API keys
    if (result.geminiApiKey) {
      document.getElementById('geminiApiKey').value = result.geminiApiKey;
    }
    if (result.openaiApiKey) {
      document.getElementById('openaiApiKey').value = result.openaiApiKey;
    }
    if (result.groqApiKey) {
      document.getElementById('groqApiKey').value = result.groqApiKey;
    }
  });
  
  // Handle provider selection change
  document.getElementById('provider').addEventListener('change', (e) => {
    updateUI(e.target.value);
  });
});

// Handle form submission
document.getElementById('optionsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const provider = document.getElementById('provider').value;
  const geminiKey = document.getElementById('geminiApiKey').value.trim();
  const openaiKey = document.getElementById('openaiApiKey').value.trim();
  const groqKey = document.getElementById('groqApiKey').value.trim();
  const messageEl = document.getElementById('message');
  
  // Prepare storage object
  const storageData = {
    selectedProvider: provider
  };
  
  // Save API keys (empty strings remove the key)
  if (geminiKey === '') {
    chrome.storage.local.remove(['geminiApiKey']);
  } else {
    storageData.geminiApiKey = geminiKey;
  }
  
  if (openaiKey === '') {
    chrome.storage.local.remove(['openaiApiKey']);
  } else {
    storageData.openaiApiKey = openaiKey;
  }
  
  if (groqKey === '') {
    chrome.storage.local.remove(['groqApiKey']);
  } else {
    storageData.groqApiKey = groqKey;
  }
  
  // Save to chrome.storage.local
  chrome.storage.local.set(storageData, () => {
    messageEl.textContent = 'Settings saved successfully!';
    messageEl.className = 'message success';
    messageEl.style.display = 'block';
    
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  });
});

