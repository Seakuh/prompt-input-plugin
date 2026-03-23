# LLM Best Practices fuer perfekte Antworten

Diese Datei beschreibt, was ein LLM braucht, um moeglichst gute, korrekte und direkt nutzbare Antworten zu liefern - speziell fuer Formular-Generierung.

## 1) Klare Aufgabe (Intent)

Das Modell braucht eine eindeutige Rolle und ein klares Ziel.

- Rolle: "Du bist ein Assistent fuer Formularfelder."
- Ziel: "Erzeuge direkt nutzbaren Endtext."
- Erfolgskriterium: "Antwort muss ohne Nachbearbeitung in das Feld passen."

## 2) Genug Kontext (aber kompakt)

Das Modell liefert bessere Ergebnisse, wenn Kontext zum Feld vorhanden ist:

- Feldname (`name`)
- Feld-ID (`id`)
- Label-Text
- Placeholder
- Seitentyp/Use Case (z. B. Bewerbung, Support, Produktbeschreibung)

Regel: Nur relevante Infos senden, kein unnoetiger Ballast.

## 3) Strikte Ausgabe-Regeln

Die wichtigste Stellschraube ist das Output-Format.

- Nur finaler Feldinhalt
- Keine Erklaerungen
- Kein Markdown
- Keine Aufzaehlungen, wenn nicht explizit gewuenscht
- Keine Anfuehrungszeichen um die ganze Antwort

Wenn moeglich: Laengenlimit definieren (z. B. "max. 300 Zeichen").

## 4) Qualitaetskriterien explizit nennen

Das Modell sollte wissen, wie "gut" aussieht:

- grammatikalisch korrekt
- inhaltlich konsistent
- zum Feld passend (Ton + Zweck)
- faktenarm/faktensicher bei unsicherer Datenlage
- keine Halluzinationen ueber konkrete Daten

## 5) Gute Prompt-Struktur

Empfohlene Reihenfolge:

1. Rolle
2. Aufgabe
3. Kontext
4. Regeln (Do/Don't)
5. Ausgabeformat

Kurz, praezise, testbar.

## 6) Beispiele verbessern die Treffgenauigkeit

Wenn moeglich 1-2 Mini-Beispiele geben:

- Input-Beispiel (Prompt + Kontext)
- Gewuenschtes Output-Beispiel

Wichtig: Beispiele sollten exakt den echten Anwendungsfall spiegeln.

## 7) Modellwahl und Parameter

- Fuer hohe Qualitaet: groesseres Modell nutzen (z. B. `gpt-4.1`)
- `temperature` niedrig bis mittel halten:
  - 0.2-0.5 fuer stabile, praezise Texte
  - 0.6-0.8 fuer kreativere Texte
- Bei Formularfeldern meist besser: stabil statt kreativ

## 8) Umgang mit unklaren Eingaben

Definiere Fallback-Verhalten:

- Wenn Prompt unklar: kurze, sinnvolle Standardantwort
- Keine Rueckfragen im Output (wenn Feld direkt befuellt werden soll)
- Lieber neutral und korrekt als spekulativ

## 9) Sicherheit und Datenschutz

- Keine sensiblen Daten unnoetig an das Modell senden
- API-Key nur in sicherem Storage halten
- Nutzerdaten minimieren (Data Minimization)

## 10) Iteratives Feintuning in der Praxis

Vorgehen fuer "beste Antworten":

1. 10 reale Testfaelle sammeln
2. Output pro Fall bewerten (Passgenauigkeit, Qualitaet, Laenge)
3. System-Regeln nachschaerfen
4. erneut testen
5. Versionieren (was geaendert wurde, warum es besser ist)

---

## Sofort nutzbare Vorlage (System Message)

```text
Du bist ein Assistent fuer Formularfelder.
Erzeuge einen direkt nutzbaren, korrekten Endtext basierend auf dem Prompt.

WICHTIG:
- Antworte nur mit dem finalen Feldinhalt.
- Keine Einleitung, keine Erklaerung, keine Markdown-Formatierung.
- Keine Anfuehrungszeichen um die gesamte Antwort setzen.
- Wenn der Prompt unklar ist, liefere die wahrscheinlich sinnvollste, kurze Standardvariante.
- Der Text muss grammatikalisch korrekt und passend zum Feldkontext sein.
```

## Sofort nutzbare Vorlage (User Message)

```text
Feld-Kontext: <Label/Name/Placeholder>
Prompt: <Nutzerinhalt aus dem Feld>
Optionales Laengenlimit: <z. B. max. 300 Zeichen>
Ton: <z. B. professionell, freundlich, neutral>
Sprache: <z. B. Deutsch>
```

Mit dieser Struktur werden Antworten konsistenter, verwertbarer und deutlich naeher am gewuenschten Ergebnis.
