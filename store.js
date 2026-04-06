const fs = require("fs");
const path = require("path");
const os = require("os");

const DB_DIR = path.join(os.tmpdir(), "sber-bot");
const DB_FILE = path.join(DB_DIR, "db.json");

let db = { sessions: {}, blocked: {} };
let loaded = false;

function load() {
  if (loaded) return;
  try {
    if (fs.existsSync(DB_FILE)) {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch {
    db = { sessions: {}, blocked: {} };
  }
  loaded = true;
}

function save() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

function getSession(userId) {
  load();
  return db.sessions[String(userId)] || null;
}

function setSession(userId, session) {
  load();
  db.sessions[String(userId)] = session;
  save();
}

function isBlocked(userId) {
  load();
  return !!db.blocked[String(userId)];
}

function blockUser(userId) {
  load();
  db.blocked[String(userId)] = true;
  save();
}

module.exports = { getSession, setSession, isBlocked, blockUser };
