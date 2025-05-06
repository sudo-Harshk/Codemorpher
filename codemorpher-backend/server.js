const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs'); 
const fsPromises = require('fs').promises; 
const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🔁 Unified Translator
const useOpenRouter = require('./translators/useOpenRouter');

// 🔁 Firebase logging
const { logTranslation, logError } = require('./firebase/logService');

// 🧠 Image parsing
const { extractJavaCodeFromImage } = require('./vision/geminiImageParser');

app.use(cors());
app.use(express.json());

// 🧪 Health check
app.get('/ping', (req, res) => {
  res.send('✅ Codemorpher backend is running!');
});

// 🚀 Translate Endpoint
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

    const hasAll = result.translatedCode?.length && result.debuggingSteps?.length && result.algorithm?.length;

    if (!hasAll) {
      console.warn(`⚠️ [${sessionId}] Incomplete result. Returning fallback...`);

      result = {
        translatedCode: result.translatedCode || '// Translation unavailable due to backend error.',
        debuggingSteps: result.debuggingSteps || '⚠️ OpenRouter could not provide debugging steps.',
        algorithm: result.algorithm || '⚠️ Algorithm generation failed.',
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

    return res.status(200).json({
      translatedCode: '// Translation unavailable due to backend error.',
      debuggingSteps: '⚠️ OpenRouter could not provide debugging steps.',
      algorithm: '⚠️ Algorithm generation failed.',
      fallback: true
    });
  }
});

// 📸 Image Upload Route
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  const sessionId = `upload-${Date.now()}`;
  console.log(`📸 [${sessionId}] Processing uploaded image: ${file.path}`);

  try {
    const result = await extractJavaCodeFromImage(file.path);

    // Cleanup uploaded file
    await fsPromises.unlink(file.path).catch(err => console.warn(`⚠️ [${sessionId}] Failed to delete file: ${err.message}`));

    if (result.error) {
      console.log(`❌ [${sessionId}] No Java code detected. Extracted text: ${result.extractedText}`);
      return res.status(400).json({ error: result.error, extractedText: result.extractedText });
    }

    // 🔧 Clean backtick-wrapped code
    const cleanCode = result
      .replace(/```[\s\S]*?\n?/, '') 
      .replace(/```$/, '')         
      .trim();

    console.log(`✅ [${sessionId}] Java code extracted successfully.`);
    res.json({ javaCode: cleanCode });
  } catch (err) {
    console.error(`❌ [${sessionId}] Upload error: ${err.message}`);
    // Cleanup file in case of error
    await fsPromises.unlink(file.path).catch(err => console.warn(`⚠️ [${sessionId}] Failed to delete file: ${err.message}`));
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

// 🟢 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});