import app from './src/app.js'
import { PORT } from './src/config/index.js'
import { getDb } from './src/db/connection.js'

// Инициализация базы данных и запуск сервера
async function start() {
  try {
    // Инициализируем БД (создаём таблицы, если их нет)
    await getDb()
    console.log('✅ База данных инициализирована')

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
      console.log('')
      console.log('Доступные эндпоинты:')
      console.log(`  GET    http://localhost:${PORT}/api/v1/incomes`)
      console.log(`  POST   http://localhost:${PORT}/api/v1/incomes`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/incomes/:id`)
      console.log(`  PUT    http://localhost:${PORT}/api/v1/incomes/:id`)
      console.log(`  DELETE http://localhost:${PORT}/api/v1/incomes/:id`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/expenses`)
      console.log(`  POST   http://localhost:${PORT}/api/v1/expenses`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/expenses/:id`)
      console.log(`  PUT    http://localhost:${PORT}/api/v1/expenses/:id`)
      console.log(`  DELETE http://localhost:${PORT}/api/v1/expenses/:id`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/summary/balance`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/summary/by-category`)
      console.log(`  GET    http://localhost:${PORT}/api/v1/summary/by-month`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

start()