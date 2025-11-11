# Исправления API-путей и конфигурации

## ✅ Выполненные изменения

### 1. Исправлены API-пути `/api/me` → `/auth/me`

В backend используется путь `/auth/me`, а не `/api/me`. Исправлено в:

- ✅ **`components/GlobalKnowledgeView.tsx`**: `getApiUrl('/auth/me')`
- ✅ **`app/page.tsx`**: `getApiUrl('/auth/me')`
- ✅ **`lib/auth.ts`**: уже был правильный путь `/auth/me`
- ✅ **`src/api/auth.ts`**: уже был правильный путь `/auth/me`

### 2. Исправлен `DocumentManager.tsx`

**Проблемы:**
- Использовался `process.env.NEXT_PUBLIC_API_BASE` напрямую (не работает в браузере)
- Переменная `userId` не была определена
- Не использовалась функция `getApiUrl()`

**Решение:**
```typescript
// Добавлен импорт
import { getApiUrl } from "@/lib/api-config"

// Заменены все fetch-вызовы:
fetch(getApiUrl('/auth/me'), { credentials: 'include' })
fetch(getApiUrl('/api/documents'), { credentials: 'include' })
fetch(getApiUrl('/api/documents/upload'), { credentials: 'include', ... })
fetch(getApiUrl(`/api/documents/${documentId}`), { method: 'DELETE', ... })

// Убран параметр userId из body (backend определяет из cookie):
body: JSON.stringify({
  filename: file.name,
  content: content,
  // userId is determined by backend from session cookie
})
```

### 3. Проверена консистентность всех компонентов

Все компоненты теперь используют централизованную конфигурацию через `getApiUrl()`:

- ✅ `components/GlobalKnowledgeView.tsx`
- ✅ `components/DocumentManager.tsx`
- ✅ `src/components/ExpertsDashboard.tsx`
- ✅ `app/page.tsx`
- ✅ `lib/auth.ts`

## 🔧 Как использовать

### Локальная разработка

1. Создайте `.env.local`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8081
```

2. Запустите dev-сервер:
```bash
pnpm dev
```

### Production на Render

1. В Render Dashboard → Settings → Environment добавьте:
```
NEXT_PUBLIC_API_BASE=https://dal-ai-backend.onrender.com
```

2. Trigger new deployment (Manual Deploy или git push)

3. Render выполнит:
```bash
pnpm install --no-frozen-lockfile
pnpm run build
```

4. Статические файлы будут развернуты из папки `out/`

## ✅ Результат сборки

```
 ✓ Compiled successfully
 ✓ Generating static pages (12/12)
 ✓ Exporting (5/5)

Route (app)                    Size  First Load JS
┌ ○ /                       9.48 kB         143 kB
├ ○ /documents             10.6 kB         137 kB
├ ○ /knowledge             4.58 kB         131 kB
└ ... (все маршруты собраны успешно)
```

## 📋 Правильные API-пути

| Endpoint | Path | Метод | Цель |
|----------|------|-------|------|
| Auth check | `/auth/me` | GET | Проверка авторизации |
| Login | `/api/auth/login` | POST | Вход |
| Register | `/api/auth/register` | POST | Регистрация |
| Logout | `/api/auth/logout` | POST | Выход |
| Documents list | `/api/documents` | GET | Список документов |
| Upload | `/api/documents/upload` | POST | Загрузка документа |
| Delete | `/api/documents/{id}` | DELETE | Удаление документа |
| Global memory | `/api/memory/global` | GET | Глобальная база знаний |

## ⚠️ Важно

1. **CORS на backend**: Убедитесь, что backend разрешает запросы с вашего frontend домена:
```javascript
cors({
  origin: ['https://dal-ai-frontend.onrender.com', 'http://localhost:3000'],
  credentials: true
})
```

2. **Все fetch-вызовы должны использовать `credentials: 'include'`** для передачи cookies

3. **После изменения `NEXT_PUBLIC_API_BASE` нужен rebuild**, так как Next.js встраивает env-переменные во время сборки

## 🚀 Следующие шаги

1. ✅ Код обновлён и собирается без ошибок
2. ⏳ Deploy на Render с правильной `NEXT_PUBLIC_API_BASE`
3. ⏳ Проверить CORS настройки на backend
4. ⏳ Протестировать все функции на production

---

**Дата:** 11 ноября 2025  
**Статус:** ✅ Все исправления применены, сборка успешна
