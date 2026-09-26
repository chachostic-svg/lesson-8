import { Router } from 'express'
import * as summaryController from '../controllers/summaryController.js'

const router = Router()

// GET /api/v1/summary/balance — получить общий баланс
router.get('/balance', summaryController.getBalance)

// GET /api/v1/summary/by-category — получить суммы по категориям
router.get('/by-category', summaryController.getByCategory)

// GET /api/v1/summary/by-month — получить месячную сводку
router.get('/by-month', summaryController.getByMonth)

export default router