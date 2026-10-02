import * as expenseService from '../services/expenseService.js'

// Получить все расходы пользователя с пагинацией и фильтрами
export async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = req.pagination
    const filters = {
      category: req.query.category,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      isRecurring: req.query.isRecurring !== undefined
        ? req.query.isRecurring === 'true'
        : undefined,
    }

    const result = await expenseService.getAllExpenses(req.userId, {
      page,
      limit,
      offset,
      filters,
    })

    res.json({
      success: true,
      ...result,
    })
  } catch (error) {
    next(error)
  }
}

// Получить расход по ID
export async function getById(req, res, next) {
  try {
    const { id } = req.params
    const expense = await expenseService.getExpenseById(req.userId, id)

    res.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

// Создать новый расход
export async function create(req, res, next) {
  try {
    const expenseData = {
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      comment: req.body.comment,
      isRecurring: req.body.isRecurring,
    }

    const expense = await expenseService.createExpense(req.userId, expenseData)

    res.status(201).json({
      success: true,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

// Обновить существующий расход
export async function update(req, res, next) {
  try {
    const { id } = req.params
    const expenseData = {
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      comment: req.body.comment,
      isRecurring: req.body.isRecurring,
    }

    const expense = await expenseService.updateExpense(req.userId, id, expenseData)

    res.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

// Удалить расход по ID
export async function remove(req, res, next) {
  try {
    const { id } = req.params
    const result = await expenseService.deleteExpense(req.userId, id)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}