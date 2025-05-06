require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http'); // For health check
const { logBotEvent } = require('./firebase/logService.js');

const { BOT_TOKEN, BACKEND_URL, PORT = 3000 } = process.env;
if (!BOT_TOKEN || !BACKEND_URL) {
  console.error('❌ BOT_TOKEN or BACKEND_URL not set in .env');
  process.exit(1);
}

// Start a health check HTTP server
http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`🌐 Health check running on port ${PORT}`);
});

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const uploadWaitingUsers = new Map();
const lastExtractedCode = new Map();
const translationWaitingUsers = new Map();

console.log(`[${new Date().toISOString()}] ✅ Bot is starting...`);

bot.on('polling_error', async (err) => {
  console.error(`[${new Date().toISOString()}] ❌ Polling error:`, err);
});

async function runTimerUntilDone(chatId, startText, endText, asyncFn) {
  const sent = await bot.sendMessage(chatId, `${startText} (0s)`);
  const messageId = sent.message_id;
  let seconds = 0;
  let done = false;

  const interval = setInterval(() => {
    if (!done) {
      seconds++;
      bot.editMessageText(`${startText} (${seconds}s)`, {
        chat_id: chatId,
        message_id: messageId
      }).catch(() => {});
    }
  }, 1000);

  try {
    const result = await asyncFn();
    done = true;
    clearInterval(interval);
    await bot.editMessageText(`${endText} (${seconds}s)`, {
      chat_id: chatId,
      message_id: messageId
    });
    return { result, seconds };
  } catch (err) {
    done = true;
    clearInterval(interval);
    await bot.editMessageText(`❌ Failed after ${seconds}s`, {
      chat_id: chatId,
      message_id: messageId
    });
    throw err;
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const type = msg.photo
    ? 'photo'
    : msg.document?.mime_type?.startsWith('image/')
    ? 'image document'
    : 'text';

  console.log(`[${new Date().toISOString()}] 📩 Received message:`, {
    chatId,
    type,
    text: msg.text || '[non-text]'
  });

  if (msg.text === '/start' || msg.text === '/help') {
    return bot.sendMessage(chatId, `👋 Welcome to Codemorpher Bot!\n\nYou can:\n🔁 Use /translate to convert Java code to another language.\n🖼️ Use /upload to extract Java code from an image.`);
  }

  if (msg.text === '/upload') {
    uploadWaitingUsers.set(chatId, true);
    console.log(`[${new Date().toISOString()}] ⬆️ User triggered /upload`);
    return bot.sendMessage(chatId, '📤 Please send an image with Java code.');
  }

  if (msg.text === '/translate') {
    translationWaitingUsers.set(chatId, true);
    return bot.sendMessage(chatId, '📝 Please send your *Java code*.', {
      parse_mode: 'Markdown'
    });
  }

  if (translationWaitingUsers.has(chatId) && msg.text && !msg.text.startsWith('/')) {
    translationWaitingUsers.delete(chatId);
    const javaCode = msg.text;
    console.log(`[${new Date().toISOString()}] 🧾 Java code received:\n${javaCode}`);
    return askForLanguage(chatId, javaCode);
  }

  const isPhoto = !!msg.photo;
  const isImageDoc =
    msg.document &&
    (msg.document.mime_type?.startsWith('image/') ||
      msg.document.file_name?.match(/\.(jpe?g|png)$/i));

  if (uploadWaitingUsers.has(chatId) && (isPhoto || isImageDoc)) {
    uploadWaitingUsers.delete(chatId);
    let fileId, fileName;

    if (isPhoto) {
      fileId = msg.photo[msg.photo.length - 1].file_id;
      fileName = 'temp.jpg';
    } else {
      fileId = msg.document.file_id;
      fileName = msg.document.file_name || 'upload.jpg';
    }

    try {
      const file = await bot.getFile(fileId);
      const fileURL = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
      const localPath = path.join(__dirname, fileName);
      const response = await axios({ url: fileURL, responseType: 'stream' });
      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const form = new FormData();
      form.append('image', fs.createReadStream(localPath));
      const { result } = await runTimerUntilDone(
        chatId,
        '⏳ Processing image...',
        '✅ Image processed!',
        async () => {
          return await axios.post(`${BACKEND_URL}/upload`, form, {
            headers: form.getHeaders()
          });
        }
      );

      fs.unlink(localPath, () => {});
      const { javaCode, error, extractedText } = result.data;
      const sessionId = `upload-${Date.now()}`;

      if (error || !javaCode) {
        await logBotEvent(sessionId, {
          chatId,
          action: 'image_upload',
          result: 'error',
          image: 'photo',
          language: 'N/A',
          error
        });
        return bot.sendMessage(chatId, `⚠️ No Java code detected.\nExtracted Text:\n${extractedText || 'None'}`);
      }

      lastExtractedCode.set(chatId, javaCode);
      await bot.sendMessage(chatId, `✅ Extracted Java code:\n\`\`\`\n${javaCode.trim()}\n\`\`\``, {
        parse_mode: 'Markdown'
      });

      await logBotEvent(sessionId, {
        chatId,
        action: 'image_upload',
        result: 'success',
        image: 'photo',
        language: 'N/A'
      });

      if (
        javaCode.toLowerCase().includes('there is no text') ||
        javaCode.toLowerCase().includes('i cannot return any text')
      ) {
        return;
      }

      await bot.sendMessage(chatId, '❓ Would you like to translate this code?', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Translate', callback_data: 'translate_last' }]]
        }
      });

    } catch (err) {
      await logBotEvent(`upload-${Date.now()}`, {
        chatId,
        action: 'image_upload',
        result: 'error',
        image: 'photo',
        language: 'N/A',
        error: err.message
      });
      bot.sendMessage(chatId, '❌ Failed to process the image.');
    }
    return;
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  if (action === 'translate_last') {
    const code = lastExtractedCode.get(chatId);
    if (!code) {
      return bot.sendMessage(chatId, '⚠️ No extracted code available.');
    }
    askForLanguage(chatId, code);
  }

  bot.answerCallbackQuery(query.id);
});

