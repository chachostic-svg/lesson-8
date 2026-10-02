import { Router } from 'express'
import * as summaryController from '../controllers/summaryController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Все роуты требуют авторизации
router.use(authenticate)

// GET /api/v1/summary/balance — получить общий баланс пользователя
router.get('/balance', summaryController.getBalance)

// GET /api/v1/summary/by-category — получить суммы по категориям пользователя
router.get('/by-category', summaryController.getByCategory)

// GET /api/v1/summary/by-month — получить месячную сводку пользователя
router.get('/by-month', summaryController.getByMonth)

export default router