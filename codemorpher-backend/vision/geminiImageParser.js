const fs = require('fs');
const FileType = require('file-type');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractJavaCodeFromImage(filePath) {
  const fileData = fs.readFileSync(filePath);

  // Detect MIME type from file content
  const fileType = await FileType.fromBuffer(fileData);
  const mimeType = fileType?.mime;

  if (!mimeType) {
    throw new Error("Unable to determine mime type of the image.");
  }

  const base64Image = fileData.toString('base64');

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
    ]
  });

  const prompt = `
The following image contains code text extracted via OCR.
1. Check if it is Java code.
2. If yes, fix common OCR typos (like 'jarla' instead of 'java', misread semicolons, brackets, etc).
3. Return only the corrected Java code inside a code block: \`\`\`java ... \`\`\`
4. If it is not Java code, respond only with: NOT_JAVA_CODE
`;

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    },
    { text: prompt }
  ]);

  const text = result.response.candidates[0]?.content?.parts?.[0]?.text || '';

  if (text.includes('NOT_JAVA')) return null;

  return text.trim();
}

module.exports = extractJavaCodeFromImage;
