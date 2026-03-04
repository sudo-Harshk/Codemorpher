const useOpenRouter = require('./useOpenRouter');

const DEFAULT_PROVIDER = process.env.TRANSLATOR_PROVIDER || 'openrouter';

async function mockProvider(javaCode, targetLanguage) {
  const header = `// Mock translation from Java to ${targetLanguage}`;
  const body = javaCode.split('\n');

  return {
    translatedCode: [header, '', ...body],
    debuggingSteps: [
      '1. This is a mock translation used for testing the Codemorpher pipeline.',
      '2. The original Java code is wrapped with a simple header comment.',
      '3. No real syntax conversion is performed in this mode.',
      '4. Use this provider only to validate end-to-end flow, not translation quality.',
      '5. Switch to the openrouter provider in .env for real translations.',
    ],
    algorithm: [
      'Read the provided Java source code.',
      'Create a descriptive header explaining this is a mock translation.',
      'Append the original Java code lines after the header.',
      'Return the combined lines as the translated code output.',
      'Surface generic debugging and algorithm steps to the frontend.',
    ],
  };
}

/**
 * Resolve the configured provider name to an implementation function.
 */
function getProvider(name = DEFAULT_PROVIDER) {
  const provider = (name || '').toLowerCase();

  switch (provider) {
    case 'openrouter':
      return {
        name: 'openrouter',
        fn: useOpenRouter,
      };
    case 'mock':
      return {
        name: 'mock',
        fn: mockProvider,
      };
    default:
      console.warn(
        `⚠️ Unknown TRANSLATOR_PROVIDER "${name}", falling back to "openrouter".`
      );
      return {
        name: 'openrouter',
        fn: useOpenRouter,
      };
  }
}

/**
 * High-level entrypoint used by the /translate route.
 * Keeps a stable return shape so the rest of the backend and frontend
 * do not depend on provider details.
 *
 * @param {string} javaCode
 * @param {string} targetLanguage
 * @param {{ sessionId?: string, providerOverride?: string }} options
 */
async function translateWithProvider(javaCode, targetLanguage, options = {}) {
  const { sessionId = `sess-${Date.now()}`, providerOverride } = options;
  const { name, fn } = getProvider(providerOverride || process.env.TRANSLATOR_PROVIDER);

  console.log(
    `[${sessionId}] Translator using provider="${name}" targetLanguage="${targetLanguage}", javaCodeLength=${javaCode.length}`
  );

  const result = await fn(javaCode, targetLanguage);

  // Ensure we always have arrays to avoid downstream surprises.
  const normalized = {
    translatedCode: Array.isArray(result.translatedCode)
      ? result.translatedCode
      : [],
    debuggingSteps: Array.isArray(result.debuggingSteps)
      ? result.debuggingSteps
      : [],
    algorithm: Array.isArray(result.algorithm)
      ? result.algorithm
      : [],
    // Preserve any existing flags like fallback if present
    fallback: Boolean(result.fallback),
    provider: name,
  };

  // Lightweight post-processing hook: trim whitespace and collapse
  // accidental empty lines in translatedCode.
  normalized.translatedCode = normalized.translatedCode
    .map((line) => (typeof line === 'string' ? line.replace(/\s+$/u, '') : ''))
    .filter(Boolean);

  console.log(
    `[${sessionId}] Translator result: lines=${normalized.translatedCode.length}, ` +
    `debugSteps=${normalized.debuggingSteps.length}, algorithmSteps=${normalized.algorithm.length}, ` +
    `fallback=${normalized.fallback}`
  );

  return normalized;
}

module.exports = {
  translateWithProvider,
};

