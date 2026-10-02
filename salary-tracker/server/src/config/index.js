import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Загружаем переменные окружения из файла .env (если он есть)
dotenv.config()

// Получаем директорию текущего файла для корректного пути к БД
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const PORT = process.env.PORT || 3001

// Путь к файлу базы данных SQLite (в папке server/)
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data.db')

// Настройки CORS для разрешения запросов с фронтенда (Vite по умолчанию использует порт 5173)
export const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}