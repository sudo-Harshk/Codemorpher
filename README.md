# 📘 Codemorpher

Codemorpher is a full-stack web application that allows users to input Java code and get translated versions in multiple languages like JavaScript, Python, C, C++, PHP, and more. It also generates debugging steps and algorithms, with full test coverage powered by Cypress.

## 🌐 Live Demo

- Frontend: https://monumental-peony-b9a6b3.netlify.app
- Backend API (Ping): https://codemorpher-backend.onrender.com/ping
- Telegram Bot: @CodemorpherAIbot

## 🚀 Features

- ✨ **Multi-language Translation**: Java → JavaScript, Python, C, C++, C#, PHP, and more  
- 🪄 **Debugging Steps**: Line-by-line guidance to trace and fix logic  
- 📚 **Algorithm Outline**: High-level pseudocode summary of your logic  
- 📋 **Copy & Run**: Copy translated code or run it in an online compiler  
- 📱 **Responsive Design**: Supports mobile, tablet, and desktop viewports  
- 🤖 **Telegram Bot**: Access Codemorpher's translation capabilities directly through Telegram
- 📷 **Image-to-Code**: Upload and extract Java code from images using Google's Gemini API
- ✅ **End-to-End Tests**: Comprehensive Cypress suite with screenshots and Mochawesome reports  
- ⚙️ **Error Handling**: Graceful fallback for network/server errors

## 🛠️ Tech Stack

### Frontend:
- Vanilla HTML, CSS, JavaScript  
- Prism.js for syntax highlighting

### Backend:
- Node.js + Express  
- OpenRouter GPT (primary) 
- Firebase for logging translation requests & errors

### Bots:
- Telegram Bot API with node-telegram-bot-api
- Express webhook handler for bot communication
- Axios for HTTP requests to backend services
- Google Gemini API for image code extraction
- OpenRouter API with Meta Llama for code validation

### Testing & Reporting:
- Cypress (E2E)  
- Mochawesome, mochawesome-merge, and marge for HTML reports

### Deployment:
- Frontend: Netlify  
- Backend: Render
- Bot: Render (webhook)

## 📂 Project Structure

```
CODEMORPHER/
├── codemorpher-backend/
│   ├── firebase/                   # Firebase logging utilities
│   ├── node_modules/               # Backend dependencies
│   ├── translators/                # GPT/OpenRouter wrappers
│   │   └── useOpenRouter.js        # OpenRouter integration
│   ├── uploads/                    # Uploaded files storage
│   ├── vision/                     # Vision-related functionality
│   │   └── geminiImageParser.js    # Gemini image processing integration
│   ├── .env                        # Environment variables
│   ├── .gitignore                  # Git ignore file
│   ├── package-lock.json           # Dependency lock file
│   ├── package.json                # Backend dependencies & scripts
│   └── server.js                   # Express server
│
├── codemorpher-frontend/
│   ├── cypress/                    # Cypress E2E tests & support
│   ├── node_modules/               # Frontend dependencies
│   ├── public/                     # Static assets
│   ├── test-images/                # Images used for testing
│   ├── .gitignore                  # Git ignore file
│   ├── cypress.config.js           # Cypress configuration
│   ├── package-lock.json           # Dependency lock file
│   ├── package.json                # Frontend dependencies & scripts
│   └── README.md                   # Frontend documentation
│
└── README.md                       # Project documentation
```

## 🧪 Running the Test Suite & Generating Reports

### Install Dependencies
```bash
cd codemorpher-frontend
npm install
```

### Run All Tests + Generate HTML Report
```bash
npm run test:report
```

This will:

1. Clean out any old reports
2. Launch Cypress in headless mode
3. Merge all Mochawesome JSON results
4. Generate a single HTML report with inlined screenshots
5. Open the report in your default browser

The test suite includes UI checks, translation validation, error handling, multi-language loop, responsive views, clipboard functionality, run button, and debugging step verification.

## 🤖 Telegram Bot Usage

Access Codemorpher's translation features directly through Telegram:

1. Open Telegram and search for @CodemorpherAIbot
2. Start a conversation with the bot using `/start` or `/help`
3. Use one of the following features:

### Text-Based Translation
- Send `/translate` command
- Paste your Java code
- Select a target language (Python, JavaScript, C, C++, C#, or PHP)
- Receive the translated code

### Image-to-Code Translation
- Send `/upload` command
- Upload an image containing Java code
- The bot will extract and display the Java code
- Choose to translate the extracted code if desired
- Select a target language to get the translation

The bot uses Meta Llama to validate Java code and Google's Gemini API for image code extraction, ensuring accurate translations.

## 🧑‍💻 How to Contribute

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "✨ Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request ✅