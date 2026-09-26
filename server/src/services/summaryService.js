import { getDb } from '../db/connection.js'

// Получить общий баланс (доходы - расходы)
export async function getBalance() {
  const db = await getDb()

  const incomeResult = await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM incomes')
  const expenseResult = await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM expenses')

  const totalIncome = incomeResult.total
  const totalExpense = expenseResult.total
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    balance,
  }
}

// Получить суммы по категориям (для круговой диаграммы)
export async function getByCategory(type = 'expense', filters = {}) {
  const db = await getDb()
  const tableName = type === 'income' ? 'incomes' : 'expenses'

  // Строим WHERE-условия
  const conditions = []
  const params = []

  if (filters.dateFrom) {
    conditions.push('date >= ?')
    params.push(filters.dateFrom)
  }

  if (filters.dateTo) {
    conditions.push('date <= ?')
    params.push(filters.dateTo)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Группируем по категории и суммируем
  const query = `
    SELECT category, SUM(amount) as value
    FROM ${tableName}
    ${whereClause}
    GROUP BY category
    ORDER BY value DESC
  `

  const rows = await db.all(query, params)

  // Формируем массив для графика
  return rows.map((row) => ({
    name: row.category,
    value: row.value,
  }))
}

// Получить месячную сводку (для столбчатого графика)
export async function getByMonth(months = 6) {
  const db = await getDb()

  // Вычисляем дату начала периода
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months + 1)
  startDate.setDate(1)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Получаем доходы по месяцам
  const incomeQuery = `
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(amount) as total
    FROM incomes
    WHERE date >= ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `

  const incomeRows = await db.all(incomeQuery, [startDateStr])

  // Получаем расходы по месяцам
  const expenseQuery = `
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(amount) as total
    FROM expenses
    WHERE date >= ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month
  `

  const expenseRows = await db.all(expenseQuery, [startDateStr])

  // Преобразуем в Map для удобного объединения
  const incomeMap = new Map(incomeRows.map((row) => [row.month, row.total]))
  const expenseMap = new Map(expenseRows.map((row) => [row.month, row.total]))

  // Формируем массив данных за все месяцы периода
  const result = []
  const currentDate = new Date(startDate)

  while (currentDate <= new Date()) {
    const monthKey = currentDate.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = currentDate.toLocaleDateString('ru-RU', {
      month: 'short',
      year: '2-digit',
    })

    result.push({
      name: monthLabel,
      income: incomeMap.get(monthKey) || 0,
      expense: expenseMap.get(monthKey) || 0,
    })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return result
}