// Точка входа для Vercel (Node.js runtime).
// Локальная разработка — server/index.js, который поднимает сервер сам.
// На Vercel порт выдаёт платформа, поэтому HTTP-сервер нужно создать явно.
import { createServer } from 'node:http'
import app from './src/app.js'
import { PORT } from './src/config/index.js'
import { getDb } from './src/db/connection.js'

const server = createServer(app)

// Слушаем сразу, не дожидаясь сети: БД подключается лениво при первом запросе
// (см. src/db/connection.js), поэтому холодный старт не блокируется Turso.
server.listen(PORT, () => {
  console.log(`🚀 API запущен на порту ${PORT}`)
})

// Прогреваем подключение к Turso параллельно и логируем ошибки конфигурации,
// чтобы о них было видно в логах деплоя, а не только в ответе 500.
getDb().catch((error) => {
  console.error(`❌ Не удалось подключиться к базе: ${error.message}`)
})