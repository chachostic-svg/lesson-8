import { get } from './api.js'

// Получить общий баланс (доходы - расходы)
export async function getBalance() {
  const result = await get('/summary/balance')
  return result.data || { totalIncome: 0, totalExpense: 0, balance: 0 }
}

// Получить данные по категориям для круговой диаграммы
export async function getByCategory(type = 'expense', filters = {}) {
  const params = { type, ...filters }
  const result = await get('/summary/by-category', params)
  return result.data || []
}

// Получить месячную сводку для столбчатого графика
export async function getMonthlySummary(months = 6) {
  const result = await get('/summary/by-month', { months })
  return result.data || []
}

// Получить последние транзакции (для Dashboard)
export async function getRecentTransactions(limit = 5) {
  const [incomesResult, expensesResult] = await Promise.all([
    get('/incomes', { limit, page: 1 }),
    get('/expenses', { limit, page: 1 }),
  ])

  const incomes = (incomesResult.data || []).map((inc) => ({ ...inc, type: 'income' }))
  const expenses = (expensesResult.data || []).map((exp) => ({ ...exp, type: 'expense' }))

  const allTransactions = [...incomes, ...expenses]
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  return allTransactions.slice(0, limit)
}

// Получить все транзакции с фильтрацией
export async function getFilteredTransactions(filters = {}) {
  const shouldFetchIncomes = !filters.type || filters.type === 'all' || filters.type === 'income'
  const shouldFetchExpenses = !filters.type || filters.type === 'all' || filters.type === 'expense'

  const requests = []

  if (shouldFetchIncomes) {
    const incomeFilters = { ...filters }
    delete incomeFilters.type
    // ИСПРАВЛЕНО: limit изменен с 1000 на 100
    requests.push(get('/incomes', { ...incomeFilters, limit: 100, page: 1 }))
  }

  if (shouldFetchExpenses) {
    const expenseFilters = { ...filters }
    delete expenseFilters.type
    // ИСПРАВЛЕНО: limit изменен с 1000 на 100
    requests.push(get('/expenses', { ...expenseFilters, limit: 100, page: 1 }))
  }

  const results = await Promise.all(requests)

  let incomes = []
  let expenses = []

  if (shouldFetchIncomes) {
    incomes = (results[0].data || []).map((inc) => ({ ...inc, type: 'income' }))
  }

  if (shouldFetchExpenses) {
    const index = shouldFetchIncomes ? 1 : 0
    expenses = (results[index].data || []).map((exp) => ({ ...exp, type: 'expense' }))
  }

  const allTransactions = [...incomes, ...expenses]
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))

  return allTransactions
}