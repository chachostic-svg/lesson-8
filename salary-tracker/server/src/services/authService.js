import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getDb } from '../db/connection.js'
import { createBadRequestError, createNotFoundError } from '../middleware/errorHandler.js'

// Секретный ключ для JWT (в продакшене должен быть в .env)
const JWT_SECRET = process.env.JWT_SECRET || 'salary-tracker-secret-key-2026'
const JWT_EXPIRES_IN = '7d'
const SALT_ROUNDS = 10

// Маппинг из snake_case в camelCase
function mapUserToCamelCase(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Хеширование пароля
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Сравнение пароля с хешем
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Генерация JWT-токена
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Регистрация нового пользователя
export async function register(email, password, name = '') {
  const db = await getDb()

  // Валидация email
  if (!email || !email.includes('@')) {
    throw createBadRequestError('Некорректный email')
  }

  // Валидация пароля
  if (!password || password.length < 6) {
    throw createBadRequestError('Пароль должен быть не менее 6 символов')
  }

  // Проверяем, существует ли пользователь с таким email
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    throw createBadRequestError('Пользователь с таким email уже существует')
  }

  const id = crypto.randomUUID()
  const hashedPassword = await hashPassword(password)
  const now = new Date().toISOString()

  await db.run(
    'INSERT INTO users (id, email, password, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, email, hashedPassword, name, now, now]
  )

  const user = await db.get('SELECT * FROM users WHERE id = ?', [id])
  const token = generateToken(id)

  return {
    user: mapUserToCamelCase(user),
    token,
  }
}

// Вход пользователя
export async function login(email, password) {
  const db = await getDb()

  if (!email || !password) {
    throw createBadRequestError('Email и пароль обязательны')
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
  if (!user) {
    throw createNotFoundError('Неверный email или пароль')
  }

  const isValid = await comparePassword(password, user.password)
  if (!isValid) {
    throw createNotFoundError('Неверный email или пароль')
  }

  const token = generateToken(user.id)

  return {
    user: mapUserToCamelCase(user),
    token,
  }
}

// Проверка JWT-токена (возвращает userId или null)
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.userId
  } catch (error) {
    return null
  }
}

// Получить пользователя по ID
export async function getUserById(id) {
  const db = await getDb()
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id])
  if (!user) {
    throw createNotFoundError('Пользователь не найден')
  }
  return mapUserToCamelCase(user)
}