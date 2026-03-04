# Codemorpher

Codemorpher is a full-stack web application that allows users to input Java code and get translated versions in multiple languages like JavaScript, Python, C, C++, PHP, and more. It also generates debugging steps and algorithms.

## Local Setup

To run Codemorpher locally, follow these steps:

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

## Features

-  **Multi-language Translation**: Java → JavaScript, Python, C, C++, C#, PHP, and more  
-  **Debugging Steps**: Line-by-line guidance to trace and fix logic  
-  **Algorithm Outline**: High-level pseudocode summary of your logic  
-  **Copy**: Copy translated code directly from the UI  
-  **Responsive Design**: Supports mobile, tablet, and desktop viewports  
-  **Image-to-Code**: Upload and extract Java code from images using Google's Gemini API
-  **Error Handling**: Graceful fallback for network/server errors

## Tech Stack

### Frontend:
- React + Vite  
- Tailwind CSS for styling
- react-syntax-highlighter (Prism) for code highlighting
- React Router for navigation

### Backend:
- Node.js + Express  
- Translator provider layer (`translator.js`) with OpenRouter as the primary engine (plus a mock provider for local testing) 
- SQLite (`better-sqlite3`) for logging translation requests & errors

### Vision:
- Google Gemini API for image code extraction

### Testing:
- The current setup does not include an automated E2E test runner in this `frontend` app.
- You can add your own unit or integration tests as needed for your workflow.

##  Running the Test Suite & Generating Reports

### Install Dependencies
```bash
cd frontend
npm install
```

## Documentation

For more detailed technical information, please refer to the files in the `docs` folder:

- **[Architecture](docs/architecture.md)**: High-level overview of the frontend and backend architecture.
- **[API Reference](docs/api.md)**: Details on the backend API endpoints.
- **[Setup Guide](docs/setup.md)**: Instructions for setting up the project locally.

##  How to Contribute

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m " Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request 
