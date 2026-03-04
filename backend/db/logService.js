const db = require('./database');

const insertTranslation = db.prepare(`
  INSERT INTO translations
    (sessionId, javaCode, targetLanguage, translatedCode, debuggingSteps, algorithm, engineUsed, status, error, timestamp)
  VALUES
    (@sessionId, @javaCode, @targetLanguage, @translatedCode, @debuggingSteps, @algorithm, @engineUsed, @status, @error, @timestamp)
`);

async function logTranslation(sessionId, data, status = 'success', engineUsed = 'openrouter') {
  try {
    insertTranslation.run({
      sessionId,
      javaCode: data.input?.javaCode || null,
      targetLanguage: data.input?.targetLanguage || null,
      translatedCode: JSON.stringify(data.translatedCode || []),
      debuggingSteps: JSON.stringify(data.debuggingSteps || null),
      algorithm: JSON.stringify(data.algorithm || null),
      engineUsed,
      status,
      error: null,
      timestamp: new Date().toISOString(),
    });
    console.log(`📦 Logged translation [${sessionId}] to SQLite`);
  } catch (err) {
    console.error('❌ SQLite log error:', err.message);
  }
}

async function logError(sessionId, javaCode, targetLanguage, errorMessage) {
  try {
    insertTranslation.run({
      sessionId,
      javaCode,
      targetLanguage,
      translatedCode: JSON.stringify([]),
      debuggingSteps: null,
      algorithm: null,
      engineUsed: null,
      status: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    console.log(`⚠️ Logged error [${sessionId}] to SQLite`);
  } catch (err) {
    console.error('❌ SQLite error log failed:', err.message);
  }
}

module.exports = { logTranslation, logError };
