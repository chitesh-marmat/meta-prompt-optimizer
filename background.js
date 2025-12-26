// Background service worker for Prompt Optimizer

// System instruction for prompt optimization
const OPTIMIZATION_SYSTEM_PROMPT = `
You are an expert prompt engineer.

Your task is to rewrite the user's prompt into a **high-quality, detailed, and effective prompt** that an AI assistant would understand clearly and respond to well.

Rewrite the prompt as if it were written by an experienced user who knows how to get the best results from AI tools (like Cursor or advanced ChatGPT users).

Guidelines:
- Preserve the user's original intent and question
- Make the prompt clearer, more specific, and more detailed
- Add helpful context, constraints, or structure if it improves the result
- Convert vague or casual wording into precise instructions
- If appropriate, rephrase as a clear question or task
- Do NOT add extra tasks the user did not imply
- Do NOT explain what you changed

Return ONLY the optimized prompt text.
`;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'optimizePrompt') {
    const originalPrompt = request.prompt;
    
    console.log('📥 Received prompt for optimization:', originalPrompt);
    
    // Handle optimization asynchronously using provider-agnostic routing
    optimizePrompt(originalPrompt)
      .then((optimizedPrompt) => {
        console.log('📤 Sending optimized prompt:', optimizedPrompt);
        sendResponse({ optimizedPrompt: optimizedPrompt });
      })
      .catch((error) => {
        console.error('❌ Error optimizing prompt:', error);
        sendResponse({ error: error.message || 'Failed to optimize prompt' });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Helper function to get storage value
function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

// Provider-agnostic prompt optimization function
async function optimizePrompt(prompt) {
  // Get selected provider (default to 'gemini')
  const provider = await getStorageValue('selectedProvider') || 'groq';
  
  // Route to the selected provider
  if (provider === 'gemini') {
    return await optimizePromptWithGemini(prompt);
  } else if (provider === 'openai') {
    return await optimizePromptWithOpenAI(prompt);
  } else if (provider === 'groq') {
    return await optimizePromptWithGroq(prompt);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

// Gemini provider implementation
async function optimizePromptWithGemini(prompt) {
  // Get API key from storage
  const apiKey = await getStorageValue('geminiApiKey');
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key not found. Please set it in extension settings.');
  }
  
  // Construct the optimization prompt for Gemini
  const optimizationPrompt = `${OPTIMIZATION_SYSTEM_PROMPT}\n\nUser prompt to optimize:\n${prompt}`;
  
  // Call Gemini API (using gemini-pro for free-tier)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: optimizationPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Extract the optimized prompt from the response
  const optimizedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  if (!optimizedPrompt) {
    throw new Error('No optimized prompt returned from Gemini API');
  }
  
  return optimizedPrompt;
}

// OpenAI provider implementation
async function optimizePromptWithOpenAI(prompt) {
  // Get API key from storage
  const apiKey = await getStorageValue('openaiApiKey');
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OpenAI API key not found. Please set it in extension settings.');
  }
  
  // Call OpenAI Chat Completions API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: OPTIMIZATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Extract the optimized prompt from the response
  const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();
  
  if (!optimizedPrompt) {
    throw new Error('No optimized prompt returned from OpenAI API');
  }
  
  return optimizedPrompt;
}

// Groq provider implementation
async function optimizePromptWithGroq(prompt) {
  // Get API key from storage
  const apiKey = await getStorageValue('groqApiKey');
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Groq API key not found. Please set it in extension settings.');
  }
  
  // Call Groq API (OpenAI-compatible)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: OPTIMIZATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Extract the optimized prompt from the response
  const optimizedPrompt = data.choices?.[0]?.message?.content?.trim();
  
  if (!optimizedPrompt) {
    throw new Error('No optimized prompt returned from Groq API');
  }
  
  return optimizedPrompt;
}
