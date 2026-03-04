const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const app = express();

// ---- Constants ----
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_MIMETYPE_PREFIX = 'image/';
const ERROR_MESSAGES = {
  MISSING_TRANSLATE_PARAMS: 'Missing javaCode or targetLanguage',
  FILE_TOO_LARGE: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  ONLY_IMAGES_ALLOWED: 'Only image files are allowed.',
  NO_IMAGE_UPLOADED: 'No image uploaded.',
  FAILED_UPLOAD_PROCESS: 'Failed to process image due to an unexpected server error.',
  TRANSLATION_FAILED: 'Translation failed due to an unexpected server error.',
  TRANSLATION_UNAVAILABLE: '// Translation unavailable due to backend error.',
  DEBUG_STEPS_UNAVAILABLE: '⚠️ OpenRouter could not provide debugging steps.',
  ALGORITHM_FAILED: '⚠️ Algorithm generation failed.',
  JAVA_CODE_TOO_LARGE: 'javaCode is too large. Maximum length is 20KB.',
  UNSUPPORTED_LANGUAGE: 'Unsupported targetLanguage.',
};

const SUPPORTED_TARGET_LANGUAGES = [
  'python', 'javascript', 'csharp', 'cpp', 'c', 'php',
];

// Determine CORS origin based on environment
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN].filter(Boolean) // e.g. https://codemorpher.onrender.com
    : ['http://localhost:3000', 'http://localhost:5173']; // Allow common development origins

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (no Origin) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// Helper function for consistent error responses
const sendErrorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    translatedCode: [ERROR_MESSAGES.TRANSLATION_UNAVAILABLE],
    debuggingSteps: [ERROR_MESSAGES.DEBUG_STEPS_UNAVAILABLE],
    algorithm: [ERROR_MESSAGES.ALGORITHM_FAILED],
    fallback: true,
    error: message,
  });
};

// Helper function to cleanup uploaded files
const cleanupUploadedFile = async (filePath, sessionId) => {
  try {
    await fsPromises.unlink(filePath);
    console.log(`🧹 [${sessionId}] Cleaned up uploaded file: ${filePath}`);
  } catch (err) {
    console.warn(`⚠️ [${sessionId}] Failed to delete file: ${err.message}`);
  }
};

// ---- Uploads Directory ----
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---- Import Services ----
const { translateWithProvider } = require('./translators/translator');
const { logTranslation, logError } = require('./db/logService');
const db = require('./db/database');
const { extractJavaCodeFromImage } = require('./vision/geminiImageParser');

// ---- Middleware ----
app.use(cors(corsOptions)); // Restrict CORS based on environment
app.use(express.json());

// ---- Health Check ----
app.get('/ping', (req, res) => {
  res.send('✅ Codemorpher backend is running!');
});

// ---- History Endpoint ----
app.get('/history', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, sessionId, targetLanguage, status, engineUsed, timestamp, javaCode, translatedCode, error FROM translations ORDER BY id DESC LIMIT 50'
    ).all();
    res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch history:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// ---- Translate Endpoint ----
