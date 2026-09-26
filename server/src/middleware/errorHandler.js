// Централизованный обработчик ошибок Express
export function errorHandler(err, req, res, next) {
  // Логируем ошибку на сервере
  console.error('Ошибка:', err)

  // Определяем статус-код и сообщение
  const statusCode = err.statusCode || 500
  const message = err.message || 'Внутренняя ошибка сервера'
  const code = err.code || 'INTERNAL_ERROR'

  // Возвращаем ошибку в едином формате
  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  })
}

// Функция для создания кастомных ошибок с нужным статус-кодом
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

// Предопределённые типы ошибок для удобства
export const createBadRequestError = (message = 'Неверный запрос') =>
  new AppError(message, 400, 'BAD_REQUEST')

export const createNotFoundError = (message = 'Ресурс не найден') =>
  new AppError(message, 404, 'NOT_FOUND')

export const createValidationError = (message = 'Ошибка валидации') =>
  new AppError(message, 422, 'VALIDATION_ERROR')