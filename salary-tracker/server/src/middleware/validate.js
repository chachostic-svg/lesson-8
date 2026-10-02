import { createValidationError } from './errorHandler.js'
import { isValidIncomeCategory, isValidExpenseCategory } from '../utils/categories.js'

// Регулярное выражение для проверки формата даты YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Middleware для валидации данных транзакции (создание и обновление)
export function validateTransaction(type) {
  return (req, res, next) => {
    const { amount, date, category } = req.body
    const errors = []

    // Проверка amount
    if (amount === undefined || amount === null) {
      errors.push('Поле amount обязательно')
    } else {
      const numAmount = Number(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push('Поле amount должно быть положительным числом')
      }
    }

    // Проверка date
    if (!date) {
      errors.push('Поле date обязательно')
    } else if (!DATE_REGEX.test(date)) {
      errors.push('Поле date должно быть в формате YYYY-MM-DD')
    } else {
      // Проверяем, что дата реально существует (например, не 2024-02-30)
      const parsedDate = new Date(date + 'T00:00:00')
      if (isNaN(parsedDate.getTime())) {
        errors.push('Поле date содержит некорректную дату')
      }
    }

    // Проверка category
    if (!category) {
      errors.push('Поле category обязательно')
    } else {
      const isValid =
        type === 'income'
          ? isValidIncomeCategory(category)
          : isValidExpenseCategory(category)

      if (!isValid) {
        errors.push(`Недопустимая категория для типа "${type}"`)
      }
    }

    // Если есть ошибки — возвращаем 422
    if (errors.length > 0) {
      return next(createValidationError(errors.join('; ')))
    }

    next()
  }
}

// Middleware для валидации параметров пагинации
export function validatePagination(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 20

  if (page < 1) {
    return next(createValidationError('Параметр page должен быть >= 1'))
  }

  if (limit < 1 || limit > 100) {
    return next(createValidationError('Параметр limit должен быть от 1 до 100'))
  }

  // Сохраняем нормализованные значения
  req.pagination = { page, limit, offset: (page - 1) * limit }
  next()
}