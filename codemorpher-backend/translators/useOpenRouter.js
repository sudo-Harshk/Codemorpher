const OpenAI = require('openai');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000', // Update for prod
    'X-Title': 'Codemorpher',
  },
});

async function useOpenRouter(javaCode, targetLanguage) {
  const sessionId = `sess-${Date.now()}`; // For logging consistency with server.js
  console.log(`🧠 [${sessionId}] useOpenRouter called with:`, { javaCode, targetLanguage }); // Add logging

  const prompt = `
Convert the following Java code to ${targetLanguage}.

Your response must include **three clearly separated sections**:

---

Translated Code:
\`\`\`
<converted code only, no comments>
\`\`\`

---

Debugging Steps:  
Explain the logic using simple real-world analogies (like baskets, workers, chalkboards).  
**Provide exactly 5 numbered points** (e.g., 1. Step description, 2. Step description, etc.).  
Each step should be 1-2 lines long, simple and beginner-friendly.

---

Algorithm:  
Describe the overall approach as 5 separate abstract steps.  
**Provide exactly 5 numbered points** using actions like "Initialize", "Repeat", "Add", "Display", etc.

---

Important Instructions:
- Do NOT add any extra section titles beyond "Translated Code", "Debugging Steps", and "Algorithm".
- Number each step clearly (\`1.\`, \`2.\`, \`3.\`, etc.) inside Debugging Steps and Algorithm.
- Translated Code must have **no comments** inside.
- Keep everything concise and beginner-friendly.
- Make sure each section has exactly 5 clean points, even if the original code is small.

---

Here is the Java code:
${javaCode}
  `;

  let completion, reply;
  try {
    completion = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }],
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

  const parsed = parseGPTOutput(reply, sessionId);
  
  // Defensive: Ensure all sections are non-empty arrays
  const result = {
    translatedCode: Array.isArray(parsed.translatedCode) && parsed.translatedCode.length ? parsed.translatedCode : ['// Translation unavailable due to parsing error.'],
    debuggingSteps: Array.isArray(parsed.debuggingSteps) && parsed.debuggingSteps.length ? parsed.debuggingSteps : ['⚠️ Debugging steps unavailable due to parsing error.'],
    algorithm: Array.isArray(parsed.algorithm) && parsed.algorithm.length ? parsed.algorithm : ['⚠️ Algorithm unavailable due to parsing error.']
  };

  console.log(`📤 [${sessionId}] useOpenRouter returning:`, result); // Add logging
  return result;
}

function parseGPTOutput(reply, sessionId) {
  // Flexible regex to support various possible LLM header stylings
  const codeMatch = reply.match(/(=== )?Translated Code( ===)?:?\s*```(?:[a-z]*)?\n([\s\S]*?)```/i);
  const debugMatch = reply.match(/(=== )?Debugging Steps( ===)?:?\s*\n([\s\S]*?)((=== )?Algorithm( ===)?:?)/i);
  const algoMatch = reply.match(/(=== )?Algorithm( ===)?:?\s*\n([\s\S]*)/i);

  // Clean up lines for lists
  const cleanupLine = (line) =>
    line
      .replace(/^```+$/, '')
      .replace(/^[-–•*]?\s*(step\s*\d+:|\d+[\.\:])?\s*/i, '')
      .trim();

  // Defensive: Always array even if missing
  const translatedCode = codeMatch ? codeMatch[3].trim().split('\n').filter(line => line.trim()) : [];
  const debuggingSteps = debugMatch
    ? debugMatch[3].trim().split('\n').map(cleanupLine).filter(line => line.length)
    : [];
  const algorithm = algoMatch
    ? algoMatch[3].trim().split('\n').map(cleanupLine).filter(line => line.length && !/^```/.test(line))
    : [];

  if (translatedCode.length === 0 || debuggingSteps.length === 0 || algorithm.length === 0) {
    console.warn(`⚠️ [${sessionId}] parseGPTOutput: One or more sections missing!`, { translatedCode, debuggingSteps, algorithm });
  }

  return {
    translatedCode,
    debuggingSteps,
    algorithm,
  };
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