const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// ---- Uploads Directory ----
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---- Import Services ----
const useOpenRouter = require('./translators/useOpenRouter');
const { logTranslation, logError } = require('./firebase/logService');
const { extractJavaCodeFromImage } = require('./vision/geminiImageParser');

// ---- Middleware ----
app.use(cors()); // Use open CORS for testing. Restrict in production!
app.use(express.json());

// ---- Health Check ----
app.get('/ping', (req, res) => {
  res.send('✅ Codemorpher backend is running!');
});

// ---- Translate Endpoint ----
app.post('/translate', async (req, res) => {
  const { javaCode, targetLanguage } = req.body;
  const sessionId = `sess-${Date.now()}`;

  if (!javaCode || !targetLanguage) {
    return res.status(400).json({ error: 'Missing javaCode or targetLanguage' });
  }

  const input = { javaCode, targetLanguage };

  try {
    console.log(`🧠 [${sessionId}] Translating using OpenRouter...`);
    let result = await useOpenRouter(javaCode, targetLanguage);

    // Defensive: ensure all three sections are present and arrays
    const hasAll =
      Array.isArray(result.translatedCode) && result.translatedCode.length &&
      Array.isArray(result.debuggingSteps) && result.debuggingSteps.length &&
      Array.isArray(result.algorithm) && result.algorithm.length;

    if (!hasAll) {
      console.warn(`⚠️ [${sessionId}] Incomplete result. Returning fallback...`);
      result = {
        translatedCode: (result.translatedCode && result.translatedCode.length) ? result.translatedCode : ['// Translation unavailable due to backend error.'],
        debuggingSteps: (result.debuggingSteps && result.debuggingSteps.length) ? result.debuggingSteps : ['⚠️ OpenRouter could not provide debugging steps.'],
        algorithm: (result.algorithm && result.algorithm.length) ? result.algorithm : ['⚠️ Algorithm generation failed.'],
        fallback: true
      };
      await logTranslation(sessionId, { ...result, input }, 'fallback', 'openrouter');
      return res.status(200).json(result);
    }

    await logTranslation(sessionId, { ...result, input }, 'success', 'openrouter');
    console.log(`✅ [${sessionId}] Translation complete.`);
    return res.json(result);

  } catch (err) {
    console.error(`❌ [${sessionId}] Translation failed: ${err.message}`);
    await logError(sessionId, javaCode, targetLanguage, err.message);

    return res.status(500).json({
      translatedCode: ['// Translation unavailable due to backend error.'],
      debuggingSteps: ['⚠️ OpenRouter could not provide debugging steps.'],
      algorithm: ['⚠️ Algorithm generation failed.'],
      fallback: true
    });
  }
});

// ---- File Upload Route ----
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No image uploaded or invalid file type/size.' });
  }

  const sessionId = `upload-${Date.now()}`;
  console.log(`📸 [${sessionId}] Processing uploaded image: ${file.path}`);

  try {
    const result = await extractJavaCodeFromImage(file.path);

    // Always cleanup the uploaded file
    await fsPromises.unlink(file.path).catch(err =>
      console.warn(`⚠️ [${sessionId}] Failed to delete file: ${err.message}`)
    );

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
      await fsPromises.unlink(file.path).catch(err =>
        console.warn(`⚠️ [${sessionId}] Failed to delete file: ${err.message}`)
      );
    }
    res.status(500).json({ error: 'Failed to process image.' });
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
