const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
  pollingOptions: {
    interval: 1000, 
    timeout: 30, 
  },
});
const userState = {}; 

let pollingErrorCount = 0;
const max_SOLID = 5;

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message, error.stack);
  pollingErrorCount++;

  if (pollingErrorCount >= maxRetries) {
    console.error('Max polling retries reached. Stopping bot.');
    process.exit(1); 
  }

  const delay = Math.min(1000 * Math.pow(2, pollingErrorCount), 30000); 
  console.log(`Retrying polling in ${delay / 1000} seconds... (Attempt ${pollingErrorCount + 1}/${maxRetries})`);
  setTimeout(() => {
    bot.startPolling();
  }, delay);
});

bot.on('message', () => {
  pollingErrorCount = 0; 
});

function isValidJavaCode(text) {
  const javaPatterns = [
    /public\s+class\s+\w+/,
    /public\s+static\s+void\s+main\s*\(/,
    /System\.out\.print(ln)?\s*\(/,
    /import\s+java\./,
  ];
  return javaPatterns.some((pattern) => pattern.test(text.trim()));
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log('Start command from:', chatId);
  bot.sendMessage(chatId, '👋 Welcome to Codemorpher Bot!\nPaste your Java code to translate.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) return;

  console.log('Message received:', text, 'from:', chatId);

  if (userState[chatId]?.waitingForAck) {
    return bot.sendMessage(chatId, 'Please confirm: Do you want to translate another code?');
  }

  if (isValidJavaCode(text)) {
    userState[chatId] = { javaCode: text, waitingForAck: false };
    return bot.sendMessage(chatId, '✅ Java code received. Choose a target language:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'JavaScript', callback_data: 'lang_javascript' },
            { text: 'Python', callback_data: 'lang_python' },
            { text: 'C', callback_data: 'lang_c' },
          ],
          [
            { text: 'C#', callback_data: 'lang_csharp' },
            { text: 'C++', callback_data: 'lang_cpp' },
            { text: 'PHP', callback_data: 'lang_php' },
          ],
        ],
      },
    });
  }

  return bot.sendMessage(chatId, '⚠️ That doesn’t look like valid Java code. Please paste a complete Java program.');
});

bot.on('callback_query', async (callback) => {
  const chatId = callback.message.chat.id;
  const data = callback.data;

  console.log('Callback received:', data, 'from:', chatId);

  const languageMap = {
    lang_javascript: 'javascript',
    lang_python: 'python',
    lang_c: 'c',
    lang_csharp: 'csharp',
    lang_cpp: 'cpp',
    lang_php: 'php',
  };

  if (data.startsWith('lang_')) {
    if (!userState[chatId]?.javaCode || userState[chatId]?.waitingForAck) {
      bot.answerCallbackQuery(callback.id);
      return bot.sendMessage(chatId, '❗ Please send Java code first or complete the previous translation.');
    }

    const targetLang = languageMap[data];
    if (!targetLang) {
      bot.answerCallbackQuery(callback.id);
      return bot.sendMessage(chatId, '❌ Invalid language selected.');
    }

    bot.answerCallbackQuery(callback.id, { text: `Translating to ${targetLang}... Please wait!` });
    await bot.sendChatAction(chatId, 'typing'); 
    await bot.sendMessage(chatId, 'Translating...');

    try {
      const headers = process.env.BACKEND_API_KEY
        ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const res = await axios.post(
        `${process.env.BACKEND_URL}/translate`,
        {
          javaCode: userState[chatId].javaCode,
          targetLanguage: targetLang,
        },
        { headers }
      );

      console.log('Backend response:', res.data); 
      const { translatedCode, fallback } = res.data;

      if (fallback) {
        const formattedCode = Array.isArray(translatedCode) ? translatedCode.join('\n') : translatedCode;
        await bot.sendMessage(chatId, `⚠️ Translation incomplete:\n\`\`\`${targetLang}\n${formattedCode}\n\`\`\``, {
          parse_mode: 'Markdown',
        });
        await bot.sendMessage(chatId, '❌ Translation failed due to backend error.');
        delete userState[chatId]; 
        return;
      }

      const formattedCode = Array.isArray(translatedCode) ? translatedCode.join('\n') : translatedCode;

      await bot.sendMessage(chatId, `🧾 Translated ${targetLang.toUpperCase()} Code:\n\`\`\`${targetLang}\n${formattedCode}\n\`\`\``, {
        parse_mode: 'Markdown',
      });

      userState[chatId].waitingForAck = true;

      await bot.sendMessage(chatId, 'Do you want to translate another code?', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Yes', callback_data: 'ack_yes' },
              { text: 'No', callback_data: 'ack_no' },
            ],
          ],
        },
      });

      await bot.sendMessage(chatId, 'Waiting for your response...');
    } catch (err) {
      console.error('Translation error:', err.response?.data || err.message);
      const errorMsg = err.response?.status === 401
        ? '❌ Authentication failed. Please contact the bot admin.'
        : `❌ Translation failed: ${err.response?.data?.error?.message || err.message}`;
      await bot.sendMessage(chatId, errorMsg);
      delete userState[chatId]; 
      return bot.answerCallbackQuery(callback.id);
    }
  }

  if (data === 'ack_yes') {
    bot.answerCallbackQuery(callback.id, { text: 'Great! Let’s translate another code.' });
    userState[chatId] = {}; 
    await bot.sendMessage(chatId, 'Please send the next Java code to translate.');
  }

  if (data === 'ack_no') {
    bot.answerCallbackQuery(callback.id, { text: 'Goodbye!' });
    userState[chatId] = {}; 
    await bot.sendMessage(chatId, 'Thank you for using Codemorpher Bot! Use /start to begin again.');
  }

  bot.answerCallbackQuery(callback.id);
});

console.log('Bot started...');