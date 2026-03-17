const { detect } = require('program-language-detector');
const Parser = require('tree-sitter');
const Java = require('tree-sitter-java');

const parser = new Parser();
parser.setLanguage(Java);

// Layer 1: Sanity thresholds
const MIN_CODE_LENGTH = 10;
const JAVA_LABELS = ['Java', 'java'];

// Patterns that suggest "code-like" input (at least one should be present)
const CODE_LIKE_PATTERNS = [
  /\b(class|public|private|protected|void|int|String|return|if|for|while)\b/,  // Java
  /\b(def|function|const|var|print|import|from)\b/,  // Python, JS, etc. (so Layer 2 can reject with "Detected: X")
  /[{};]/,           // Braces or semicolons
  /\([^)]*\)\s*{/,   // Method-like: (args) {
  /=\s*[^=]/,        // Assignment
];

// Patterns that suggest non-code (reject if matched)
const NON_CODE_PATTERNS = [
  { pattern: /^\s*\{[\s\S]*\}\s*$/, hint: 'JSON' },
  { pattern: /^<\s*[a-zA-Z][\s\S]*>[\s\S]*<\//, hint: 'HTML' },
  { pattern: /^[\s\S]*"[\w]+"\s*:\s*[\s\S]*$/, hint: 'JSON-like data' },
];

// User-friendly rejection messages (tight, actionable)
const REJECTION_MESSAGES = {
  empty: 'Please enter some Java code to translate.',
  tooShort: `Code is too short. Enter at least ${MIN_CODE_LENGTH} characters of Java.`,
  notCodeLike: "This doesn't look like Java code. Paste a Java class or method to translate.",
  nonCodeFormat: (hint) => `This looks like ${hint}, not Java. Paste Java source code.`,
  wrongLanguage: (detected) =>
    `This looks like ${detected}, not Java. Codemorpher translates Java only—paste Java code.`,
  invalidSyntax:
    "Not valid Java. Check syntax, braces, or use Java (not C#, Kotlin, or Scala).",
  parseFailed:
    "Could not parse as Java. Check your syntax and try again.",
};

/**
 * Three-layer Java input validation.
 * @param {string} code - Raw code string
 * @returns {{ valid: boolean, error?: string, layer?: number, detectedLanguage?: string, code?: string }}
 */
function validateJavaInput(code) {
  const trimmed = (code || '').trim();

  // ----- Layer 1: Sanity checks -----
  if (!trimmed) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.empty,
      layer: 1,
      code: 'EMPTY_INPUT',
    };
  }

  if (trimmed.length < MIN_CODE_LENGTH) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.tooShort,
      layer: 1,
      code: 'TOO_SHORT',
    };
  }

  const looksLikeCode = CODE_LIKE_PATTERNS.some((p) => p.test(trimmed));
  if (!looksLikeCode) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.notCodeLike,
      layer: 1,
      code: 'NOT_CODE_LIKE',
    };
  }

  const nonCodeMatch = NON_CODE_PATTERNS.find(({ pattern }) => pattern.test(trimmed));
  if (nonCodeMatch) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.nonCodeFormat(nonCodeMatch.hint),
      layer: 1,
      code: 'NON_CODE_FORMAT',
    };
  }

  // ----- Layer 2: Language detection -----
  const detected = detect(trimmed);
  if (!JAVA_LABELS.includes(detected)) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.wrongLanguage(detected),
      layer: 2,
      detectedLanguage: detected,
      code: 'WRONG_LANGUAGE',
    };
  }

  // ----- Layer 3: Syntax validation (tree-sitter) -----
  try {
    const tree = parser.parse(trimmed);
    if (hasErrorNodes(tree.rootNode)) {
      return {
        valid: false,
        error: REJECTION_MESSAGES.invalidSyntax,
        layer: 3,
        code: 'INVALID_JAVA_SYNTAX',
      };
    }
  } catch (err) {
    return {
      valid: false,
      error: REJECTION_MESSAGES.parseFailed,
      layer: 3,
      code: 'PARSE_FAILED',
    };
  }

  return { valid: true };
}

function hasErrorNodes(node) {
  if (node.type === 'ERROR' || node.hasError) return true;
  for (let i = 0; i < node.childCount; i++) {
    if (hasErrorNodes(node.child(i))) return true;
  }
  return false;
}

module.exports = { validateJavaInput };
