const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

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

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.code = data?.error?.code || 'UNKNOWN_ERROR'
      throw error
    }

    return data.data !== undefined ? data : data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что backend запущен на порту 3001.')
    }
    throw error
  }
}

export function get(path, params) {
  const queryString = buildQueryString(params)
  return request(`${path}${queryString}`, { method: 'GET' })
}

export function post(path, body) {
  return request(path, { method: 'POST', body })
}

export function put(path, body) {
  return request(path, { method: 'PUT', body })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}