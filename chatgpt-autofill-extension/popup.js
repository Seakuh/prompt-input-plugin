const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");
const uiThemeSelect = document.getElementById("uiTheme");
const saveBtn = document.getElementById("saveBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const statusEl = document.getElementById("status");
const historyList = document.getElementById("historyList");

init();

saveBtn.addEventListener("click", saveSettings);
clearHistoryBtn.addEventListener("click", clearHistory);
uiThemeSelect.addEventListener("change", applySelectedTheme);

async function init() {
  const { apiKey, model, uiTheme } = await chrome.storage.sync.get({
    apiKey: "",
    model: "gpt-4.1",
    uiTheme: "system"
  });

  apiKeyInput.value = apiKey;
  modelSelect.value = model;
  uiThemeSelect.value = uiTheme;
  applyTheme(uiTheme);
  await renderHistory();
}

async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  const uiTheme = uiThemeSelect.value;

  await chrome.storage.sync.set({ apiKey, model, uiTheme });
  applyTheme(uiTheme);
  setStatus("Gespeichert.");
}

async function clearHistory() {
  await chrome.storage.local.set({ promptHistory: [] });
  await renderHistory();
  setStatus("History geleert.");
}

async function renderHistory() {
  const { promptHistory } = await chrome.storage.local.get({ promptHistory: [] });
  const items = Array.isArray(promptHistory) ? promptHistory : [];
  historyList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "Noch keine Prompts.";
    historyList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  }
}

function applySelectedTheme() {
  applyTheme(uiThemeSelect.value);
}

function applyTheme(theme) {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  document.body.classList.remove("dark", "light");
  document.body.classList.add(resolved);
}

function setStatus(message) {
  statusEl.textContent = message;
  setTimeout(() => {
    if (statusEl.textContent === message) statusEl.textContent = "";
  }, 1500);
}