function askForLanguage(chatId, code) {
  bot.sendMessage(chatId, '🌐 Choose a target language:', {
    reply_markup: {
      keyboard: [['Python', 'JavaScript'], ['C', 'C++'], ['C#', 'PHP']],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });

  bot.once('message', async (langMsg) => {
    const targetLanguage = langMsg.text;
    console.log(`[${new Date().toISOString()}] 🌐 Language selected: ${targetLanguage}`);
    startTranslation(chatId, code, targetLanguage);
  });
}

async function startTranslation(chatId, javaCode, targetLanguage) {
  const sessionId = `translate-${Date.now()}`;
  try {
    const { result } = await runTimerUntilDone(
      chatId,
      '🔁 Translating...',
      '✅ Translated!',
      async () => {
        return await axios.post(`${BACKEND_URL}/translate`, {
          javaCode,
          targetLanguage
        });
      }
    );

    let translatedCode = result.data?.translatedCode;
    if (Array.isArray(translatedCode)) {
      translatedCode = translatedCode.join('\n');
    }

    if (!translatedCode || typeof translatedCode !== 'string') {
      return bot.sendMessage(chatId, '⚠️ Invalid translation received.');
    }

    await logBotEvent(sessionId, {
      chatId,
      action: 'translate',
      result: 'success',
      language: targetLanguage
    });

    bot.sendMessage(chatId, `📄 *Translated Code:*\n\`\`\`\n${translatedCode.trim()}\n\`\`\``, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    await logBotEvent(sessionId, {
      chatId,
      action: 'translate',
      result: 'error',
      language: targetLanguage,
      error: err.message
    });
    bot.sendMessage(chatId, '❌ Failed to translate. Please try again.');
  }
}
