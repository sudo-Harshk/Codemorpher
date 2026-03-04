/**
 * Extract one or more top-level JSON objects from a possibly-chatty LLM reply.
 * Handles nested braces that appear inside strings so we don't break on code
 * like: "function x() { return 1; }".
 *
 * @param {string} reply
 * @returns {string[]}
 */
function extractJsonObjects(reply) {
  const objects = [];
  const text = String(reply);
  const len = text.length;

  let index = 0;
  while (index < len) {
    const start = text.indexOf('{', index);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < len; i += 1) {
      const ch = text[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (ch === '\\') {
        if (inString) {
          escape = true;
        }
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (ch === '{') {
          depth += 1;
        } else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
    }

    if (end !== -1) {
      objects.push(text.slice(start, end + 1));
      index = end + 1;
    } else {
      // Unbalanced braces; stop to avoid infinite loop
      break;
    }
  }

  return objects;
}

/**
 * Normalize an arbitrary value into an array of non-empty strings.
 */
function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

/**
 * Parse and validate a model reply into the three expected sections.
 * Returns empty arrays on failure; callers should layer additional
 * fallbacks or defaults on top.
 *
 * @param {string} reply
 * @param {string} sessionId
 * @returns {{translatedCode: string[], debuggingSteps: string[], algorithm: string[]}}
 */
function parseAndValidate(reply, sessionId = 'unknown-session') {
  try {
    const candidates = extractJsonObjects(reply);

    if (!candidates.length) {
      console.warn(`⚠️ [${sessionId}] parser: No JSON object found in reply.`);
      return {
        translatedCode: [],
        debuggingSteps: [],
        algorithm: [],
      };
    }

    // Prefer the last JSON object, since models sometimes "correct" themselves later.
    for (let i = candidates.length - 1; i >= 0; i -= 1) {
      const candidate = candidates[i];
      try {
        const raw = JSON.parse(candidate);

        const translatedCodeString =
          typeof raw.translatedCode === 'string' ? raw.translatedCode : '';
        const translatedCode = translatedCodeString
          ? translatedCodeString.split('\n').filter((line) => line.trim())
          : [];

        const debuggingSteps = normalizeArray(raw.debuggingSteps);
        const algorithm = normalizeArray(raw.algorithm);

        if (translatedCode.length === 0 || debuggingSteps.length === 0 || algorithm.length === 0) {
          console.warn(
            `⚠️ [${sessionId}] parser: One or more sections missing after JSON parse!`,
            { translatedCode, debuggingSteps, algorithm }
          );
        }

        return {
          translatedCode,
          debuggingSteps,
          algorithm,
        };
      } catch (err) {
        console.warn(
          `⚠️ [${sessionId}] parser: Failed to parse JSON candidate:`,
          err.message
        );
      }
    }

    console.warn(`⚠️ [${sessionId}] parser: All JSON candidates failed to parse.`);
    return {
      translatedCode: [],
      debuggingSteps: [],
      algorithm: [],
    };
  } catch (err) {
    console.warn(`⚠️ [${sessionId}] parser: Unexpected error:`, err.message);
    return {
      translatedCode: [],
      debuggingSteps: [],
      algorithm: [],
    };
  }
}

module.exports = {
  extractJsonObjects,
  parseAndValidate,
};

