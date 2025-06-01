let progressInterval = null;
let countdownTimer = null;
let stream = null; // For camera stream
let pendingImageBlob = null; // Store the image blob temporarily for confirmation

// DOM Elements for Camera and Confirmation
const cameraButton = document.getElementById('cameraButton');
const cameraModal = document.getElementById('cameraModal');
const cameraPreview = document.getElementById('cameraPreview');
const imagePreview = document.getElementById('imagePreview');
const captureButton = document.getElementById('captureButton');
const closeCameraButton = document.getElementById('closeCameraButton');
const cameraError = document.getElementById('cameraError');

// Use the Render backend URL
const BACKEND_URL = 'https://codemorpher-backend.onrender.com';

// Existing event listeners
document.getElementById('translateButton').addEventListener('click', handleTranslate);
document.getElementById('uploadImageButton').addEventListener('click', () => {
  document.getElementById('uploadInput').click();
});

document.getElementById('uploadInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Show confirmation modal with image preview
  pendingImageBlob = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    cameraPreview.style.display = 'none'; // Hide video
    imagePreview.style.display = 'block'; // Show image
    imagePreview.src = e.target.result; // Show the uploaded image
    cameraModal.style.display = 'block';
    updateModalForConfirmation();
  };
  reader.readAsDataURL(file);
});

// Camera functionality
cameraButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });

    cameraPreview.setAttribute("muted", "");
    cameraPreview.setAttribute("autoplay", "");
    cameraPreview.setAttribute("playsinline", "");

    cameraPreview.srcObject = stream;
    cameraPreview.style.display = 'block';
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    cameraModal.style.display = 'block';
    updateModalForCamera();

  } catch (err) {
    console.error('Error accessing camera:', err);
    let errorMessage = 'Error accessing camera. Please check permissions.';
    if (err.name === 'OverconstrainedError') {
      errorMessage = 'No back camera available.';
    } else if (err.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
    } else if (err.name === 'NotSecureError') {
      errorMessage = 'Camera access requires a secure connection (HTTPS). Please use HTTPS or test on localhost.';
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    }
    showError(errorMessage, err.name === 'OverconstrainedError' || err.name === 'NotFoundError');
  }
});

captureButton.addEventListener('click', async () => {
  // If in confirmation mode, this button acts as "Yes"
  if (captureButton.textContent === 'Yes') {
    cameraModal.style.display = 'none';
    processImage(pendingImageBlob);
    pendingImageBlob = null;
    return;
  }

  // Otherwise, capture the photo
  const canvas = document.createElement('canvas');
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cameraPreview, 0, 0);

  // Convert canvas to blob
  canvas.toBlob((blob) => {
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    // Show confirmation modal with image preview
    pendingImageBlob = blob;
    const reader = new FileReader();
    reader.onload = (e) => {
      cameraPreview.srcObject = null; // Clear the stream
      cameraPreview.style.display = 'none'; // Hide video
      imagePreview.style.display = 'block'; // Show image
      imagePreview.src = e.target.result; // Show the captured image
      updateModalForConfirmation();
    };
    reader.readAsDataURL(blob);
  }, 'image/jpeg');
});

closeCameraButton.addEventListener('click', () => {
  // If in confirmation mode, this button acts as "No"
  if (closeCameraButton.textContent === 'No') {
    cameraModal.style.display = 'none';
    showError('Image not processed. Please try an image containing code.');
    pendingImageBlob = null;
    return;
  }

  // Otherwise, close the camera
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraModal.style.display = 'none';
});

// Helper to update modal for camera mode
function updateModalForCamera() {
  captureButton.textContent = 'Capture';
  closeCameraButton.textContent = 'Close';
  const confirmationMessage = cameraModal.querySelector('.confirmation-message');
  if (confirmationMessage) confirmationMessage.style.display = 'none';
}

// Helper to update modal for confirmation mode
function updateModalForConfirmation() {
  captureButton.textContent = 'Yes';
  closeCameraButton.textContent = 'No';
  // Add a message above the buttons
  let confirmationMessage = cameraModal.querySelector('.confirmation-message');
  if (!confirmationMessage) {
    confirmationMessage = document.createElement('p');
    confirmationMessage.className = 'confirmation-message';
    confirmationMessage.textContent = 'Does this image contain code?';
    confirmationMessage.style.textAlign = 'center';
    confirmationMessage.style.marginBottom = '10px';
    cameraModal.insertBefore(confirmationMessage, captureButton.parentElement);
  } else {
    confirmationMessage.style.display = 'block';
  }
}

