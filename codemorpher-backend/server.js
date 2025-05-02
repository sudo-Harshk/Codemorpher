const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// 🔁 Unified Translator
const useOpenRouter = require('./translators/useOpenRouter');

// 🔁 Firebase logging
const { logTranslation, logError } = require('./firebase/logService');

// 🧠 Image parsing
const extractJavaCodeFromImage = require('./vision/geminiImageParser');

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

  try {
    const extractedCode = await extractJavaCodeFromImage(file.path);

    // Cleanup uploaded file
    fs.unlinkSync(file.path);

    if (!extractedCode) {
      return res.status(400).json({ error: 'No valid Java code found in image.' });
    }

    // 🔧 Clean backtick-wrapped code
    const cleanCode = extractedCode
      .replace(/```[\s\S]*?\n?/, '') 
      .replace(/```$/, '')         
      .trim();

    res.json({ javaCode: cleanCode });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

// 🟢 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
