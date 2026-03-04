# Codemorpher Architecture

Codemorpher is a full-stack web application designed to translate Java code into various other programming languages, generate debugging steps, and provide algorithm outlines. 

## System Overview

The system operates using a standard client-server architecture:

```mermaid
graph TD
    User([User])
    
    subgraph Frontend [Frontend (React + Vite)]
        UI[Translator UI]
        Cam[Camera Modal]
    end
    
    subgraph Backend [Backend (Node.js + Express)]
        API[Express API]
        Vision[Vision Service]
        Translators[Translation Service]
        DB[(SQLite Database)]
    end
    
    subgraph External [External APIs]
        Gemini[Google Gemini API]
        OpenRouter[OpenRouter API]
    end
    
    User -->|Input Code / Click Translate| UI
    User -->|Upload Image| Cam
    
    Cam -->|POST /upload| API
    UI -->|POST /translate| API
    UI -->|GET /history| API
    
    API -->|Process Image| Vision
    API -->|Manage Translation| Translators
    
    Vision <-->|Extract Text| Gemini
    Translators <-->|LLM Queries| OpenRouter
    
    API <-->|Log & Fetch| DB
```

1. **Frontend (Client)**: Built with React and Vite, focusing on a responsive and split-view design for side-by-side code input and translation output.
2. **Backend (Server)**: A Node.js and Express server that handles incoming translation requests, processes images for code extraction, and interacts with external APIs.
3. **Database**: SQLite is used for local logging of successful translations and errors to maintain a history.
4. **External Services**: 
   - **OpenRouter API**: Used as the primary engine for translating code, generating debugging steps, and algorithm outlines.
   - **Google Gemini API**: Utilized for parsing images and extracting Java code.

## Component Breakdown

### Frontend
- **Framework**: React + Vite for fast development and optimized builds.
- **Styling**: Tailwind CSS for rapid, utility-first styling.
- **Key Dependencies**: 
  - `react-syntax-highlighter` (Prism) for rendering code with syntax highlighting.
  - `react-router-dom` for application routing (Translator vs. History view).
- **Core Components**:
  - `TranslatorPage`: The main split-view interface.
  - `CodeInput` & `CodeOutput`: Handles user code entry and displaying results.
  - `CameraModal`: Interface for image uploading and camera capture.
  - `LanguagePicker`: Selection for the target translation language.

### Backend
- **Framework**: Node.js + Express.
- **Data Persistence**: `better-sqlite3` is used to maintain a lightweight, local database (`codemorpher.db`) for tracking user requests.
- **Key Modules**:
  - `/translators`: Contains `useOpenRouter.js` which manages prompts and communication with the OpenRouter API.
  - `/vision`: Contains `geminiImageParser.js` which handles the integration with Google's Gemini API for prompt-based image-to-text extraction.
  - `/db`: Contains `database.js` for schema initialization and `logService.js` for logging events.
- **Routing**: 
  - Express handles simple REST API endpoints (`/translate`, `/upload`, `/history`).

## Data Flow
1. **Manual Input**: User types Java code into the frontend.
   - Or **Image Input**: User uploads an image, the frontend sends it to `/upload`, the backend uses Gemini to extract text, and returns the Java code to the frontend.
2. User selects a target language and clicks "Translate".
3. Frontend sends a `POST /translate` request with `javaCode` and `targetLanguage`.
4. Backend receives the request, triggers the `useOpenRouter` module to request translation, debugging steps, and an algorithm outline.
5. Once OpenRouter responds, the backend logs the translation to SQLite.
6. The JSON payload is returned to the frontend.
7. Frontend updates its state and displays the translated code, debugging steps, and algorithm to the user.
