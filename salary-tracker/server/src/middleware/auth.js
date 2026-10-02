import { verifyToken } from '../services/authService.js'
import { AppError } from './errorHandler.js'

// Middleware для проверки JWT-токена
export function authenticate(req, res, next) {
  // Получаем заголовок Authorization
  const authHeader = req.headers.authorization

  // Проверяем наличие заголовка
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Токен авторизации не предоставлен', 401, 'UNAUTHORIZED'))
  }

  // Извлекаем токен (убираем "Bearer " из начала)
  const token = authHeader.split(' ')[1]

  if (!token) {
    return next(new AppError('Токен авторизации пустой', 401, 'UNAUTHORIZED'))
  }

  // Проверяем валидность токена
  const userId = verifyToken(token)

  if (!userId) {
    return next(new AppError('Недействительный или просроченный токен', 401, 'UNAUTHORIZED'))
  }

  // Добавляем userId в объект запроса для использования в контроллерах
  req.userId = userId
  next()
}