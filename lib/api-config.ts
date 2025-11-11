/**
 * API Configuration
 * 
 * Используется для обращения к внешнему бэкенду в статической сборке.
 * Устанавливается через переменную окружения NEXT_PUBLIC_API_BASE.
 * 
 * ВАЖНО: Для статической сборки Next.js встраивает значение NEXT_PUBLIC_API_BASE
 * во время build процесса. После сборки это значение уже не может быть изменено.
 */

// Next.js заменяет process.env.NEXT_PUBLIC_* на реальные значения во время сборки
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

// Для отладки: вывести в консоль, какое значение используется
if (typeof window !== 'undefined') {
  console.log('🔗 API_BASE configured:', API_BASE || '(empty - using relative paths)');
}

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
  
  // Если API_BASE настроен, используем его
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  
  // Если не настроен - это проблема в production!
  if (typeof window !== 'undefined') {
    console.warn('⚠️ NEXT_PUBLIC_API_BASE not configured! Using relative path:', normalizedPath);
    console.warn('⚠️ This will NOT work in static deployment. Set NEXT_PUBLIC_API_BASE and rebuild.');
  }
  
  // Fallback к относительному пути (не будет работать на статическом хостинге)
  return normalizedPath;
}
