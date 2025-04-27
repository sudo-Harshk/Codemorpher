const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// 🔁 Unified Translator
const useOpenRouter = require('./translators/useOpenRouter');

// 🔁 Firebase logging
const { logTranslation, logError } = require('./firebase/logService');

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('✅ Codemorpher backend is running!');
});

app.post('/translate', async (req, res) => {
  const { javaCode, targetLanguage } = req.body;
  const sessionId = `sess-${Date.now()}`;

  if (!javaCode || !targetLanguage) {
    return res.status(400).json({ error: 'Missing javaCode or targetLanguage' });
  }

  const input = { javaCode, targetLanguage };

  try {
    console.log(`🧠 [${sessionId}] Translating and explaining using OpenRouter...`);
    const result = await useOpenRouter(javaCode, targetLanguage);

    if (
      !result.translatedCode?.length ||
      !result.debuggingSteps?.length ||
      !result.algorithm?.length
    ) {
      throw new Error("OpenRouter response incomplete.");
    }

    await logTranslation(sessionId, { ...result, input }, 'success', 'openrouter');
    console.log(`✅ [${sessionId}] Translation complete and logged.`);

    return res.json(result);
  } catch (err) {
    console.error(`❌ [${sessionId}] Translation failed: ${err.message}`);
    await logError(sessionId, javaCode, targetLanguage, err.message);

    return res.status(500).json({ error: 'Translation failed.', message: err.message });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
