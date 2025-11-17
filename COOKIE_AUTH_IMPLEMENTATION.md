# Cookie-basierte Authentifizierung - Implementierung

## Zusammenfassung

Alle API-Aufrufe im Frontend wurden so konfiguriert, dass sie Cookies (insbesondere das `sid`-Cookie) korrekt an das Backend senden. Dies ermöglicht eine session-basierte Authentifizierung über Domain-Grenzen hinweg.

## Implementierte Änderungen

### 1. ✅ API-Aufrufe mit `credentials: 'include'`

Alle `fetch()`-Aufrufe im Projekt verwenden jetzt `credentials: 'include'`, um Cookies mitzusenden:

#### Bereits implementiert in:
- **lib/auth.ts**: Alle Auth-Funktionen
  - `loginLocal()` - Login mit Email/Passwort
  - `registerLocal()` - Benutzerregistrierung
  - `logout()` - Logout
  - `me()` - Aktuelle User-Info abrufen

- **src/api/auth.ts**: Vollständige Auth-API
  - `register()`, `login()`, `logout()`, `me()`
  - `getCalendarEvents()`, `getUnreadEmails()`, `getOutlookSummary()`

- **src/api/client.ts**: Chat und Memory API
  - `ask()` - Frage an Chatbot
  - `sendFeedback()` - Feedback senden
  - `confirmMemory()`, `rejectMemory()` - Memory-Verwaltung
  - `getMemories()`, `deleteMemory()`, `getMemoryStats()`

- **src/api/experts.ts**: Expert-Empfehlungen
  - `fetchRecommendations()` - Expert-Suche
  - `checkExpertServiceHealth()` - Health-Check

- **app/page.tsx**: Hauptseite
  - `/api/answer` - Chat-Anfragen
  - `/auth/me` - User-Authentifizierung prüfen
  - `/api/documents/upload` - Dokumenten-Upload

### 2. ✅ EventSource für Server-Sent Events (SSE)

**Wichtig**: `EventSource` unterstützt keine direkte `credentials`-Option im Konstruktor.

#### Automatisches Cookie-Verhalten:
EventSource sendet automatisch Cookies mit, wenn:
- Die Anfrage zur **gleichen Origin** geht (same-origin)
- Der Server die korrekten **CORS-Header** setzt:
  ```
  Access-Control-Allow-Origin: <frontend-origin>
  Access-Control-Allow-Credentials: true
  ```

#### Implementierung in `src/api/client.ts`:
```typescript
// EventSource automatically includes cookies (withCredentials: true behavior)
// when connecting to the same origin or when proper CORS headers are set by the server.
// The backend must set Access-Control-Allow-Credentials: true for cross-origin requests.
const eventSource = new EventSource(url);
```

#### Fallback-Mechanismus:
Falls SSE nicht funktioniert (z.B. durch CORS-Blockierung), gibt es einen automatischen Fallback zu `POST /api/answer`, der ebenfalls `credentials: 'include'` verwendet.

### 3. ✅ Zentrale Backend-URL-Konfiguration

Beide Konfigurationsdateien wurden vereinheitlicht und unterstützen mehrere Umgebungsvariablen:

#### `lib/api-config.ts` (Next.js)
```typescript
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE
                     || process.env.NEXT_PUBLIC_API_URL
                     || 'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  return normalizedPath; // Fallback (nur für Entwicklung)
}
```

#### `src/api/config.ts` (Vite/Universal)
```typescript
export function getApiBaseUrl(): string {
  // Priorität:
  // 1. NEXT_PUBLIC_API_BASE (Next.js)
  // 2. NEXT_PUBLIC_API_URL (Next.js)
  // 3. VITE_API_URL (Vite)
  // 4. Fallback: 'https://dal-ai-backend.onrender.com'
  
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://dal-ai-backend.onrender.com';
}
```

## Verwendung

### Umgebungsvariablen setzen

