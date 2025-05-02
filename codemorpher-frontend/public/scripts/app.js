let progressInterval = null;
let countdownTimer = null;

document.getElementById('translateButton').addEventListener('click', handleTranslate);
document.getElementById('uploadImageButton').addEventListener('click', () => {
  document.getElementById('uploadInput').click();
});

document.getElementById('uploadInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  startLoading();

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('https://codemorpher-backend.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    stopLoading();

    if (data.error) {
      showError(data.error || "Could not extract Java code.");
      return;
    }

    document.getElementById('javaCode').value = data.javaCode;
    updateLineCount();
  } catch (err) {
    stopLoading();
    showError("Image upload failed or server error.");
    console.error(err);
  }
});

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

      if (data.fallback) {
        showError("Translation incomplete. Displaying fallback result.");
        updateTranslatedCode([data.translatedCode], targetLanguage);
        updateDebuggingSteps([data.debuggingSteps]);
        updateAlgorithm([data.algorithm]);
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

function updateTranslatedCode(lines, language) {
  const codeBlock = document.getElementById('translatedCodeBlock');
  codeBlock.className = `language-${language.toLowerCase()}`;
  codeBlock.innerHTML = lines.map(line => escapeHTML(line)).join('\n');

  if (language.toLowerCase() !== 'php') {
    Prism.highlightElement(codeBlock);
  }

  const buttonsContainer = document.querySelector('#translatedCode .buttons');
  buttonsContainer.innerHTML = `
    <button onclick="copyToClipboard()">Copy to Clipboard</button>
    <button onclick="runCode('${language}')">Run Code</button>
  `;
}

function runCode(language) {
  const codeBlock = document.getElementById('translatedCodeBlock');
  const code = codeBlock.innerText.trim();

  if (!code) {
    alert('No code to run!');
    return;
  }

  navigator.clipboard.writeText(code)
    .then(() => console.log('Code copied to clipboard.'))
    .catch(err => console.error('Failed to copy:', err));

  let url = "";
  switch (language.toLowerCase()) {
    case "python":
      url = "https://www.programiz.com/python-programming/online-compiler/";
      break;
    case "javascript":
      url = "https://playcode.io/new";
      break;
    case "typescript":
      url = "https://www.typescriptlang.org/play";
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
      url = "https://www.onlinegdb.com/online_php_interpreter";
      break;
    default:
      alert("No compiler available for this language yet!");
      return;
  }
  window.open(url, "_blank");
}

function updateDebuggingSteps(steps) {
  const ul = document.querySelector('#debuggingSteps .debug-list');
  ul.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
  document.getElementById('debuggingSteps').classList.remove('collapsed');
}

function updateAlgorithm(steps) {
  const ol = document.querySelector('#algorithm .algorithm-list');
  ol.innerHTML = steps.map(step => `<li>${escapeHTML(step)}</li>`).join('');
  document.getElementById('algorithm').classList.remove('collapsed');
}

function escapeHTML(text) {
  return text.replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

function showError(message) {
  const content = document.getElementById('loadingContent');
  content.innerHTML = `
    <div class="error-message">❌ ${message}</div>
    <button onclick="retryTranslate()">Retry</button>
  `;
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function retryTranslate() {
  stopLoading();
  handleTranslate();
}

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

function stopLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
  if (progressInterval) clearInterval(progressInterval);
  if (countdownTimer) clearInterval(countdownTimer);
}

function copyToClipboard() {
  const codeBlock = document.getElementById('translatedCodeBlock');
  const code = codeBlock.innerText.trim();

  if (!code) {
    alert('Nothing to copy!');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('✅ Code copied to clipboard!');
      })
      .catch(err => {
        console.error('❌ Clipboard API failed. Falling back.', err);
        fallbackCopy(code);
      });
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    alert("✅ Code copied (fallback)!");
  } catch (err) {
    alert("❌ Copy failed. Please do it manually.");
  }
  document.body.removeChild(textarea);
}

function toggleCollapse(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

const javaCodeInput = document.getElementById('javaCode');
const lineCounter = document.getElementById('lineCounter');

function updateLineCount() {
  const lines = javaCodeInput.value.split('\n').length;
  lineCounter.textContent = `Lines: ${lines}`;
}
javaCodeInput.addEventListener('input', updateLineCount);
window.addEventListener('DOMContentLoaded', updateLineCount);

const langOptions = document.querySelectorAll('.lang-option');
langOptions.forEach(option => {
  option.addEventListener('click', () => {
    langOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    document.getElementById('targetLanguage').value = option.getAttribute('data-value');
  });
});

document.querySelector('.retry-icon').addEventListener('click', handleTranslate);
