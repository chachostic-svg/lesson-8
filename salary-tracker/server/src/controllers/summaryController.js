import * as summaryService from '../services/summaryService.js'

// Получить общий баланс пользователя (доходы - расходы)
export async function getBalance(req, res, next) {
  try {
    const balance = await summaryService.getBalance(req.userId)

    res.json({
      success: true,
      data: balance,
    })
  } catch (error) {
    next(error)
  }
}

// Получить суммы по категориям пользователя (для круговой диаграммы)
export async function getByCategory(req, res, next) {
  try {
    const type = req.query.type || 'expense'
    const filters = {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    }

    const data = await summaryService.getByCategory(req.userId, type, filters)

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

// Получить месячную сводку пользователя (для столбчатого графика)
export async function getByMonth(req, res, next) {
  try {
    const months = parseInt(req.query.months, 10) || 6

    const data = await summaryService.getByMonth(req.userId, months)

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}