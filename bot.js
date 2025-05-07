require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { logBotEvent } = require('./firebase/logService.js');

const app = express();
app.use(express.json()); 

const {
  BOT_TOKEN,
  BACKEND_URL,
  PORT = 3000,
  RENDER_EXTERNAL_URL,
  OPENROUTER_API_KEY,
} = process.env;

if (!BOT_TOKEN || !BACKEND_URL || !RENDER_EXTERNAL_URL || !OPENROUTER_API_KEY) {
  console.error('❌ BOT_TOKEN, BACKEND_URL, RENDER_EXTERNAL_URL, or OPENROUTER_API_KEY not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN);
const webhookPath = `/bot${BOT_TOKEN}`;
bot.setWebHook(`${RENDER_EXTERNAL_URL}${webhookPath}`);
console.log(`✅ Webhook set at ${RENDER_EXTERNAL_URL}${webhookPath}`);

const uploadWaitingUsers = new Map();
const lastExtractedCode = new Map();
const translationWaitingUsers = new Map();
const activeCountdowns = new Map();

app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
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
        message_id: messageId,
      }).catch(() => {});
    }
  }, 1000);

  try {
    const result = await asyncFn();
    done = true;
    clearInterval(interval);
    await bot.editMessageText(`${endText} (${seconds}s)`, {
      chat_id: chatId,
      message_id: messageId,
    });
    return { result, seconds };
  } catch (err) {
    done = true;
    clearInterval(interval);
    await bot.editMessageText(`❌ Failed after ${seconds}s`, {
      chat_id: chatId,
      message_id: messageId,
    });
    throw err;
  }
}

async function sendStartMessage(chatId, bot, logBotEvent) {
  const sessionId = `context-message-${Date.now()}`;
  try {
    if (activeCountdowns.has(chatId)) {
      console.log(`Skipped new countdown for chat ${chatId}; countdown already active`);
      return;
    }

    await logBotEvent(sessionId, {
      chatId,
      action: 'start_countdown',
      result: 'initiated',
    });

    const sent = await bot.sendMessage(chatId, `⏳ Feature reminder in 15 seconds...`);
    const messageId = sent.message_id;
    activeCountdowns.set(chatId, { messageId, sessionId });

    let seconds = 15;
    let done = false;

    const interval = setInterval(async () => {
      if (!done) {
        seconds--;
        if (seconds > 0) {
          try {
            await bot.editMessageText(`⏳ Feature reminder in ${seconds} seconds...`, {
              chat_id: chatId,
              message_id: messageId,
            });
          } catch (err) {
            console.error(`Failed to update countdown for chat ${chatId}:`, err.message);
            await logBotEvent(sessionId, {
              chatId,
              action: 'update_countdown',
              result: 'error',
              error: err.message,
            });
          }
        } else {
          done = true;
          clearInterval(interval);
          activeCountdowns.delete(chatId);
          try {
            await bot.editMessageText(
              `Cooldown Period Completed ✅`,
              { chat_id: chatId, message_id: messageId }
            );

            await bot.sendMessage(
              chatId,
              `Now You can:  \n🔁 Use /translate to convert Java code to another language.  \n🖼️ Use /upload to extract Java code from an image.`,
              { parse_mode: 'Markdown' }
            );

            await logBotEvent(sessionId, {
              chatId,
              action: 'send_context_message',
              result: 'success',
            });
          } catch (err) {
            console.error(`Failed to send context messages for chat ${chatId}:`, err.message);
            await logBotEvent(sessionId, {
              chatId,
              action: 'send_context_message',
              result: 'error',
              error: err.message,
            });
          }
        }
      }
    }, 1000);

    setTimeout(() => {
      if (!done) {
        done = true;
        clearInterval(interval);
        activeCountdowns.delete(chatId);
      }
    }, 16000);
  } catch (err) {
    console.error(`Failed to initiate countdown for chat ${chatId}:`, err.message);
    activeCountdowns.delete(chatId);
    await logBotEvent(sessionId, {
      chatId,
      action: 'start_countdown',
      result: 'error',
      error: err.message,
    });
  }
}

