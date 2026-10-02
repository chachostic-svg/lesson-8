import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /api/v1/auth/register — регистрация нового пользователя
router.post('/register', authController.register)

// POST /api/v1/auth/login — вход пользователя
router.post('/login', authController.login)

// GET /api/v1/auth/me — получить информацию о текущем пользователе (требует токен)
router.get('/me', authenticate, authController.getMe)

export default router