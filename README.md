<div align="center">

# Codemorpher

**Translate Java code into multiple languages — instantly.**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Overview

**Codemorpher** is a full-stack web application that converts Java source code into Python, JavaScript, C, C++, C#, or PHP. Beyond raw translation, it also produces step-by-step debugging guidance and a plain-English algorithm outline for every snippet you submit.

Input can be typed/pasted directly **or** uploaded as an image — Google Gemini extracts the code automatically. A three-layer validation pipeline ensures only valid Java reaches the translation engine, preventing wasted API calls on invalid input.

---

## Features

| Feature | Description |
|---|---|
| **Multi-Language Translation** | Java → Python, JavaScript, C, C++, C#, PHP |
| **Image-to-Code (OCR)** | Upload a photo or screenshot; Gemini Vision extracts the Java code |
| **Debugging Steps** | 5-step, line-by-line logic walkthrough with real-world analogies |
| **Algorithm Outline** | High-level pseudocode summary of your code's intent |
| **Three-Layer Validation** | Sanity checks → language detection → AST syntax validation |
| **Translation History** | All requests persisted to SQLite and viewable in-app |
| **Copy to Clipboard** | One-click copy from any output tab |
| **Responsive Design** | Fully usable on mobile, tablet, and desktop |
| **Docker Ready** | Production-optimized Dockerfiles with Nginx for the frontend |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 6.x | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router DOM | 7.x | Client-side routing |
| react-syntax-highlighter | 16.x | Prism-based code display |
| styled-components | 6.x | Component-scoped CSS |
| Nginx | Alpine | Production static serving |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Runtime |
| Express | 5.x | HTTP framework |
| OpenRouter SDK | 0.3.x | Primary LLM translation engine |
| Google GenAI SDK | 0.24.x | Gemini Vision for image parsing |
| tree-sitter + tree-sitter-java | 0.21 / 0.23 | Layer 3 AST syntax validation |
| program-language-detector | 0.0.12 | Layer 2 language detection |
| better-sqlite3 | 12.x | Translation history logging |
| Multer | 1.4.x | Multipart image upload handling |
| dotenv | 16.x | Environment variable management |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  React + Vite SPA  →  Nginx (prod) / Vite Dev Server (local)   │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTP (REST)
┌──────────────────────────▼───────────────────────────────────────┐
│                     EXPRESS BACKEND                              │
│                                                                  │
│  POST /translate          POST /upload       GET /history        │
│       │                        │                  │              │
│  ┌────▼────────────────────────▼──────────┐       │              │
│  │        3-Layer Java Validator          │       │              │
│  │  Layer 1: Sanity   (empty, length)     │       │              │
│  │  Layer 2: Language (detector lib)      │       │              │
│  │  Layer 3: Syntax   (tree-sitter AST)   │       │              │
│  └────────────────────┬───────────────────┘       │              │
│                       │ valid Java                │              │
│       ┌───────────────▼──────────┐                │              │
│       │   OpenRouter LLM API     │                │              │
│       │  (Translation Engine)    │                │              │
│       └───────────────┬──────────┘                │              │
│                       │                           │              │
│       ┌───────────────▼──────────────────────┐    │              │
│       │         SQLite Database              │◄───┘              │
│       │  (translations, status, timestamps)  │                   │
│       └──────────────────────────────────────┘                   │
│                                                                  │
│  POST /upload → Google Gemini Vision API → extracted Java        │
└──────────────────────────────────────────────────────────────────┘
```

**Data Flow**
1. User submits Java code (text or image)
2. Image path: Gemini Vision extracts text → same validation pipeline
3. Three-layer validator rejects non-Java with a descriptive error
4. Valid code is sent to OpenRouter with a structured JSON prompt
5. Response is parsed into `translatedCode`, `debuggingSteps`, `algorithm`
6. Result is logged to SQLite and returned to the frontend
7. Frontend displays output across three tabs (Code / Debug / Algorithm)

---

## Project Structure

```
codemorpher/
├── backend/
│   ├── server.js                  # Express app — routes: /ping, /translate, /upload, /history
│   ├── Dockerfile                 # Multi-stage Alpine build
│   ├── .env.example               # Environment variable template
│   ├── validation/
│   │   └── javaValidator.js       # Three-layer Java validation logic
│   ├── translators/
│   │   ├── translator.js          # Provider abstraction (OpenRouter / Mock)
│   │   ├── useOpenRouter.js       # OpenRouter API integration
│   │   └── parser.js              # JSON extraction & normalization
│   ├── vision/
│   │   └── geminiImageParser.js   # Google Gemini Vision integration
│   └── db/
│       ├── database.js            # SQLite schema init
│       └── logService.js          # Translation & error logging
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Root component + routing
│   │   ├── components/            # CodeInput, CodeOutput, LanguagePicker, Navbar, HistoryTable
│   │   ├── hooks/
│   │   │   ├── useTranslator.js   # Translation state + API calls
│   │   │   └── useImageUpload.js  # Image upload state
│   │   └── pages/                 # Translator and History pages
│   ├── Dockerfile                 # Nginx + Alpine container
│   ├── nginx.conf                 # Reverse proxy config
│   └── .env.development / .env.production
│
└── docs/
    ├── api.md                     # API endpoint reference
    ├── architecture.md            # System architecture deep-dive
    ├── setup.md                   # Local & Docker setup
    └── deployment.md              # Render + Firebase deployment guide
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v16 or higher (v22 recommended)
- An [OpenRouter](https://openrouter.ai) API key (free tier available)
- A [Google Gemini](https://aistudio.google.com) API key (free tier available)
- [Docker](https://www.docker.com) (optional, for containerized setup)

---

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/sudo-Harshk/codemorpher.git
cd codemorpher
```

#### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-3.5-turbo        # any model slug from openrouter.ai
GEMINI_API_KEY=your_gemini_api_key
TRANSLATOR_PROVIDER=openrouter               # use 'mock' for offline testing
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
```

```bash
npm install
npm start
# Backend running at http://localhost:5000
```

#### 3. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Docker

#### Backend

```bash
cd backend
docker build -t codemorpher-backend .
docker run -p 8080:8080 --env-file .env codemorpher-backend
```

#### Frontend

```bash
cd frontend
docker build -t codemorpher-frontend .
docker run -p 80:80 -e BACKEND_URL=http://localhost:8080 codemorpher-frontend
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ping` | Health check |
| `POST` | `/translate` | Translate Java code to a target language |
| `POST` | `/upload` | Extract Java code from an image (multipart/form-data) |
| `GET` | `/history` | Fetch the last 50 translation records |

### POST `/translate`

**Request**
```json
{
  "javaCode": "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }",
  "targetLanguage": "python"
}
```

**Response (200)**
```json
{
  "translatedCode": ["def main():", "    print(\"Hello\")"],
  "debuggingSteps": ["1. Entry point is main()...", "..."],
  "algorithm": ["1. Define main function", "..."],
  "fallback": false
}
```

**Validation Error (400)**
```json
{
  "error": "This looks like Python, not Java. Codemorpher translates Java only.",
  "code": "WRONG_LANGUAGE",
  "detectedLanguage": "Python"
}
```

**Supported target languages:** `python` `javascript` `csharp` `cpp` `c` `php`

**Error codes:** `EMPTY_INPUT` · `TOO_SHORT` · `NOT_CODE_LIKE` · `WRONG_LANGUAGE` · `INVALID_JAVA_SYNTAX` · `PARSE_FAILED`

> See [docs/api.md](docs/api.md) for the full reference.

---

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `OPENROUTER_MODEL` | Yes | Model slug (e.g. `openai/gpt-3.5-turbo`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `TRANSLATOR_PROVIDER` | Yes | `openrouter` or `mock` |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `ALLOWED_ORIGIN` | No | CORS origin for production |

### Frontend

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend base URL (set in `.env.development` / `.env.production`) |

---

## Deployment

| Service | Component | Guide |
|---|---|---|
| [Render](https://render.com) | Backend (Node.js) | [docs/deployment.md](docs/deployment.md) |
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | Frontend (static SPA) | [docs/deployment.md](docs/deployment.md) |

---

## Documentation

| Document | Contents |
|---|---|
| [docs/api.md](docs/api.md) | Full API endpoint reference with request/response schemas |
| [docs/architecture.md](docs/architecture.md) | System design, data flow, and component breakdown |
| [docs/setup.md](docs/setup.md) | Detailed local and Docker setup instructions |
| [docs/deployment.md](docs/deployment.md) | Step-by-step Render + Firebase deployment guide |

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).
