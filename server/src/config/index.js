import path from 'path'
import { fileURLToPath } from 'url'

// Эмуляция __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Порт, на котором будет работать сервер
export const PORT = process.env.PORT || 3001

// Настройки CORS для разрешения запросов с фронтенда
export const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Путь к файлу базы данных SQLite (в корневой папке server)
export const DB_PATH = path.join(__dirname, '../../data.db')