const OpenAI = require('openai');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');
const multer = require('multer');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'Codemorpher',
  },
});

async function useOpenRouter(javaCode, targetLanguage) {

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
  
  const completion = await openai.chat.completions.create({
    model: 'mistralai/mistral-7b-instruct',
    messages: [{ role: 'user', content: prompt }],
  });

  const reply = completion.choices?.[0]?.message?.content || '';

  if (!reply) {
    throw new Error('OpenRouter response incomplete.');
  }

  // Uncomment to debug GPT output
  // console.log("🧠 GPT RAW REPLY:\n", reply);

  const parsed = parseGPTOutput(reply);
  return parsed;
}

function parseGPTOutput(reply) {
  // Flexible regex to support both "===" and ":" style headers
  const codeMatch = reply.match(/(=== )?Translated Code( ===)?:?\s*```(?:[a-z]*)?\n([\s\S]*?)```/i);
  const debugMatch = reply.match(/(=== )?Debugging Steps( ===)?:?\s*\n([\s\S]*?)((=== )?Algorithm( ===)?:?)/i);
  const algoMatch = reply.match(/(=== )?Algorithm( ===)?:?\s*\n([\s\S]*)/i);

  // Line cleanup function
  const cleanupLine = (line) =>
    line
      .replace(/^```+$/, '') // remove standalone ``` lines
      .replace(/^[-–•*]?\s*(step\s*\d+:|\d+[\.\:])?\s*/i, '') // remove 1., step 1:, etc
      .trim();

  const translatedCode = codeMatch ? codeMatch[3].trim().split('\n') : [];

  const debuggingSteps = debugMatch
    ? debugMatch[3]
        .trim()
        .split('\n')
        .map(cleanupLine)
        .filter(line => line.length)
    : [];

  const algorithm = algoMatch
    ? algoMatch[3]
        .trim()
        .split('\n')
        .map(cleanupLine)
        .filter(line => line.length && !/^```/.test(line))
    : [];

  return {
    translatedCode,
    debuggingSteps,
    algorithm,
  };
}

const cleanupUploads = async () => {
  const files = await fsPromises.readdir(uploadDir);
  const now = Date.now();
  
  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const stats = await fsPromises.stat(filePath);
    if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
      await fsPromises.unlink(filePath);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupUploads, 60 * 60 * 1000);

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

module.exports = useOpenRouter;
