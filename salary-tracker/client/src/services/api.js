// Базовый URL из переменных окружения Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

// Преобразование объекта параметров в query-строку
function buildQueryString(params) {
  if (!params) return ''
  
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  )
  
  if (entries.length === 0) return ''
  
  const queryString = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  
  return `?${queryString}`
}

// Универсальная функция для выполнения запросов
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  
  // Читаем токен напрямую из localStorage
  const token = localStorage.getItem('auth_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      // Если токен есть, добавляем его в заголовок Authorization
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  // Если передаём тело — преобразуем в JSON
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    // Парсим ответ
    const data = await response.json()

    // Если статус не успешный — выбрасываем ошибку
    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.code = data?.error?.code || 'UNKNOWN_ERROR'
      
      // Если токен просрочен или недействителен (401), очищаем данные
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        // Перенаправляем на страницу входа
        window.location.href = '/login'
      }
      
      throw error
    }

    // Возвращаем данные из поля data (или весь ответ, если data нет)
    return data.data !== undefined ? data : data
  } catch (error) {
    // Если это сетевая ошибка (backend недоступен)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на порту 3001.')
    }
    throw error
  }
}

// GET-запрос с опциональными параметрами (преобразуются в query-строку)
export function get(path, params) {
  const queryString = buildQueryString(params)
  return request(`${path}${queryString}`, { method: 'GET' })
}

// POST-запрос с телом
export function post(path, body) {
  return request(path, {
    method: 'POST',
    body,
  })
}

// PUT-запрос с телом
export function put(path, body) {
  return request(path, {
    method: 'PUT',
    body,
  })
}

// DELETE-запрос
export function del(path) {
  return request(path, { method: 'DELETE' })
}