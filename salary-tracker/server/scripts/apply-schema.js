// Применяет schema.sql к базе Turso и проверяет, что схема на месте.
// Запуск: npm run db:schema  (из папки server/)
import { createClient } from '@libsql/client'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '../src/config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  if (!TURSO_DATABASE_URL) {
    console.error('❌ Не задан TURSO_DATABASE_URL. Проверьте server/.env (инструкция — server/TURSO.md)')
    process.exit(1)
  }

  const client = createClient(
    TURSO_AUTH_TOKEN
      ? { url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN }
      : { url: TURSO_DATABASE_URL }
  )

  try {
    console.log(`🔗 Подключаемся к ${TURSO_DATABASE_URL.replace(/\/\/.*@/, '//***@')}`)

    const schemaSql = await readFile(path.join(__dirname, '../src/db/schema.sql'), 'utf-8')
    await client.executeMultiple(schemaSql)
    console.log('✅ Схема применена')

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    console.log('   Таблицы:', tables.rows.map((row) => row.name).join(', ') || 'нет')

    for (const table of ['users', 'incomes', 'expenses']) {
      const result = await client.execute(`SELECT COUNT(*) AS count FROM ${table}`)
      console.log(`   ${table}: ${result.rows[0].count} строк`)
    }
  } catch (error) {
    console.error('❌ Ошибка применения схемы:', error.message)
    process.exit(1)
  } finally {
    client.close()
  }
}

main()