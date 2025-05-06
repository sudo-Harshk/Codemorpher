const db = require('./firebaseInit');

async function logTranslation(sessionId, data, status = "success", engineUsed = "gpt") {
  try {
    const timestamp = new Date().toISOString();
    await db.collection("translations").doc(sessionId).set({
      sessionId,
      input: {
        javaCode: data.input.javaCode,
        targetLanguage: data.input.targetLanguage
      },
      translatedCode: data.translatedCode || [],
      debuggingSteps: data.debuggingSteps || null,
      algorithm: data.algorithm || null,
      engineUsed,
      status,
      timestamp
    });
    console.log(`📤 Logged translation [${sessionId}] to Firestore`);
  } catch (error) {
    console.error("❌ Firestore log error:", error.message);
  }
}
async function logBotEvent(sessionId, data) {
  try {
    const timestamp = new Date().toISOString();

    await db.collection("telegram_logs").doc(sessionId).set({
      sessionId,
      chatId: data.chatId,
      action: data.action,
      result: data.result,
      language: data.language || 'N/A',
      ...(data.image === 'photo' ? { image: 'photo' } : {}),
      error: data.error || null,
      timestamp
    });

    console.log(`🤖 Logged bot event [${sessionId}] to Firestore`);
  } catch (error) {
    console.error("❌ Failed to log bot event:", error.message);
  }
}



async function logError(sessionId, javaCode, targetLanguage, errorMessage) {
  try {
    const timestamp = new Date().toISOString();
    await db.collection("translations").doc(sessionId).set({
      sessionId,
      input: { javaCode, targetLanguage },
      translatedCode: [],
      debuggingSteps: null,
      algorithm: null,
      engineUsed: null,
      status: "error",
      error: errorMessage,
      timestamp
    });
    console.log(`⚠️ Logged error [${sessionId}] to Firestore`);
  } catch (error) {
    console.error("❌ Failed to log error:", error.message);
  }
}

module.exports = { logTranslation, logError, logBotEvent };
