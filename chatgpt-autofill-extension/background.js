const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "GENERATE_TEXT") return;

  handleGenerateText(message)
    .then((text) => sendResponse({ ok: true, text }))
    .catch((error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      sendResponse({ ok: false, error: errorMessage });
    });

  return true;
});

async function handleGenerateText(message) {
  const userPrompt = (message.prompt || "").trim();
  const pageHint = (message.pageHint || "").trim();

  if (!userPrompt) {
    throw new Error("Prompt ist leer.");
  }

  const { apiKey, model } = await chrome.storage.sync.get({
    apiKey: "",
    model: "gpt-4.1"
  });

  if (!apiKey) {
    throw new Error("Bitte zuerst API-Key im Erweiterungs-Popup speichern.");
  }

  await addPromptToHistory(userPrompt);
  return generateTextWithOpenAI({ apiKey, model, userPrompt, pageHint });
}

async function addPromptToHistory(prompt) {
  const { promptHistory } = await chrome.storage.local.get({ promptHistory: [] });
  const list = Array.isArray(promptHistory) ? promptHistory : [];
  const deduped = [prompt, ...list.filter((item) => item !== prompt)].slice(0, 20);
  await chrome.storage.local.set({ promptHistory: deduped });
}

async function generateTextWithOpenAI({ apiKey, model, userPrompt, pageHint }) {
  const systemMessage = [
    "Du bist ein Assistent fuer Formularfelder.",
    "Erzeuge einen direkt nutzbaren, korrekten Endtext basierend auf dem Prompt.",
    "WICHTIG:",
    "- Antworte nur mit dem finalen Feldinhalt.",
    "- Keine Einleitung, keine Erklaerung, keine Markdown-Formatierung.",
    "- Keine Anfuehrungszeichen um die gesamte Antwort setzen.",
    "- Wenn der Prompt unklar ist, liefere die wahrscheinlich sinnvollste, kurze Standardvariante.",
    "- Der Text muss grammatikalisch korrekt und ausfuehrbar im Kontext des Formularfeldes sein."
  ].join("\n");

  const userMessage = pageHint
    ? `Feld-Kontext: ${pageHint}\n\nPrompt: ${userPrompt}`
    : `Prompt: ${userPrompt}`;

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error("Keine Antwort von ChatGPT erhalten.");
  return text;
}
