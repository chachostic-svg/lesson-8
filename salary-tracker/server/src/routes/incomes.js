import { Router } from 'express'
import * as incomeController from '../controllers/incomeController.js'
import { validateTransaction, validatePagination } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Все роуты требуют авторизации
router.use(authenticate)

// GET /api/v1/incomes — получить все доходы пользователя с пагинацией и фильтрами
router.get('/', validatePagination, incomeController.getAll)

// GET /api/v1/incomes/:id — получить доход по ID
router.get('/:id', incomeController.getById)

// POST /api/v1/incomes — создать новый доход
router.post('/', validateTransaction('income'), incomeController.create)

// PUT /api/v1/incomes/:id — обновить существующий доход
router.put('/:id', validateTransaction('income'), incomeController.update)

// DELETE /api/v1/incomes/:id — удалить доход по ID
router.delete('/:id', incomeController.remove)

export default router