app.post('/translate', async (req, res) => {
  const { javaCode, targetLanguage } = req.body;
  const sessionId = `sess-${Date.now()}`;

  if (!javaCode || !targetLanguage) {
    return res.status(400).json({ error: ERROR_MESSAGES.MISSING_TRANSLATE_PARAMS });
  }

  // Input validation for javaCode length
  if (javaCode.length > 20000) { // Example limit: 20KB
    return res.status(400).json({ error: ERROR_MESSAGES.JAVA_CODE_TOO_LARGE });
  }

  // Input validation for targetLanguage against supported languages
  if (!SUPPORTED_TARGET_LANGUAGES.includes(targetLanguage)) {
    return res.status(400).json({ error: ERROR_MESSAGES.UNSUPPORTED_LANGUAGE });
  }

  // TODO: Implement more robust input validation for javaCode (e.g., character escaping) and
  // targetLanguage (e.g., whitelist of supported languages) to prevent abuse and ensure expected input.

  const input = { javaCode, targetLanguage };

  try {
    console.log(`[${sessionId}] Starting translation...`);
    const translation = await translateWithProvider(javaCode, targetLanguage, {
      sessionId,
    });

    let result = {
      translatedCode: translation.translatedCode,
      debuggingSteps: translation.debuggingSteps,
      algorithm: translation.algorithm,
      fallback: Boolean(translation.fallback),
    };

    // Defensive: ensure all three sections are present and arrays
    const hasAll =
      Array.isArray(result.translatedCode) && result.translatedCode.length &&
      Array.isArray(result.debuggingSteps) && result.debuggingSteps.length &&
      Array.isArray(result.algorithm) && result.algorithm.length;

    if (!hasAll) {
      console.warn(`[${sessionId}] Incomplete result. Returning fallback...`);
      result = {
        translatedCode: (result.translatedCode && result.translatedCode.length) ? result.translatedCode : [ERROR_MESSAGES.TRANSLATION_UNAVAILABLE],
        debuggingSteps: (result.debuggingSteps && result.debuggingSteps.length) ? result.debuggingSteps : [ERROR_MESSAGES.DEBUG_STEPS_UNAVAILABLE],
        algorithm: (result.algorithm && result.algorithm.length) ? result.algorithm : [ERROR_MESSAGES.ALGORITHM_FAILED],
        fallback: true
      };
      await logTranslation(
        sessionId,
        { ...result, input },
        'fallback',
        translation.provider || 'openrouter'
      );
      return res.status(200).json(result);
    }

    await logTranslation(
      sessionId,
      { ...result, input },
      'success',
      translation.provider || 'openrouter'
    );
    console.log(`✅ [${sessionId}] Translation complete via provider="${translation.provider}".`);
    return res.json(result);

  } catch (err) {
    console.error(`❌ [${sessionId}] Translation failed: ${err.message}`);
    await logError(sessionId, javaCode, targetLanguage, err.message);

    // Use helper for consistent error response
    sendErrorResponse(res, 500, ERROR_MESSAGES.TRANSLATION_FAILED);
  }
});

// ---- File Upload Route ----
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: MAX_FILE_SIZE }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith(IMAGE_MIMETYPE_PREFIX)) {
      return cb(new Error(ERROR_MESSAGES.ONLY_IMAGES_ALLOWED), false);
    }
    cb(null, true);
  }
});

// TODO: Implement more robust input validation for uploaded images (e.g., deeper content analysis to prevent malicious uploads) and consider image resizing/optimization.

app.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: ERROR_MESSAGES.FILE_TOO_LARGE });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      if (err.message === ERROR_MESSAGES.ONLY_IMAGES_ALLOWED) {
        return res.status(400).json({ error: err.message });
      }
      console.error(`❌ [upload] Unknown error: ${err.message}`);
      return res.status(500).json({ error: 'Failed to upload image.' });
    }
    next();
  });
}, async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: ERROR_MESSAGES.NO_IMAGE_UPLOADED });
  }

  const sessionId = `upload-${Date.now()}`;
  console.log(` [${sessionId}] Processing uploaded image: ${file.path}`);

  try {
    const result = await extractJavaCodeFromImage(file.path);

    // Always cleanup the uploaded file
    await cleanupUploadedFile(file.path, sessionId);

    if (result.error) {
      console.log(`❌ [${sessionId}] No Java code detected. Extracted text: ${result.extractedText}`);
      return res.status(400).json({ error: result.error, extractedText: result.extractedText });
    }

    // Defensive: result may be { code, ... } or a string (legacy)
    const codeString = result.code || result;
    const cleanCode = typeof codeString === 'string'
      ? codeString.replace(/^```[a-z]*\n?/im, '').replace(/```$/, '').trim()
      : '';

    console.log(`✅ [${sessionId}] Java code extracted successfully.`);
    res.json({ javaCode: cleanCode });
  } catch (err) {
    console.error(`❌ [${sessionId}] Upload error: ${err.message}`);
    // Cleanup file in case of error
    if (file && file.path) {
      await cleanupUploadedFile(file.path, sessionId);
    }
    sendErrorResponse(res, 500, ERROR_MESSAGES.FAILED_UPLOAD_PROCESS);
  }
});

// ---- Global Unhandled Rejection Handler ----
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
