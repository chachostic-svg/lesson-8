import * as incomeService from '../services/incomeService.js'

// Получить все доходы пользователя с пагинацией и фильтрами
export async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = req.pagination
    const filters = {
      category: req.query.category,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    }

    const result = await incomeService.getAllIncomes(req.userId, {
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

// Получить доход по ID
export async function getById(req, res, next) {
  try {
    const { id } = req.params
    const income = await incomeService.getIncomeById(req.userId, id)

    res.json({
      success: true,
      data: income,
    })
  } catch (error) {
    next(error)
  }
}

// Создать новый доход
export async function create(req, res, next) {
  try {
    const incomeData = {
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      comment: req.body.comment,
    }

    const income = await incomeService.createIncome(req.userId, incomeData)

    res.status(201).json({
      success: true,
      data: income,
    })
  } catch (error) {
    next(error)
  }
}

// Обновить существующий доход
export async function update(req, res, next) {
  try {
    const { id } = req.params
    const incomeData = {
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      comment: req.body.comment,
    }

    const income = await incomeService.updateIncome(req.userId, id, incomeData)

    res.json({
      success: true,
      data: income,
    })
  } catch (error) {
    next(error)
  }
}

// Удалить доход по ID
export async function remove(req, res, next) {
  try {
    const { id } = req.params
    const result = await incomeService.deleteIncome(req.userId, id)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}