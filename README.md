# 📘 Codemorpher

**Codemorpher** is a full-stack web application that allows users to input Java code and get translated versions in multiple languages like JavaScript, Python, C, C++, PHP, and more. It also generates debugging steps and algorithms, with full test coverage powered by Cypress.

---

## 🚀 Features

- ✨ Java-to-multilanguage code translation  
- 🪄 Line-by-line debugging steps  
- 📚 Abstract algorithm generation  
- ✅ Production-grade Cypress test suite  
- 📱 Fully responsive UI (desktop + mobile)  
- 📋 Copy to Clipboard + Run on external compiler  
- 📊 Auto-generated HTML reports with screenshots

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js + OpenRouter GPT + Gemini fallback  
- **Testing**: Cypress + Mochawesome  
- **Deployment**: Render (backend)

---

## 📂 Project Structure (Frontend)

```
codemorpher-frontend/
├── public/
│   ├── index.html
│   ├── app.js
│   ├── assets/
│   └── styles/
├── cypress/
│   ├── e2e/            # Cypress test files
│   ├── reports/        # Auto-generated reports
│   ├── screenshots/    # Auto-generated screenshots
│   └── support/
├── package.json
├── cypress.config.js
└── .gitignore
```

---

## 🧪 Run Test Suite (with Report)

```bash
# Install dependencies
npm install

# Run all tests + generate HTML report
npm run test:report
```

> ✅ The test suite includes UI checks, translation validation, error handling, multi-language loop, responsive views, clipboard, run button, and debugging step verification.

---

## 🧑‍💻 How to Contribute

1. Fork this repo  
2. Create your feature branch: `git checkout -b feature/my-feature`  
3. Commit your changes: `git commit -m "✨ Add my feature"`  
4. Push to branch: `git push origin feature/my-feature`  
5. Open a Pull Request ✅

---

## 📄 License

This project is open-source under the MIT License.
