import { Router } from 'express'
import * as expenseController from '../controllers/expenseController.js'
import { validateTransaction, validatePagination } from '../middleware/validate.js'

const router = Router()

// GET /api/v1/expenses — получить все расходы с пагинацией и фильтрами
router.get('/', validatePagination, expenseController.getAll)

// GET /api/v1/expenses/:id — получить расход по ID
router.get('/:id', expenseController.getById)

// POST /api/v1/expenses — создать новый расход
router.post('/', validateTransaction('expense'), expenseController.create)

// PUT /api/v1/expenses/:id — обновить существующий расход
router.put('/:id', validateTransaction('expense'), expenseController.update)

// DELETE /api/v1/expenses/:id — удалить расход по ID
router.delete('/:id', expenseController.remove)

export default router