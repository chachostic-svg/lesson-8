import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Получаем директорию текущего файла для корректных путей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Загружаем переменные окружения из server/.env независимо от текущей директории,
// чтобы запуск из корня репозитория тоже подхватывал настройки Turso
dotenv.config({ path: path.join(__dirname, '../../.env') })

export const PORT = process.env.PORT || 3001

// Подключение к Turso (libSQL).
// TURSO_DATABASE_URL — выдаётся командой `turso db show <name> --url`
//   (формат libsql://<db-name>-<org>.turso.io)
// TURSO_AUTH_TOKEN — выдаётся командой `turso db tokens create <name>`
export const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || ''
export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

// Настройки CORS для разрешения запросов с фронтенда (Vite по умолчанию использует порт 5173)
export const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}