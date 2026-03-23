# ChatGPT Autofill Extension

Chrome-Erweiterung (Manifest V3):

1. In ein Textfeld klicken (`input`, `textarea`, `contenteditable`)
2. Ein blau-weisser Pill-Button **Generate** erscheint am Feld
3. Text im Feld wird als Prompt an OpenAI geschickt
4. Die Antwort wird automatisch wieder in das Feld eingesetzt

## Installation

1. `chrome://extensions` oeffnen
2. **Entwicklermodus** aktivieren
3. **Entpackte Erweiterung laden** klicken
4. Ordner `chatgpt-autofill-extension` auswaehlen

## API-Key und Theme setzen

1. Auf das Erweiterungs-Icon klicken
2. Im Popup OpenAI API-Key, Modell und Theme (System/Dark/Light) setzen
3. Speichern

## Hinweise

- API-Key, Modell und Theme werden in `chrome.storage.sync` gespeichert.
- Prompt-History wird in `chrome.storage.local` gespeichert (max. 20 Eintraege).
- Manche Web-Apps ueberschreiben Feldwerte aktiv; in dem Fall Feld erneut fokussieren und `Generate` erneut klicken.