async function validateJavaCode(chatId, code, logBotEvent) {
  const sessionId = `validate-java-${Date.now()}`;
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-maverick:free',
        messages: [
          {
            role: 'system',
            content: 'You are a code detection assistant. Determine if the following text is Java code. Respond with "Yes, this is Java code" if it is, or "No, this is not Java code" if it isn’t.',
          },
          {
            role: 'user',
            content: code,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': RENDER_EXTERNAL_URL,
          'X-Title': 'Codemorpher Bot',
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.choices[0].message.content;
    await logBotEvent(sessionId, {
      chatId,
      action: 'validate_java_code',
      result: 'success',
      response: result,
    });

    return result.includes('Yes, this is Java code');
  } catch (err) {
    console.error(`Failed to validate Java code for chat ${chatId}:`, err.message);
    await logBotEvent(sessionId, {
      chatId,
      action: 'validate_java_code',
      result: 'error',
      error: err.message,
    });

    const hasClass = /\bclass\b/i.test(code);
    const hasBraces = /\{.*\}/.test(code);
    return hasClass && hasBraces;
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const type = msg.photo
    ? 'photo'
    : msg.document?.mime_type?.startsWith('image/')
    ? 'image document'
    : 'text';

  if (msg.text === '/start' || msg.text === '/help') {
    return bot.sendMessage(
      chatId,
      `👋 Welcome to Codemorpher Bot!\n\nYou can:\n🔁 Use /translate to convert Java code to another language.\n🖼️ Use /upload to extract Java code from an image.`
    );
  }

  if (msg.text === '/upload') {
    uploadWaitingUsers.set(chatId, true);
    return bot.sendMessage(chatId, '📤 Please send an image with Java code.');
  }

  if (msg.text === '/translate') {
    translationWaitingUsers.set(chatId, { waiting: true, source: 'direct' });
    return bot.sendMessage(
      chatId,
      '📝 Please send your *Java code*. For example:\n```\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello!");\n    }\n}\n```',
      { parse_mode: 'Markdown' }
    );
  }

  if (translationWaitingUsers.has(chatId) && msg.text && !msg.text.startsWith('/')) {
    const userState = translationWaitingUsers.get(chatId);
    const userInput = msg.text.trim();

    if (userState.source === 'upload') {
      translationWaitingUsers.delete(chatId);
      return askForLanguage(chatId, userInput);
    }

    const checkingMessage = await bot.sendMessage(chatId, '⏳ Checking your code...');
    const isJava = await validateJavaCode(chatId, userInput, logBotEvent);

    await bot.deleteMessage(chatId, checkingMessage.message_id);

    if (!isJava) {
      return bot.sendMessage(
        chatId,
        '⚠️ That doesn\'t look like Java code. Please send valid Java code to translate!'
      );
    }

    translationWaitingUsers.delete(chatId);
    return askForLanguage(chatId, userInput);
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
            headers: form.getHeaders(),
          });
        }
      );

      fs.unlink(localPath, () => {});
      const { javaCode, error, extractedText } = result.data;
      const sessionId = `upload-${Date.now()}`;

      // Always display extractedText if present
      if (extractedText && !javaCode && !error) {
        // Case: No text in image (e.g., "There is no text in the image...")
        await logBotEvent(sessionId, {
          chatId,
          action: 'image_upload',
          result: 'no_text',
          image: 'photo',
          language: 'N/A',
        });
        return bot.sendMessage(chatId, `ℹ️ ${extractedText}`);
      }

      if (error || !javaCode) {
        await logBotEvent(sessionId, {
          chatId,
          action: 'image_upload',
          result: 'error',
          image: 'photo',
          language: 'N/A',
          error: error || 'No Java code detected',
        });
        return bot.sendMessage(
          chatId,
          `⚠️ No Java code detected.\nExtracted Text:\n${extractedText || 'None'}`
        );
      }

      lastExtractedCode.set(chatId, javaCode);
      await bot.sendMessage(chatId, `✅ Extracted Java code:\n\`\`\`\n${javaCode.trim()}\n\`\`\``, {
        parse_mode: 'Markdown',
      });

      await logBotEvent(sessionId, {
        chatId,
        action: 'image_upload',
        result: 'success',
        image: 'photo',
        language: 'N/A',
      });

      if (
        javaCode.toLowerCase().includes('there is no text') ||
        javaCode.toLowerCase().includes('i cannot return any text')
      ) return;

      await bot.sendMessage(chatId, '❓ Would you like to translate this code?', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Translate', callback_data: 'translate_last' }]],
        },
      });

    } catch (err) {
      await logBotEvent(`upload-${Date.now()}`, {
        chatId,
        action: 'image_upload',
        result: 'error',
        image: 'photo',
        language: 'N/A',
        error: err.message,
      });
      bot.sendMessage(chatId, `❌ Failed to process the image: ${err.message}`);
    }
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
    translationWaitingUsers.set(chatId, { waiting: true, source: 'upload' });
    return askForLanguage(chatId, code);
  }

  bot.answerCallbackQuery(query.id);
});

function askForLanguage(chatId, code) {
  return new Promise((resolve) => {
    bot.sendMessage(chatId, '🌐 Choose a target language:', {
      reply_markup: {
        keyboard: [['Python', 'JavaScript'], ['C', 'C++'], ['C#', 'PHP']],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });

    bot.once('message', async (langMsg) => {
      const targetLanguage = langMsg.text;
      await startTranslation(chatId, code, targetLanguage);
      resolve();
    });
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
          targetLanguage,
        });
      }
    );

    let translatedCode = result.data?.translatedCode;
    if (Array.isArray(translatedCode)) {
      translatedCode = translatedCode.join('\n');
    }

    if (!translatedCode || typeof translatedCode !== 'string') {
      await bot.sendMessage(chatId, '⚠️ Invalid translation received.');
      return;
    }

    await logBotEvent(sessionId, {
      chatId,
      action: 'translate',
      result: 'success',
      language: targetLanguage,
    });

    await bot.sendMessage(chatId, `📄 *Translated Code:*\n\`\`\`\n${translatedCode.trim()}\n\`\`\``, {
      parse_mode: 'Markdown',
    });

    await sendStartMessage(chatId, bot, logBotEvent);
  } catch (err) {
    await logBotEvent(sessionId, {
      chatId,
      action: 'translate',
      result: 'error',
      language: 'N/A',
      error: err.message,
    });
    await bot.sendMessage(chatId, '❌ Failed to translate. Please try again.');
    await sendStartMessage(chatId, bot, logBotEvent);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});