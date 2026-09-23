import { 
  getFromStorage, 
  setToStorage, 
  generateId, 
  getCurrentTimestamp,
  STORAGE_KEYS 
} from './storage'

// Получить все расходы
export const getExpenses = () => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES)
  return expenses || []
}

// Получить расход по ID
export const getExpenseById = (id) => {
  const expenses = getExpenses()
  return expenses.find((expense) => expense.id === id) || null
}

// Добавить новый расход
export const addExpense = (expenseData) => {
  const expenses = getExpenses()
  
  const newExpense = {
    id: generateId(),
    type: 'expense',
    category: expenseData.category,
    categoryLabel: expenseData.categoryLabel || expenseData.category,
    amount: Number(expenseData.amount) || 0,
    date: expenseData.date || getCurrentTimestamp().split('T')[0],
    comment: expenseData.comment || '',
    createdAt: getCurrentTimestamp(),
  }
  
  expenses.push(newExpense)
  setToStorage(STORAGE_KEYS.EXPENSES, expenses)
  
  return newExpense
}

// Обновить существующий расход
export const updateExpense = (id, expenseData) => {
  const expenses = getExpenses()
  const index = expenses.findIndex((expense) => expense.id === id)
  
  if (index === -1) {
    console.error(`Расход с ID ${id} не найден`)
    return null
  }
  
  const updatedExpense = {
    ...expenses[index],
    category: expenseData.category ?? expenses[index].category,
    categoryLabel: expenseData.categoryLabel ?? expenses[index].categoryLabel,
    amount: Number(expenseData.amount) ?? expenses[index].amount,
    date: expenseData.date ?? expenses[index].date,
    comment: expenseData.comment ?? expenses[index].comment,
    updatedAt: getCurrentTimestamp(),
  }
  
  expenses[index] = updatedExpense
  setToStorage(STORAGE_KEYS.EXPENSES, expenses)
  
  return updatedExpense
}

// Удалить расход по ID
export const deleteExpense = (id) => {
  const expenses = getExpenses()
  const filteredExpenses = expenses.filter((expense) => expense.id !== id)
  
  if (filteredExpenses.length === expenses.length) {
    console.error(`Расход с ID ${id} не найден`)
    return false
  }
  
  setToStorage(STORAGE_KEYS.EXPENSES, filteredExpenses)
  return true
}

// Получить общую сумму расходов
export const getTotalExpense = () => {
  const expenses = getExpenses()
  return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
}

// Получить расходы за период (по дате)
export const getExpensesByDateRange = (dateFrom, dateTo) => {
  const expenses = getExpenses()
  
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo) : new Date(8640000000000000) // Максимальная дата
    
    return expenseDate >= from && expenseDate <= to
  })
}