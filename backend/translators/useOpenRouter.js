const { OpenRouter } = require('@openrouter/sdk');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');
const { parseAndValidate } = require('./parser');

const uploadDir = path.join(__dirname, '../uploads');

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000',
    'X-OpenRouter-Title': 'Codemorpher',
  },
});

async function useOpenRouter(javaCode, targetLanguage) {
  const sessionId = `sess-${Date.now()}`; 
  console.log(`[${sessionId}] useOpenRouter called with:`, { javaCode, targetLanguage }); 

  const prompt = `
You are a programming assistant that translates Java code and explains it.

Task:
1. Translate the following Java code into ${targetLanguage}. The translated code must not contain any comments.
2. Create beginner-friendly debugging steps explaining the logic with simple real-world analogies (like baskets, workers, chalkboards).
3. Describe the overall algorithm as abstract steps (e.g., "Initialize", "Repeat", "Add", "Display").

Return your answer as a SINGLE JSON object with this exact structure and keys:

{
  "translatedCode": "string with only the translated ${targetLanguage} code, no comments",
  "debuggingSteps": ["1. ...", "2. ...", "3. ...", "4. ...", "5. ..."],
  "algorithm": ["Describe the setup...", "Explain the loop...", "Describe how data is stored...", "Explain the output...", "Summarize the overall flow..."]
}

Strict requirements:
- Return ONLY valid JSON. No backticks, no markdown, no code fences, no explanation outside the JSON.
- The value of "translatedCode" must be a single string containing only ${targetLanguage} code.
- The "debuggingSteps" array must contain exactly 5 items, each a short sentence starting with a number and a dot (e.g., "1. ...").
- The "algorithm" array must contain exactly 5 items, each a short sentence describing one step. Do NOT include numeric prefixes like "1." or "2." – the UI will number them.
- Ensure the JSON is valid and can be parsed by JSON.parse in JavaScript.

Here is the Java code to translate:
${javaCode}
`;

  let completion, reply;
  try {
    completion = await openrouter.chat.send({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      stream: false,
    });

    reply = completion.choices?.[0]?.message?.content || '';
    if (!reply) {
      console.error(`❌ [${sessionId}] OpenRouter response incomplete.`);
      throw new Error('OpenRouter response incomplete.');
    }
    console.log(`🧠 [${sessionId}] OpenRouter raw reply:\n`, reply); // Log raw reply for debugging
  } catch (err) {
    console.error(`❌ [${sessionId}] OpenRouter API error:`, err.message);
    throw new Error('OpenRouter API error: ' + err.message);
  }

  const parsed = parseAndValidate(reply, sessionId);
  
  // Defensive: Ensure all sections are non-empty arrays
  const result = {
    translatedCode: Array.isArray(parsed.translatedCode) && parsed.translatedCode.length ? parsed.translatedCode : ['// Translation unavailable due to parsing error.'],
    debuggingSteps: Array.isArray(parsed.debuggingSteps) && parsed.debuggingSteps.length ? parsed.debuggingSteps : ['⚠️ Debugging steps unavailable due to parsing error.'],
    algorithm: Array.isArray(parsed.algorithm) && parsed.algorithm.length ? parsed.algorithm : ['⚠️ Algorithm unavailable due to parsing error.']
  };

  console.log(`📤 [${sessionId}] useOpenRouter returning:`, result); // Add logging
  return result;
}

// Safer, move this to your server entrypoint if using in production
const cleanupUploads = async () => {
  try {
    const files = await fsPromises.readdir(uploadDir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fsPromises.stat(filePath);
      if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
        await fsPromises.unlink(filePath);
      }
    }
  } catch (err) {
    console.warn('[CleanupUploads] Error:', err);
  }
};

// For scheduled cleanup, call this from your main server file, not here.
// setInterval(cleanupUploads, 60 * 60 * 1000);

module.exports = useOpenRouter;