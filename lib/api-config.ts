/**
 * API Configuration
 * 
 * Используется для обращения к внешнему бэкенду в статической сборке.
 * Устанавливается через переменную окружения NEXT_PUBLIC_API_BASE.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

/**
 * Проверка, что API_BASE настроен
 */
export function isApiConfigured(): boolean {
  return !!API_BASE;
}

/**
 * Получить полный URL для API endpoint
 */
export function getApiUrl(path: string): string {
  // Убедимся, что path начинается с /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // В production (статическая сборка) используем API_BASE
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  
  // В development возвращаем относительный путь
  return normalizedPath;
}
