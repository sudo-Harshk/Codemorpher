const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function extractJavaCodeFromImage(imagePath) {
  const sessionId = `vision-${Date.now()}`;
  console.log(`🖼️ [${sessionId}] Extracting text from image: ${imagePath}`);

  try {
    const imageData = await fs.readFile(imagePath);
    const imageBase64 = imageData.toString("base64");
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = "Extract the text from the image. If it contains Java code, return only the Java code. Otherwise, return the raw text.";
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const extractedText = result.response.text().trim();

    console.log(`📝 [${sessionId}] Extracted text: ${extractedText}`);

    // Check for "no text" message
    const noTextMessage = "There is no text in the image. Therefore, I return nothing.";
    if (extractedText.toLowerCase().includes("there is no text")) {
      console.log(`ℹ️ [${sessionId}] No text detected in image.`);
      return { extractedText: noTextMessage };
    }

    // Relaxed heuristic to detect Java code
    const isJavaCode = (
      extractedText.includes("public") ||
      extractedText.includes("class") ||
      extractedText.includes("void") ||
      extractedText.includes("static") ||
      extractedText.includes("main") ||
      (extractedText.includes("{") && extractedText.includes("}")) ||
      extractedText.includes("System.out") ||
      extractedText.match(/\b(int|double|float|String|boolean)\b/) ||
      extractedText.match(/\b(new|return|if|else|for|while)\b/)
    ) && !extractedText.includes("def ");

    if (isJavaCode) {
      console.log(`✅ [${sessionId}] Java code detected.`);
      return { javaCode: extractedText };
    } else {
      console.log(`❌ [${sessionId}] No Java code detected.`);
      return { error: "No valid Java code found in image.", extractedText };
    }
  } catch (err) {
    console.error(`❌ [${sessionId}] Error extracting text from image: ${err.message}`);
    return {
      error: "Failed to process the image due to an API error.",
      extractedText: "Unable to extract text due to an error. Please try again."
    };
  }
}

module.exports = { extractJavaCodeFromImage };
