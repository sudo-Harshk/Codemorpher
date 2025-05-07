const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;

// Initialize Gemini Vision API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use a model that supports vision

async function extractJavaCodeFromImage(imagePath) {
  const sessionId = `vision-${Date.now()}`;
  console.log(`🖼️ [${sessionId}] Extracting text from image: ${imagePath}`);

  try {
    // Read the image file
    const imageData = await fs.readFile(imagePath);
    const imageBase64 = imageData.toString("base64");
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Prepare the prompt for Gemini Vision API
    const prompt = "Extract the text from the image. If it contains Java code, return only the Java code. Otherwise, return the raw text.";
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType
      }
    };

    // Call Gemini Vision API
    const result = await model.generateContent([prompt, imagePart]);
    const extractedText = result.response.text().trim();

    console.log(`📝 [${sessionId}] Extracted text: ${extractedText}`);

    // Relaxed heuristic to detect Java code
    const isJavaCode = (
      extractedText.includes("public") ||
      extractedText.includes("class") ||
      extractedText.includes("void") ||
      extractedText.includes("static") ||
      extractedText.includes("main") ||
      (extractedText.includes("{") && extractedText.includes("}")) ||
      extractedText.includes("System.out") ||
      extractedText.match(/\b(int|double|float|String|boolean)\b/) || // Common Java types
      extractedText.match(/\b(new|return|if|else|for|while)\b/) // Common Java keywords
    ) && !extractedText.includes("def "); // Exclude Python-like syntax

    if (isJavaCode) {
      console.log(`✅ [${sessionId}] Java code detected.`);
      return extractedText;
    } else {
      console.log(`❌ [${sessionId}] No Java code detected.`);
      return { error: "No valid Java code found in image.", extractedText };
    }
  } catch (err) {
    console.error(`❌ [${sessionId}] Error extracting text from image: ${err.message}`);
    throw err;
  }
}

module.exports = { extractJavaCodeFromImage };
