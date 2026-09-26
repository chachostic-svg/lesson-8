import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { DB_PATH } from '../config/index.js'

// Эмуляция __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Кэш подключения к БД (singleton)
let db = null

// Инициализация БД: открытие соединения и выполнение схемы
async function initDb() {
  // Открываем (или создаём) файл базы данных
  const connection = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  })

  // Читаем и выполняем SQL-скрипт схемы
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schemaSql = await fs.readFile(schemaPath, 'utf-8')
  await connection.exec(schemaSql)

  return connection
}

// Получение экземпляра БД (с ленивой инициализацией)
export async function getDb() {
  if (!db) {
    db = await initDb()
  }
  return db
}

// Закрытие соединения (на случай graceful shutdown)
export async function closeDb() {
  if (db) {
    await db.close()
    db = null
  }
}