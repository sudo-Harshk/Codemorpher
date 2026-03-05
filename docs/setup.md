# Codemorpher Local Setup Guide

Follow these instructions to set up the project on your local machine for development.

---

## Prerequisites
- Node.js installed (v16.0 or higher recommended).
- Optional: Python installed for potential Node native extensions.
- Create an account for OpenRouter and Google Gemini APIs.

## Dependencies

### Backend
1. **Navigate to the Backend**:
   ```bash
   cd backend
   ```
2. **Install Packages**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file within the `/backend` directory based on the following template:
   ```env
   # Backend API details
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   TRANSLATOR_PROVIDER=openrouter # Options: 'openrouter' or 'mock'
   PORT=5000
   ```
4. **Start the Express Server**:
   ```bash
   npm start
   ```
   *The server runs at http://localhost:5000*

### Frontend
1. **Navigate to the Frontend**:
   ```bash
   cd frontend
   ```
2. **Install Packages**:
   ```bash
   npm install
   ```
3. **Environment Setup (Vite)**:
   In your Vite environment, you can specify an API variable to override the `axios` base backend connection endpoint, or Vite proxies. Ensure your code matches or defaults to `localhost:5000`.
4. **Run Vite Development Server**:
   ```bash
   npm run dev
   ```
   *The client UI runs at http://localhost:5173*

## Docker Setup

Codemorpher supports containerized deployment using Docker.

1. **Build and Run the Backend Image**:
   ```bash
   cd backend
   docker build -t codemorpher-backend .
   docker run -p 8080:8080 --env-file .env codemorpher-backend
   ```
   
2. **Build and Run the Frontend Image (with Nginx)**:
   ```bash
   cd frontend
   docker build -t codemorpher-frontend .
   docker run -p 80:80 -e BACKEND_URL=http://localhost:8080 codemorpher-frontend
   ```

*Note: The frontend uses an Nginx proxy to forward requests to the backend URL defined by the `BACKEND_URL` environment variable during container startup.*
