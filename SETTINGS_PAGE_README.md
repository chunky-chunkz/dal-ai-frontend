# KI Einstellungen

Eine umfassende Einstellungsseite zur Konfiguration des KI-Assistenten.

## 🎨 Übersicht

```
┌─────────────────────────────────────────────────────┐
│  ⚙️ KI Einstellungen              [Zurück zum Chat] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [ 🧠 LLM ] [ 📚 RAG ] [ ⚡ Speicher ] [ 🛡️ Weitere ] │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🧠 LLM Einstellungen                         │ │
│  │  Konfigurieren Sie das Sprachmodell           │ │
│  │                                               │ │
│  │  Modell:              [Phi-3 Mini ▼]         │ │
│  │                                               │ │
│  │  Temperatur:          [====○-----] 0.20      │ │
│  │  Niedrig = präzise, Hoch = kreativ           │ │
│  │                                               │ │
│  │  Max Tokens:          [====○----------] 220  │ │
│  │  Begrenzt die Antwortlänge                   │ │
│  │                                               │ │
│  │  Streaming aktivieren        [●]             │ │
│  │  Zeigt Antworten in Echtzeit                 │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [🔄 Zurücksetzen]        [💾 Einstellungen speichern] │
└─────────────────────────────────────────────────────┘
```

## Features

### 🧠 LLM Einstellungen
- **Modellauswahl**: Wählen Sie zwischen verschiedenen Sprachmodellen (Phi-3, Llama 3, Mistral, Gemma)
- **Temperatur**: Steuern Sie die Kreativität der Antworten (0.0 - 1.0)
  - Niedrig (0.1-0.3): Präzise, fokussierte Antworten
  - Hoch (0.7-1.0): Kreative, vielfältige Antworten
- **Max Tokens**: Begrenzen Sie die Länge der Antworten (50-2000 Tokens)
- **Streaming**: Aktivieren/Deaktivieren Sie Echtzeit-Streaming der Antworten

### 📚 RAG Einstellungen (Retrieval-Augmented Generation)
- **RAG aktivieren/deaktivieren**: Nutzen Sie hochgeladene Dokumente für kontextbasierte Antworten
- **Top K Dokumente**: Anzahl der relevantesten Dokumente (1-10)
- **Ähnlichkeitsschwelle**: Minimale Ähnlichkeit für relevante Dokumente (0.3-0.95)

### ⚡ Speicher Einstellungen
- **Konversations-Speicher**: Aktivieren/Deaktivieren des Chat-Verlaufs
- **Speichertiefe**: Anzahl vorheriger Nachrichten, die berücksichtigt werden (3-20)

### 🛡️ Weitere Einstellungen
- Platzhalter für zukünftige Features

## Verwendung

1. Klicken Sie auf **"Einstellungen"** in der Navigation
2. Wählen Sie einen Tab (LLM, RAG, Speicher, Weitere)
3. Passen Sie die Einstellungen nach Ihren Wünschen an
4. Klicken Sie auf **"Einstellungen speichern"**

### Standardeinstellungen wiederherstellen

Klicken Sie auf **"Zurücksetzen"**, um alle Einstellungen auf die Standardwerte zurückzusetzen.

## Standardwerte

```typescript
{
  model: "phi3",
  temperature: 0.2,
  maxTokens: 220,
  useRAG: true,
  topK: 5,
  similarityThreshold: 0.7,
  useMemory: true,
  memoryDepth: 10,
  streamResponse: true
}
```

## Speicherung

- Einstellungen werden im **localStorage** des Browsers gespeichert
- Einstellungen bleiben nach Seitenaktualisierung erhalten
- Einstellungen sind gerätespezifisch

## Integration mit Backend

Die Einstellungen werden automatisch mit jedem API-Request an das Backend gesendet:

```typescript
fetch('/api/answer', {
  method: 'POST',
  body: JSON.stringify({ 
    question: "...",
    settings: aiSettings // <- Einstellungen werden hier übergeben
  })
})
```

Das Backend kann diese Einstellungen verwenden, um die KI-Antworten entsprechend anzupassen.

## Zukünftige Erweiterungen

- [ ] Benutzerprofile mit verschiedenen Einstellungs-Presets
- [ ] Cloud-Synchronisation der Einstellungen
- [ ] Erweiterte Guardrails-Einstellungen
- [ ] Prompt-Templates anpassen
- [ ] Debug-Modus für detaillierte Logs
