# Deployment Guide

This guide provides step-by-step instructions to deploy the Codemorpher application. For this setup, we deploy the Node.js Express backend using Render and the React (Vite) frontend using Firebase Hosting.

---

## Backend Deployment (Render)

Render provides an easy way to deploy Node.js web services directly from your GitHub repository.

### 1. Preparation
1. Ensure your latest backend code is committed and pushed to a GitHub repository.
2. The backend should ideally run on the `PORT` automatically provided by Render's environment. Ensure your `backend/index.js` or `backend/server.js` listens to `process.env.PORT`.

### 2. Create the Web Service
1. Log in to your [Render](https://render.com/) Dashboard.
2. Click on **New** and select **Web Service**.
3. Connect your GitHub repository that contains the Codemorpher project.
4. Configure the web service with the following settings:
   - **Name**: `codemorpher-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Set Environment Variables
Scroll down to the **Environment Variables** section and add the keys from your local `.env` file:
- `OPENROUTER_API_KEY`: `<your_openrouter_api_key>`
- `GEMINI_API_KEY`: `<your_gemini_api_key>`
- `TRANSLATOR_PROVIDER`: `openrouter`

### 4. Deploy
1. Click **Create Web Service**.
2. Render will automatically build your project and start the server. 
3. Once the deployment is live, copy your backend URL (e.g., `https://codemorpher-backend.onrender.com`). You will need this for the frontend setup.

---

## Frontend Deployment (Firebase Hosting)

Firebase Hosting provides fast and secure hosting for your React/Vite web app.

### 1. Update Environment Variables
Before building for production, ensure your frontend can communicate with the newly deployed Render backend.

1. In the `frontend` directory, create a `.env.production` file (or update your Vite config) to point to the Render backend URL.
   ```env
   VITE_BACKEND_URL=https://codemorpher-backend.onrender.com
   ```
2. Make sure your Axios or fetch calls in the React code use this environment variable instead of hardcoding `localhost:5000`.

### 2. Build the Application
Navigate to the frontend folder and generate the production build:
```bash
cd frontend
npm install
npm run build
```
This process creates a `dist` directory containing your compiled production-ready static assets.

### 3. Initialize Firebase
If you haven't installed the Firebase CLI yet, do it globally:
```bash
npm install -g firebase-tools
```

Log in to your Firebase account:
```bash
firebase login
```

Initialize your Firebase project inside the `frontend` directory:
```bash
firebase init hosting
```

When prompted, answer with the following:
- **Project Setup**: Select **Use an existing project** and choose your Firebase project (create one in the Firebase Console if you haven't).
- **Public directory**: Type `dist` (this matches Vite's default build folder).
- **Single-page app**: Type `y` (Yes) so Firebase rewrites all URLs to `index.html` for React Router.
- **Automatic builds with GitHub**: Type `n` (No, unless you want to set up GitHub Actions).
- **Overwrite dist/index.html?**: Type `n` (No, keep the one Vite just built).

### 4. Deploy
Once initialization is complete, deploy your frontend to Firebase Hosting:
```bash
firebase deploy --only hosting
```

After a successful deployment, Firebase will provide you with a live Hosting URL (e.g., `https://your-project.web.app`).

---

**🎉 Congratulations! Your Codemorpher application is now live.**
