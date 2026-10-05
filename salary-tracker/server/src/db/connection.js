import { createClient } from '@libsql/client'
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '../config/index.js'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Эмуляция __dirname для ES-модулей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Кэш подключения к БД (singleton)
let dbPromise = null

// Проверяем, что Turso сконфигурирован, и подсказываем что делать
function resolveConnectionOptions() {
  if (!TURSO_DATABASE_URL) {
    throw new Error(
      'Не задан TURSO_DATABASE_URL. Создайте базу Turso и опишите подключение в server/.env ' +
        '(инструкция — server/TURSO.md).'
    )
  }

  // authToken обязателен для удалённых баз Turso, но не нужен для локальных file: баз
  return TURSO_AUTH_TOKEN
    ? { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN }
    : { url: TURSO_DATABASE_URL }
}

// Адаптер поверх turso-клиента.
// Сервисы работают через get/all/run/exec — такой же интерфейс, как у пакета `sqlite`,
// поэтому менять код сервисов не потребовалось.
function createAdapter(client) {
  return {
    // Одна строка результата или undefined
    async get(sql, params = []) {
      const result = await client.execute({ sql, args: params })
      return result.rows[0]
    },

    // Все строки результата
    async all(sql, params = []) {
      const result = await client.execute({ sql, args: params })
      return result.rows
    },

    // INSERT/UPDATE/DELETE. Возвращает { changes } — сервисы проверяют result.changes
    async run(sql, params = []) {
      const result = await client.execute({ sql, args: params })
      return { changes: result.rowsAffected, lastInsertRowid: result.lastInsertRowid }
    },

    // Несколько SQL-выражений без параметров (используется для schema.sql)
    async exec(sql) {
      await client.executeMultiple(sql)
    },

    // Атомарная пачка запросов (write — по умолчанию)
    async batch(statements) {
      return client.batch(statements)
    },

    async close() {
      await client.close()
    },
  }
}

// Инициализация БД: подключение и применение схемы
async function initDb() {
  const client = createClient(resolveConnectionOptions())

  // Читаем и выполняем SQL-скрипт схемы (идемпотентно, CREATE TABLE IF NOT EXISTS)
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schemaSql = await readFile(schemaPath, 'utf-8')
  await client.executeMultiple(schemaSql)

  return createAdapter(client)
}

// Получение экземпляра БД (с ленивой инициализацией)
export async function getDb() {
  if (!dbPromise) {
    dbPromise = initDb().catch((error) => {
      // Не кэшируем неудачное подключение, чтобы следующий запрос мог повторить попытку
      dbPromise = null
      throw error
    })
  }
  return dbPromise
}

// Закрытие соединения (на случай graceful shutdown)
export async function closeDb() {
  if (dbPromise) {
    const db = await dbPromise.catch(() => null)
    dbPromise = null
    if (db) {
      await db.close()
    }
  }
}