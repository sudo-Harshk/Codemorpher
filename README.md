# 📘 Codemorpher

Codemorpher is a full-stack web application that allows users to input Java code and get translated versions in multiple languages like JavaScript, Python, C, C++, PHP, and more. It also generates debugging steps and algorithms, with full test coverage powered by Cypress.

## 🌐 Live Demo

- **Frontend:** [https://monumental-peony-b9a6b3.netlify.app](https://monumental-peony-b9a6b3.netlify.app)
- **Backend API (Ping):** [https://codemorpher-backend.onrender.com/ping](https://codemorpher-backend.onrender.com/ping)

## 🚀 Features

- ✨ **Multi-language Translation:** Java → JavaScript, Python, C, C++, C#, PHP, and more  
- 🪄 **Debugging Steps:** Line-by-line guidance to trace and fix logic  
- 📚 **Algorithm Outline:** High-level pseudocode summary of your logic  
- 📋 **Copy & Run:** Copy translated code or run it in an online compiler  
- 📱 **Responsive Design:** Supports mobile, tablet, and desktop viewports  
- ✅ **End-to-End Tests:** Comprehensive Cypress suite with screenshots and Mochawesome reports  
- ⚙️ **Error Handling:** Graceful fallback for network/server errors

## 🛠️ Tech Stack

### Frontend:  
- Vanilla HTML, CSS, JavaScript  
- Prism.js for syntax highlighting

### Backend:  
- Node.js + Express  
- OpenRouter GPT (primary) 
- Firebase for logging translation requests & errors

### Testing & Reporting:  
- Cypress (E2E)  
- Mochawesome, mochawesome-merge, and marge for HTML reports

### Deployment:  
- Frontend: Netlify  
- Backend: Render

## 📂 Project Structure
```
CODEMORPHER/
├── codemorpher-backend/
│   ├── firebase/               # Firebase logging utilities
│   ├── node_modules/           # Backend dependencies
│   ├── translators/            # GPT/OpenRouter wrappers
│   │   └── useOpenRouter.js    # OpenRouter integration
│   ├── .env                    # Environment variables
│   ├── .gitignore              # Git ignore file
│   ├── package-lock.json       # Dependency lock file
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Express server
│
├── codemorpher-frontend/
│   ├── cypress/                # Cypress E2E tests & support
│   ├── node_modules/           # Frontend dependencies
│   ├── public/                 # Static assets
│   ├── .gitignore              # Git ignore file
│   ├── cypress.config.js       # Cypress configuration
│   ├── package-lock.json       # Dependency lock file
│   ├── package.json            # Frontend dependencies & scripts
│   └── preview.html            # Preview HTML file (likely for testing)
│
└── README.md                   # Project documentation
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
- Clean out any old reports  
- Launch Cypress in headless mode  
- Merge all Mochawesome JSON results  
- Generate a single HTML report with inlined screenshots  
- Open the report in your default browser

The test suite includes UI checks, translation validation, error handling, multi-language loop, responsive views, clipboard functionality, run button, and debugging step verification.

## 🧑‍💻 How to Contribute

1. Fork this repository  
2. Create your feature branch: `git checkout -b feature/my-feature`  
3. Commit your changes: `git commit -m "✨ Add my feature"`  
4. Push to the branch: `git push origin feature/my-feature`  
5. Open a Pull Request ✅

