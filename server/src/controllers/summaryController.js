import * as summaryService from '../services/summaryService.js'

// Получить общий баланс (доходы - расходы)
export async function getBalance(req, res, next) {
  try {
    const balance = await summaryService.getBalance()

    res.json({
      success: true,
      data: balance,
    })
  } catch (error) {
    next(error)
  }
}

// Получить суммы по категориям (для круговой диаграммы)
export async function getByCategory(req, res, next) {
  try {
    const type = req.query.type || 'expense'
    const filters = {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    }

    const data = await summaryService.getByCategory(type, filters)

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

// Получить месячную сводку (для столбчатого графика)
export async function getByMonth(req, res, next) {
  try {
    const months = parseInt(req.query.months, 10) || 6

    const data = await summaryService.getByMonth(months)

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}