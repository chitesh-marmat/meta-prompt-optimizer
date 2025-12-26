# Prompt Optimizer

A Chrome extension that automatically rewrites raw, casually written prompts into clearer, more detailed, and higher-quality prompts for AI tools like ChatGPT — without changing the user’s original intent.

This project is based on a simple observation: **better explained and more structured prompts consistently produce better AI outputs.**

Instead of teaching users prompt engineering, the extension applies a lightweight *meta-prompting* approach. It intercepts a user’s prompt and rewrites it into a clearer, more effective version *before* it reaches the AI model.

The project was intentionally built in a fast, experimental, and iterative way (vibe-coded). Features and design decisions evolved based on what actually broke while testing on real, modern web apps like ChatGPT, rather than following a rigid upfront design.

---

## Features

- Keyboard shortcut to optimize prompts instantly  
  - macOS: Cmd + Shift + O  
  - Windows/Linux: Ctrl + Shift + O
- Automatically detects the active ChatGPT prompt
- Optimizes the prompt using an AI-powered meta-prompt
- Copies the optimized prompt directly to the clipboard
- Toast notification confirming successful optimization
- Optional on-page **Optimize** button injected near the prompt
- Supports multiple AI providers:
  - Gemini
  - OpenAI
  - Groq
- Provider selection and API key management via a settings page
- Fully client-side — no backend required
- Provider-agnostic design for easy extension

---

## Tech Stack

- JavaScript (ES6)
- Chrome Extension APIs (Manifest V3)
- Content Scripts and Background Service Workers
- Chrome Storage API
- HTML & CSS (Options / Settings UI)
- AI APIs:
  - Google Gemini
  - OpenAI
  - Groq (OpenAI-compatible)

---

## How to Install & Test (Local)

1. Clone or download this repository
2. Open Google Chrome
3. Navigate to `chrome://extensions`
4. Enable **Developer mode** (top-right corner)
5. Click **Load unpacked**
6. Select the project folder (the one containing `manifest.json`)
7. The extension will now appear in your extensions list

---

## Usage

1. Open ChatGPT in your browser
2. Type a prompt normally in the input box
3. Trigger optimization using one of the following:
   - Press **Cmd + Shift + O** (macOS)
   - Press **Ctrl + Shift + O** (Windows/Linux)
   - Click the **Optimize** button near the prompt
4. The optimized prompt is copied to your clipboard
5. Paste it back into the input using **Cmd + V** / **Ctrl + V**
6. Submit the improved prompt

A toast notification confirms when the prompt has been optimized.

---

## Future Improvements

- Smarter intent detection (how-to vs creative vs coding prompts)
- Preview diff between original and optimized prompts
- Per-category optimization modes
- Support for additional AI providers
- Optional auto-paste behavior
- Support for more websites beyond ChatGPT

---

## License

MIT License