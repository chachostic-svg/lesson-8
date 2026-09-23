import { getIncomes, getTotalIncome } from './incomeService'
import { getExpenses, getTotalExpense } from './expenseService'

// Получить общий баланс (доходы - расходы)
export const getBalance = () => {
  const totalIncome = getTotalIncome()
  const totalExpense = getTotalExpense()
  return totalIncome - totalExpense
}

// Получить данные по категориям для круговой диаграммы
export const getByCategory = (type = 'expense') => {
  const transactions = type === 'income' ? getIncomes() : getExpenses()
  
  // Группируем по категориям
  const categoryMap = new Map()
  
  transactions.forEach((transaction) => {
    const category = transaction.category
    const label = transaction.categoryLabel || category
    const amount = transaction.amount || 0
    
    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category)
      existing.value += amount
    } else {
      categoryMap.set(category, {
        name: label,
        value: amount,
      })
    }
  })
  
  // Преобразуем Map в массив
  return Array.from(categoryMap.values())
}

// Получить месячную сводку для столбчатого графика
export const getMonthlySummary = (months = 6) => {
  const incomes = getIncomes()
  const expenses = getExpenses()
  
  // Создаём массив последних N месяцев
  const monthlyData = []
  const now = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const monthName = date.toLocaleDateString('ru-RU', { month: 'short' })
    const monthLabel = `${monthName} ${year}`
    
    // Считаем доходы за этот месяц
    const monthIncomes = incomes.filter((income) => {
      const incomeDate = new Date(income.date)
      return incomeDate.getFullYear() === year && incomeDate.getMonth() === month
    })
    
    const incomeSum = monthIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0)
    
    // Считаем расходы за этот месяц
    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
    })
    
    const expenseSum = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    
    monthlyData.push({
      name: monthLabel,
      income: incomeSum,
      expense: expenseSum,
    })
  }
  
  return monthlyData
}

// Получить последние транзакции (для Dashboard)
export const getRecentTransactions = (limit = 5) => {
  const incomes = getIncomes()
  const expenses = getExpenses()
  
  // Объединяем все транзакции
  const allTransactions = [...incomes, ...expenses]
  
  // Сортируем по дате (новые сначала)
  allTransactions.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })
  
  // Возвращаем первые N
  return allTransactions.slice(0, limit)
}

// Получить все транзакции с фильтрацией
export const getFilteredTransactions = (filters = {}) => {
  const incomes = getIncomes()
  const expenses = getExpenses()
  
  let allTransactions = [...incomes, ...expenses]
  
  // Фильтр по типу
  if (filters.type && filters.type !== 'all') {
    allTransactions = allTransactions.filter((t) => t.type === filters.type)
  }
  
  // Фильтр по категории
  if (filters.category && filters.category !== 'all') {
    allTransactions = allTransactions.filter((t) => t.category === filters.category)
  }
  
  // Фильтр по дате от
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    allTransactions = allTransactions.filter((t) => {
      const tDate = new Date(t.date)
      return tDate >= fromDate
    })
  }
  
  // Фильтр по дате до
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999) // Включаем весь день
    allTransactions = allTransactions.filter((t) => {
      const tDate = new Date(t.date)
      return tDate <= toDate
    })
  }
  
  // Сортируем по дате (новые сначала)
  allTransactions.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })
  
  return allTransactions
}