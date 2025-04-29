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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ javaCode, targetLanguage })
  })
    .then(response => response.json())
    .then(data => {
      stopLoading();

      if (data.error) {
        showError(data.message || "Something went wrong.");
        return;
      }

      updateTranslatedCode(data.translatedCode);
      updateDebuggingSteps(data.debuggingSteps);
      updateAlgorithm(data.algorithm);
    })
    .catch(err => {
      stopLoading();
      showError("Network error or server unreachable.");
      console.error(err);
    });
}

// Update Translated Code
function updateTranslatedCode(lines) {
  const pre = document.querySelector('#translatedCode pre');
  pre.innerHTML = lines.map(line => escapeHTML(line)).join('\n');
}

// Update Debugging Steps
function updateDebuggingSteps(steps) {
  const ul = document.querySelector('#debuggingSteps .debug-list');
  ul.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
}

// Update Algorithm Steps
function updateAlgorithm(steps) {
  const ol = document.querySelector('#algorithm .algorithm-list');
  ol.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
}

// Escape HTML safely
function escapeHTML(text) {
  return text.replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

// Show Error
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

// Start Loading Animation + Estimated Time Countdown
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

  // Show initial random fun fact
  fact.textContent = `Fun Fact: ${facts[Math.floor(Math.random() * facts.length)]}`;

  // Animate progress bar
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

  // Start Estimated Countdown
  let estimatedTime = 12; // seconds
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

// Stop Loading Animation and Clear Timers
function stopLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
  
  if (progressInterval) clearInterval(progressInterval);
  if (countdownTimer) clearInterval(countdownTimer);
}

// Attach retry icon (top right corner reload icon)
document.querySelector('.retry-icon').addEventListener('click', handleTranslate);

// Collapse output sections
function toggleCollapse(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

// Copy Translated Code to Clipboard
function copyToClipboard() {
  const code = document.querySelector('#translatedCode pre').textContent;
  navigator.clipboard.writeText(code).then(() => alert('Copied to clipboard!'));
}

// Real-time Line Count Tracker
const javaCodeInput = document.getElementById('javaCode');
const lineCounter = document.getElementById('lineCounter');

function updateLineCount() {
  const lines = javaCodeInput.value.split('\n').length;
  lineCounter.textContent = `Lines: ${lines}`;
}
javaCodeInput.addEventListener('input', updateLineCount);
window.addEventListener('DOMContentLoaded', updateLineCount);

// Language Selection (Icons for Target Language)
const langOptions = document.querySelectorAll('.lang-option');
langOptions.forEach(option => {
  option.addEventListener('click', () => {
    langOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    document.getElementById('targetLanguage').value = option.getAttribute('data-value');
  });
});

function runCode() {
  const selectedLang = document.getElementById('targetLanguage').value;

  let compilerUrl = '';
  switch (selectedLang) {
    case 'javascript':
      compilerUrl = 'https://onecompiler.com/javascript';
      break;
    case 'python':
      compilerUrl = 'https://onecompiler.com/python';
      break;
    case 'c':
      compilerUrl = 'https://onecompiler.com/c';
      break;
    case 'cpp':
      compilerUrl = 'https://onecompiler.com/cpp';
      break;
    case 'csharp':
      compilerUrl = 'https://onecompiler.com/csharp';
      break;
    case 'typescript':
      compilerUrl = 'https://onecompiler.com/typescript';
      break;
    default:
      alert('Selected language is not supported yet.');
      return;
  }

  if (compilerUrl) {
    window.open(compilerUrl, '_blank'); 
  }
}

