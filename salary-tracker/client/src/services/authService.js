import { post, get } from './api.js'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Сохранить токен и данные пользователя
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Получить токен и данные пользователя
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

// Очистить данные при выходе
export function removeAuthData() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Регистрация нового пользователя
export async function register(email, password, name = '') {
  const result = await post('/auth/register', { email, password, name })
  if (result.data && result.data.token) {
    setToken(result.data.token)
    setUser(result.data.user)
  }
  return result.data
}

// Вход пользователя
export async function login(email, password) {
  const result = await post('/auth/login', { email, password })
  if (result.data && result.data.token) {
    setToken(result.data.token)
    setUser(result.data.user)
  }
  return result.data
}

// Выход из системы
export function logout() {
  removeAuthData()
}

// Получить информацию о текущем пользователе по токену
export async function getMe() {
  return await get('/auth/me')
}