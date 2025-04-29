// Global timer variables
let progressInterval = null;
let countdownTimer = null;

// Attach translate button event
document.getElementById('translateButton').addEventListener('click', handleTranslate);

function handleTranslate() {
  const javaCode = document.getElementById('javaCode').value.trim();
  const targetLanguage = document.getElementById('targetLanguage').value;

  if (!javaCode || !targetLanguage) {
    alert("Please enter code and select a target language.");
    return;
  }

  startLoading();

  fetch('https://codemorpher-backend.onrender.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ javaCode, targetLanguage })
  })
  .then(response => response.json())
  .then(data => {
    stopLoading();

    if (data.error) {
      showError(data.message || "Something went wrong.");
      return;
    }

    updateTranslatedCode(data.translatedCode, targetLanguage);
    updateDebuggingSteps(data.debuggingSteps);
    updateAlgorithm(data.algorithm);
  })
  .catch(err => {
    stopLoading();
    showError("Network error or server unreachable.");
    console.error(err);
  });
}

// ✅ Update Translated Code
function updateTranslatedCode(lines, language) {
  const codeBlock = document.getElementById('translatedCodeBlock');
  codeBlock.className = `language-${language.toLowerCase()}`;
  codeBlock.innerHTML = lines.map(line => escapeHTML(line)).join('\n');
  Prism.highlightElement(codeBlock);

  const buttonsContainer = document.querySelector('#translatedCode .buttons');
  buttonsContainer.innerHTML = `
    <button onclick="copyToClipboard()">Copy to Clipboard</button>
    <button onclick="runCode('${language}')">Run Code</button>
  `;
}

// ✅ Open Compiler Based on Language
function runCode(language) {
  const codeBlock = document.getElementById('translatedCodeBlock');
  const code = codeBlock.innerText.trim();

  if (!code) {
    alert('No code to run!');
    return;
  }

  navigator.clipboard.writeText(code)
    .then(() => console.log('✅ Code copied automatically!'))
    .catch(err => console.error('❌ Copy failed:', err));

  let url = "";

  switch (language.toLowerCase()) {
    case "python":
      url = "https://www.programiz.com/python-programming/online-compiler/";
      break;
    case "javascript":
      url = "https://playcode.io/new";
      break;
    case "c":
      url = "https://www.onlinegdb.com/online_c_compiler";
      break;
    case "cpp":
      url = "https://www.onlinegdb.com/online_c++_compiler";
      break;
    case "csharp":
      url = "https://dotnetfiddle.net/";
      break;
    case "php":
      url = "https://phpfiddle.org/";
      break;
    default:
      alert("No compiler available for this language yet!");
      return;
  }

  window.open(url, "_blank");
}

// ✅ Update Debugging Steps
function updateDebuggingSteps(steps) {
  const ul = document.querySelector('#debuggingSteps .debug-list');
  ul.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
}

// ✅ Update Algorithm
function updateAlgorithm(steps) {
  const ol = document.querySelector('#algorithm .algorithm-list');
  ol.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
}

// ✅ Escape HTML
function escapeHTML(text) {
  return text.replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

// ✅ Show Error
function showError(message) {
  const content = document.getElementById('loadingContent');
  content.innerHTML = `
    <div class="error-message">❌ ${message}</div>
    <button onclick="retryTranslate()">Retry</button>
  `;
  document.getElementById('loadingOverlay').style.display = 'flex';
}

// Retry Translate
function retryTranslate() {
  stopLoading();
  handleTranslate();
}

// ✅ Start Loading Animation
function startLoading() {
  const overlay = document.getElementById('loadingOverlay');
  const progress = document.getElementById('progressBar');
  const fact = document.getElementById('funFact');
  overlay.style.display = 'flex';

  const facts = [
    "JavaScript was created in just 10 days!",
    "Python is named after Monty Python, not the snake!",
    "HTML is not a programming language, it’s a markup language!",
    "The first computer bug was a real moth!",
    "Java and JavaScript are not the same!"
  ];

  fact.textContent = `Fun Fact: ${facts[Math.floor(Math.random() * facts.length)]}`;

  let width = 0;
  if (progressInterval) clearInterval(progressInterval);
  progress.style.width = '0%';
  progressInterval = setInterval(() => {
    if (width >= 100) {
      clearInterval(progressInterval);
    } else {
      width += 2;
      progress.style.width = width + '%';
    }
  }, 200);

  let estimatedTime = 12;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (estimatedTime > 0) {
      fact.textContent = `Translating... ~${estimatedTime} seconds remaining`;
      estimatedTime--;
    } else {
      fact.textContent = "Almost done... Finalizing translation! ✨";
    }
  }, 1000);
}

// ✅ Stop Loading Animation
function stopLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
  if (progressInterval) clearInterval(progressInterval);
  if (countdownTimer) clearInterval(countdownTimer);
}

// ✅ Copy to Clipboard
function copyToClipboard() {
  const codeBlock = document.getElementById('translatedCodeBlock');
  const code = codeBlock.innerText.trim();

  navigator.clipboard.writeText(code)
    .then(() => {
      alert('✅ Code copied to clipboard!');
    })
    .catch(err => {
      console.error('❌ Failed to copy text:', err);
    });
}

// ✅ Collapse Output Sections
function toggleCollapse(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

// ✅ Line Counter for Java Input
const javaCodeInput = document.getElementById('javaCode');
const lineCounter = document.getElementById('lineCounter');

function updateLineCount() {
  const lines = javaCodeInput.value.split('\n').length;
  lineCounter.textContent = `Lines: ${lines}`;
}
javaCodeInput.addEventListener('input', updateLineCount);
window.addEventListener('DOMContentLoaded', updateLineCount);

// ✅ Language Selection
const langOptions = document.querySelectorAll('.lang-option');
langOptions.forEach(option => {
  option.addEventListener('click', () => {
    langOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    document.getElementById('targetLanguage').value = option.getAttribute('data-value');
  });
});

// Attach retry button
document.querySelector('.retry-icon').addEventListener('click', handleTranslate);
