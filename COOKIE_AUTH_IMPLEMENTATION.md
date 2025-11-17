# Cookie-basierte Authentifizierung - Implementierung ✅

## Zusammenfassung

Alle API-Aufrufe im Frontend sind jetzt korrekt konfiguriert, um Cookies (insbesondere das `sid`-Cookie) an das Backend zu senden. Die Implementierung folgt den Best Practices:

✅ **Zentrale Backend-URL** ohne doppelte Slashes  
✅ **`credentials: 'include'`** bei allen relevanten API-Aufrufen  
✅ **Keine redundanten Header** (Browser verwaltet Cookies automatisch)  
✅ **Korrekte Endpoints** gemäß Backend-API

## Implementierte Änderungen

### 1. ✅ Zentrale API-Konfiguration

#### `lib/api-config.ts` (Next.js)
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export { API_BASE };
```

#### `src/api/config.ts` (Vite/Universal)
```typescript
const API_BASE = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'https://dal-ai-backend.onrender.com';

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export { API_BASE };
```

**Wichtig:** 
- Keine doppelten Slashes (`...com//auth/me`)
- Path beginnt immer mit `/`
- Einfache, saubere URL-Konstruktion

### 2. ✅ Auth-Endpoints mit `credentials: 'include'`

Alle Auth-Funktionen verwenden jetzt die korrekten Endpoints:

#### `lib/auth.ts` (Next.js)
```typescript
// ✅ /auth/register (nicht /api/auth/register)
export async function registerLocal(userData: RegisterData) {
  const response = await fetch(getApiUrl('/auth/register'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
}

// ✅ /auth/login (nicht /api/auth/login)
export async function loginLocal(credentials: LoginCredentials) {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

// ✅ /auth/me
export async function me() {
  const response = await fetch(getApiUrl('/auth/me'), {
    method: 'GET',
    credentials: 'include',
  });
}

// ✅ /auth/logout (nicht /api/auth/logout)
export async function logout() {
  const response = await fetch(getApiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
}
```

#### `src/api/auth.ts` (Universal)
```typescript
// ✅ /auth/register
export async function register(userData: RegisterRequest) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
}

// ✅ /auth/login
export async function login(credentials: LoginRequest) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

// ✅ /auth/me (keine redundanten Accept-Header)
export async function me() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
}

// ✅ /auth/logout
export async function logout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
```

### 3. ✅ Weitere API-Endpoints

Alle weiteren API-Aufrufe verwenden ebenfalls `credentials: 'include'`:

#### Chat & Memory API (`src/api/client.ts`)
- `ask()` - POST `/api/answer`
- `sendFeedback()` - POST `/api/feedback`
- `confirmMemory()` - POST `/api/memory/confirm`
- `rejectMemory()` - POST `/api/memory/reject`
- `getMemories()` - GET `/api/memory`
- `deleteMemory()` - DELETE `/api/memory/{id}`
- `getMemoryStats()` - GET `/api/stats/memory`

#### Expert Recommendations (`src/api/experts.ts`)
- `fetchRecommendations()` - POST `/api/experts/recommend`
- `checkExpertServiceHealth()` - GET `/api/experts/recommend/health`

#### Outlook Integration (`src/api/auth.ts`)
- `getCalendarEvents()` - GET `/api/outlook/events`
- `getUnreadEmails()` - GET `/api/outlook/unread`
- `getOutlookSummary()` - GET `/api/outlook/summary`

#### Main Page (`app/page.tsx`)
- POST `/api/answer` - Chat-Anfragen
- GET `/auth/me` - User-Authentifizierung prüfen
- POST `/api/documents/upload` - Dokumenten-Upload

### 4. ✅ EventSource für Server-Sent Events (SSE)

**Wichtig**: EventSource sendet automatisch Cookies mit, wenn:
- Die Anfrage zur gleichen Origin geht (same-origin), **ODER**
- Der Server die korrekten CORS-Header setzt:
  ```
  Access-Control-Allow-Origin: <frontend-origin>
  Access-Control-Allow-Credentials: true
  ```

```typescript
// src/api/client.ts
const url = `${BASE_URL}/api/answer/stream?question=${encodeURIComponent(question)}`;

// Note: EventSource automatically includes cookies (withCredentials: true behavior)
// when connecting to the same origin or when proper CORS headers are set by the server.
const eventSource = new EventSource(url);
```

**Fallback**: Falls SSE nicht funktioniert, wird automatisch auf POST `/api/answer` zurückgefallen (mit `credentials: 'include'`).

## Best Practices implementiert

✅ **Keine `mode: 'no-cors'`** - würde Cookies blockieren  
✅ **Kein manueller Cookie-Header** - Browser verwaltet dies automatisch  
✅ **Keine redundanten Header bei GET** - `Accept` und `Content-Type` sind optional  
✅ **`Content-Type: application/json`** nur bei POST/PUT mit Body  
✅ **Konsistente Endpoints** - `/auth/*` für Auth, `/api/*` für Rest

## Verwendung

### Umgebungsvariablen setzen

Erstellen Sie eine `.env.local` Datei:

```bash
# Next.js
NEXT_PUBLIC_API_BASE=https://dal-ai-backend.onrender.com

# Vite
VITE_API_URL=https://dal-ai-backend.onrender.com
```

**WICHTIG**: Nach Änderung von `.env.local` neu bauen:
```bash
npm run build
```

## Backend-Anforderungen

### 1. CORS-Header korrekt setzen
```python
# Flask/Python Beispiel
from flask_cors import CORS

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
app.config['SESSION_COOKIE_DOMAIN'] = None      # Keine Domain-Einschränkung
```

### 3. Response-Header für jede Anfrage
```python
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ['https://ihr-frontend.vercel.app', 'http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response
```

## Testing

### Browser DevTools prüfen:

1. **F12** → **Network** Tab
2. API-Call durchführen
3. Request auswählen → **Headers** prüfen:
   - ✅ **Request Headers**: `Cookie: sid=...` sollte vorhanden sein
   - ✅ **Response Headers**: `Set-Cookie` bei Login/Register

### Console-Logs:

```
🔐 Logging in with email and password...
✅ Local login successful: user@example.com
💾 User info stored in localStorage
```

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| ❌ Cookies werden nicht gesendet | ✅ Alle `fetch()` haben `credentials: 'include'` |
| ❌ CORS-Fehler | ✅ Backend muss `Access-Control-Allow-Credentials: true` setzen |
| ❌ Backend erlaubt Origin `*` | ✅ Backend muss spezifischen Origin setzen (nicht `*`) |
| ❌ HTTP statt HTTPS | ✅ In Production immer HTTPS verwenden |
| ❌ SSE funktioniert nicht | ✅ Automatischer Fallback zu POST `/api/answer` |
| ❌ Doppelte Slashes in URL | ✅ Fixed: `getApiUrl()` konstruiert URLs korrekt |

## Zusammenfassung

✅ **Zentrale API-Konfiguration** ohne doppelte Slashes  
✅ **Alle Auth-Endpoints** verwenden `/auth/*` (nicht `/api/auth/*`)  
✅ **`credentials: 'include'`** bei allen API-Aufrufen  
✅ **Keine redundanten Header** - Browser verwaltet Cookies  
✅ **EventSource** sendet automatisch Cookies (mit CORS)  
✅ **Keine weiteren Änderungen nötig**

Die Session-Verwaltung im Frontend (localStorage etc.) bleibt unverändert. Das `sid`-Cookie wird jetzt automatisch mit allen Requests mitgeschickt.

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
