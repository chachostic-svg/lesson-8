import express from 'express'
import cors from 'cors'
import { CORS_OPTIONS } from './config/index.js'
import incomesRouter from './routes/incomes.js'
import expensesRouter from './routes/expenses.js'
import summaryRouter from './routes/summary.js'
import authRouter from './routes/auth.js'
import { errorHandler, createNotFoundError } from './middleware/errorHandler.js'

const app = express()

// Middleware для CORS
app.use(cors(CORS_OPTIONS))

// Middleware для парсинга JSON в теле запроса
app.use(express.json())

// Роуты API
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/incomes', incomesRouter)
app.use('/api/v1/expenses', expensesRouter)
app.use('/api/v1/summary', summaryRouter)

// Обработчик для несуществующих маршрутов (404)
app.use((req, res, next) => {
  next(createNotFoundError(`Маршрут ${req.method} ${req.url} не найден`))
})

// Централизованный обработчик ошибок (должен быть последним)
app.use(errorHandler)

export default app