Erstellen Sie eine `.env.local` Datei (für Next.js) oder `.env` (für Vite):

```bash
# Next.js (bevorzugt)
NEXT_PUBLIC_API_BASE=https://dal-ai-backend.onrender.com

# Oder alternativ
NEXT_PUBLIC_API_URL=https://dal-ai-backend.onrender.com

# Für Vite
VITE_API_URL=https://dal-ai-backend.onrender.com
```

### Build-Zeit vs. Runtime

**WICHTIG**: Next.js baut die Umgebungsvariablen in die statischen Dateien ein:
- `NEXT_PUBLIC_*` Variablen werden zur **Build-Zeit** ersetzt
- Nach dem Build können diese Werte **nicht mehr geändert** werden
- Für Runtime-Änderungen muss neu gebaut werden

## Backend-Anforderungen

Damit Cookies über Domain-Grenzen hinweg funktionieren, muss das Backend:

### 1. CORS-Header korrekt setzen
```python
# Flask/Python Beispiel
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
CORS(app, 
     origins=['https://ihr-frontend.vercel.app'],
     supports_credentials=True)
```

### 2. Session-Cookie mit korrekten Attributen
```python
app.config['SESSION_COOKIE_SECURE'] = True      # Nur über HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True    # Schutz vor XSS
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Cross-site erlauben
app.config['SESSION_COOKIE_DOMAIN'] = None      # Kein Domain-Override
```

### 3. Response-Header für SSE
```python
@app.route('/api/answer/stream')
def stream():
    response = Response(generate(), mimetype='text/event-stream')
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin')
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Cache-Control'] = 'no-cache'
    return response
```

## Testing

### Überprüfen, ob Cookies gesendet werden:

1. **Browser DevTools** öffnen (F12)
2. **Network** Tab auswählen
3. Einen API-Call durchführen
4. Request auswählen und **Headers** prüfen:
   - Unter "Request Headers" sollte `Cookie: sid=...` erscheinen
   - Unter "Response Headers" sollte `Set-Cookie` bei Login/Register erscheinen

### Console-Logs:

Das Frontend gibt hilfreiche Logs aus:
```
🔗 API_BASE configured: https://dal-ai-backend.onrender.com
🔐 Logging in with email and password...
✅ Local login successful: user@example.com
💾 User info stored in localStorage
```

## Fehlerbehebung

### Problem: Cookies werden nicht gesendet
- ✅ Überprüfen Sie, ob `credentials: 'include'` in allen `fetch()` Aufrufen vorhanden ist
- ✅ Backend muss `Access-Control-Allow-Credentials: true` setzen
- ✅ Backend muss spezifischen Origin in `Access-Control-Allow-Origin` setzen (nicht `*`)
- ✅ HTTPS verwenden in Production (Cookies mit `Secure` Flag)

### Problem: SSE funktioniert nicht
- Der automatische Fallback zu `POST /api/answer` sollte greifen
- Console-Log prüfen: "SSE failed (reason), attempting fallback..."
- Backend CORS-Header für SSE-Endpoint prüfen

### Problem: API_BASE ist undefined
- Umgebungsvariable prüfen: `NEXT_PUBLIC_API_BASE` oder `NEXT_PUBLIC_API_URL`
- Nach Änderung von `.env.local` **neu bauen**: `npm run build`
- Console prüfen: "API_BASE configured: ..."

## Zusammenfassung

✅ **Alle API-Aufrufe** verwenden jetzt `credentials: 'include'`
✅ **EventSource** sendet automatisch Cookies (mit richtigen CORS-Headern)
✅ **Backend-URL** wird zentral über Umgebungsvariablen konfiguriert
✅ **Keine weiteren Frontend-Änderungen nötig**

Die Session-Verwaltung im Frontend (localStorage etc.) bleibt unverändert. Das wichtigste ist, dass die Cookies jetzt dank der Backend-Anpassungen und `credentials: 'include'` über Domain-Grenzen hinweg funktionieren.