// Utility function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Process the image after confirmation with retry logic
async function processImage(blob) {
  startLoading("🧠 Extracting Java code from image...");

  const formData = new FormData();
  formData.append('image', blob, 'image.jpg');

  const maxRetries = 3;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      stopLoading();

      if (data.error) {
        // If the backend provides extracted text, include it in the error message
        if (data.extractedText) {
          showError(`${data.error} Extracted text: "${data.extractedText.slice(0, 100)}${data.extractedText.length > 100 ? '...' : ''}"`);
        } else {
          showError(data.error || "Could not extract Java code.");
        }
        return;
      }

      document.getElementById('javaCode').value = data.javaCode;
      updateLineCount();
      return; // Success, exit the function
    } catch (err) {
      if (attempt === maxRetries) {
        stopLoading();
        showError(err.message.includes('Failed to fetch') ? "Cannot connect to the server. Please check if the backend is running." : "Image upload failed or server error.");
        console.error(err);
        return;
      }
      console.warn(`Attempt ${attempt} failed. Retrying in 2 seconds...`);
      await delay(2000); // Wait 2 seconds before retrying
      attempt++;
    }
  }
}

// Handle Skip button click for camera errors
function skipCamera() {
  const content = document.getElementById('loadingContent');
  if (content) {
    const errorDiv = content.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    const skipButton = content.querySelector('.skip-button');
    if (skipButton) skipButton.remove();
  }
  stopLoading();
  if (cameraError) {
    cameraError.textContent = 'No back camera available';
    cameraError.style.display = 'block';
    // Hide the message after 5 seconds
    setTimeout(() => {
      cameraError.style.display = 'none';
      cameraError.textContent = '';
    }, 5000);
  }
}

// Modified showError to handle camera-specific errors with Skip button
function showError(message, isCameraError = false) {
  const content = document.getElementById('loadingContent');
  if (!content) {
    console.error('Loading content element not found.');
    return;
  }

  // Preserve existing elements (spinner, progress-bar, funFact) and append error
  const existingError = content.querySelector('.error-message');
  if (existingError) {
    existingError.textContent = `❌ ${message}`;
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `❌ ${message}`;
    content.appendChild(errorDiv);
  }

  // Remove any existing button
  const existingButton = content.querySelector('button');
  if (existingButton) existingButton.remove();

  // Add Skip button for camera errors, Retry for others
  if (isCameraError) {
    const skipButton = document.createElement('button');
    skipButton.className = 'skip-button';
    skipButton.textContent = 'Skip';
    skipButton.onclick = skipCamera;
    content.appendChild(skipButton);
  } else {
    const retryButton = document.createElement('button');
    retryButton.onclick = retryImageUpload;
    retryButton.textContent = 'Retry';
    content.appendChild(retryButton);
  }

  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }

  // Show the camera error element
  if (cameraError) {
    cameraError.textContent = message;
    cameraError.style.display = 'block';
  }
}

// Existing functions (unchanged)
function handleTranslate() {
  const javaCode = document.getElementById('javaCode').value.trim();
  const targetLanguage = document.getElementById('targetLanguage').value;

  if (!javaCode || !targetLanguage) {
    alert("Please enter code and select a target language.");
    return;
  }

  startLoading();

  fetch(`${BACKEND_URL}/translate`, {
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
      showError(err.message.includes('Failed to fetch') ? "Cannot connect to the server. Please check if the backend is running." : "Network error or server unreachable.");
      console.error(err);
    });
}

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

function retryTranslate() {
  const content = document.getElementById('loadingContent');
  if (content) {
    const errorDiv = content.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    const retryButton = content.querySelector('button');
    if (retryButton) retryButton.remove();
  }
  stopLoading();
  handleTranslate();
}

function retryImageUpload() {
  const content = document.getElementById('loadingContent');
  if (content) {
    const errorDiv = content.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
    const retryButton = content.querySelector('button');
    if (retryButton) retryButton.remove();
  }
  stopLoading();
  // Trigger the upload or camera again
  if (cameraButton) {
    cameraButton.click(); // Reopen the camera modal
  } else if (document.getElementById('uploadInput')) {
    document.getElementById('uploadInput').click(); // Reopen file picker
  }
}

function startLoading(customMessage = null) {
  const overlay = document.getElementById('loadingOverlay');
  const progress = document.getElementById('progressBar');
  const fact = document.getElementById('funFact');

  // Check if elements exist before accessing properties
  if (!overlay || !progress || !fact) {
    console.error('Loading overlay elements not found:', { overlay, progress, fact });
    return;
  }

  overlay.style.display = 'flex';

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

  // 🧠 If a custom static message is passed (for upload)
  if (customMessage) {
    fact.textContent = customMessage;
    return;
  }

  // ⏳ Default: countdown for translation
  const facts = [
    "JavaScript was created in just 10 days!",
    "Python is named after Monty Python, not the snake!",
    "HTML is not a programming language, it’s a markup language!",
    "The first computer bug was a real moth!",
    "Java and JavaScript are not the same!"
  ];

  fact.textContent = `Fun Fact: ${facts[Math.floor(Math.random() * facts.length)]}`;

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
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
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