let activeField = null;
let generateButton = null;
let isGenerating = false;

document.addEventListener("focusin", handleFieldActivate, true);
document.addEventListener("click", handleFieldActivate, true);
document.addEventListener("scroll", () => placeButton(), true);
window.addEventListener("resize", () => placeButton());

document.addEventListener("click", (event) => {
  const target = event.target;
  if (
    generateButton &&
    target instanceof Node &&
    !generateButton.contains(target) &&
    target !== activeField &&
    !(target instanceof HTMLElement && activeField instanceof HTMLElement && activeField.contains(target))
  ) {
    hideButton();
  }
}, true);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SHOW_NOTIFICATION") {
    showToast(message.message || "Hinweis");
    sendResponse({ ok: true });
  }
});

function handleFieldActivate(event) {
  const target = event.target;
  if (!isEditable(target)) return;

  activeField = target;
  showButton();
}

function showButton() {
  if (!activeField || !isEditable(activeField)) return;
  if (!generateButton) {
    generateButton = document.createElement("button");
    generateButton.type = "button";
    generateButton.textContent = "Generate";
    generateButton.style.position = "fixed";
    generateButton.style.zIndex = "2147483647";
    generateButton.style.border = "1px solid #7ed0ff";
    generateButton.style.borderRadius = "999px";
    generateButton.style.padding = "8px 14px";
    generateButton.style.fontSize = "12px";
    generateButton.style.fontWeight = "700";
    generateButton.style.cursor = "pointer";
    generateButton.style.background = "linear-gradient(180deg, #ffffff, #f2fbff)";
    generateButton.style.color = "#0b3e5f";
    generateButton.style.boxShadow = "0 10px 26px rgba(0,0,0,0.22), 0 0 0 2px rgba(126,208,255,0.35)";
    generateButton.style.backdropFilter = "blur(3px)";
    generateButton.addEventListener("mousedown", (event) => event.preventDefault());
    generateButton.addEventListener("click", () => generateForActiveField());
    document.documentElement.appendChild(generateButton);
  }
  placeButton();
}

function placeButton() {
  if (!generateButton || !activeField || !isEditable(activeField)) return;

  const rect = activeField.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    hideButton();
    return;
  }

  const top = Math.max(8, rect.top - 40);
  const left = Math.min(window.innerWidth - 110, Math.max(8, rect.right - 98));
  generateButton.style.top = `${top}px`;
  generateButton.style.left = `${left}px`;
}

function hideButton() {
  if (isGenerating) return;
  if (generateButton) {
    generateButton.remove();
    generateButton = null;
  }
  activeField = null;
}

async function generateForActiveField() {
  if (!activeField || !isEditable(activeField)) {
    showToast("Kein aktives Eingabefeld gefunden.");
    return;
  }
  if (isGenerating) return;

  const prompt = getFieldText(activeField).trim();
  if (!prompt) {
    showToast("Bitte zuerst Text als Prompt in das Feld eingeben.");
    return;
  }

  isGenerating = true;
  const previousText = generateButton ? generateButton.textContent : "Generate";
  if (generateButton) {
    generateButton.textContent = "Generating...";
    generateButton.disabled = true;
    generateButton.style.opacity = "0.7";
  }

  try {
    const response = await sendRuntimeMessage({
      type: "GENERATE_TEXT",
      prompt,
      pageHint: createFieldHint(activeField)
    });

    if (!response?.ok || !response.text) {
      throw new Error(response?.error || "Unbekannter Fehler");
    }

    applyText(activeField, response.text);
    showToast("Feld mit ChatGPT-Antwort gefuellt.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showToast(`Fehler: ${message}`);
  } finally {
    isGenerating = false;
    if (generateButton) {
      generateButton.textContent = previousText || "Generate";
      generateButton.disabled = false;
      generateButton.style.opacity = "1";
    }
    placeButton();
  }
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

function getFieldText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value || "";
  }
  if (element instanceof HTMLElement && element.isContentEditable) {
    return element.textContent || "";
  }
  return "";
}

function isEditable(element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;
  if (element.tagName === "TEXTAREA") return true;
  if (element.tagName !== "INPUT") return false;

  const type = (element.getAttribute("type") || "text").toLowerCase();
  const allowed = new Set(["text", "search", "url", "tel", "email", "password", "number"]);
  return allowed.has(type);
}

function applyText(element, text) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.focus();
    element.value = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (element instanceof HTMLElement && element.isContentEditable) {
    element.focus();
    element.textContent = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function createFieldHint(element) {
  if (!(element instanceof HTMLElement)) return "";
  const parts = [];
  const name = element.getAttribute("name");
  const id = element.getAttribute("id");
  const placeholder = element.getAttribute("placeholder");
  const label = getLabelText(element);
  if (label) parts.push(`Label: ${label}`);
  if (name) parts.push(`Name: ${name}`);
  if (id) parts.push(`ID: ${id}`);
  if (placeholder) parts.push(`Placeholder: ${placeholder}`);
  return parts.join(" | ");
}

function getLabelText(element) {
  if (!(element instanceof HTMLElement)) return "";
  if (element.id) {
    const label = document.querySelector(`label[for="${cssEscape(element.id)}"]`);
    if (label?.textContent) return normalizeWhitespace(label.textContent);
  }
  const parentLabel = element.closest("label");
  if (parentLabel?.textContent) return normalizeWhitespace(parentLabel.textContent);
  return "";
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "16px";
  toast.style.right = "16px";
  toast.style.zIndex = "2147483647";
  toast.style.background = "#111";
  toast.style.color = "#fff";
  toast.style.padding = "10px 12px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "12px";
  toast.style.maxWidth = "360px";
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
  document.documentElement.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
