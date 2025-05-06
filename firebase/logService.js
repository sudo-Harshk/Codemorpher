const { db } = require('./firebaseInit');

async function logBotEvent(sessionId, logData) {
  try {
    await db.collection('bot_logs').doc(sessionId).set({
      timestamp: new Date().toISOString(),
      ...logData
    });
    console.log(`🤖 Logged bot event [${sessionId}] to Firestore`);
  } catch (error) {
    console.error(`❌ Failed to log event [${sessionId}]`, error.message);
  }
}

module.exports = { logBotEvent };
