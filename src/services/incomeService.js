import { 
  getFromStorage, 
  setToStorage, 
  generateId, 
  getCurrentTimestamp,
  STORAGE_KEYS 
} from './storage'

// Получить все доходы
export const getIncomes = () => {
  const incomes = getFromStorage(STORAGE_KEYS.INCOMES)
  return incomes || []
}

// Получить доход по ID
export const getIncomeById = (id) => {
  const incomes = getIncomes()
  return incomes.find((income) => income.id === id) || null
}

// Добавить новый доход
export const addIncome = (incomeData) => {
  const incomes = getIncomes()
  
  const newIncome = {
    id: generateId(),
    type: 'income',
    category: incomeData.category,
    categoryLabel: incomeData.categoryLabel || incomeData.category,
    amount: Number(incomeData.amount) || 0,
    date: incomeData.date || getCurrentTimestamp().split('T')[0],
    comment: incomeData.comment || '',
    createdAt: getCurrentTimestamp(),
  }
  
  incomes.push(newIncome)
  setToStorage(STORAGE_KEYS.INCOMES, incomes)
  
  return newIncome
}

// Обновить существующий доход
export const updateIncome = (id, incomeData) => {
  const incomes = getIncomes()
  const index = incomes.findIndex((income) => income.id === id)
  
  if (index === -1) {
    console.error(`Доход с ID ${id} не найден`)
    return null
  }
  
  const updatedIncome = {
    ...incomes[index],
    category: incomeData.category ?? incomes[index].category,
    categoryLabel: incomeData.categoryLabel ?? incomes[index].categoryLabel,
    amount: Number(incomeData.amount) ?? incomes[index].amount,
    date: incomeData.date ?? incomes[index].date,
    comment: incomeData.comment ?? incomes[index].comment,
    updatedAt: getCurrentTimestamp(),
  }
  
  incomes[index] = updatedIncome
  setToStorage(STORAGE_KEYS.INCOMES, incomes)
  
  return updatedIncome
}

// Удалить доход по ID
export const deleteIncome = (id) => {
  const incomes = getIncomes()
  const filteredIncomes = incomes.filter((income) => income.id !== id)
  
  if (filteredIncomes.length === incomes.length) {
    console.error(`Доход с ID ${id} не найден`)
    return false
  }
  
  setToStorage(STORAGE_KEYS.INCOMES, filteredIncomes)
  return true
}

// Получить общую сумму доходов
export const getTotalIncome = () => {
  const incomes = getIncomes()
  return incomes.reduce((sum, income) => sum + (income.amount || 0), 0)
}

// Получить доходы за период (по дате)
export const getIncomesByDateRange = (dateFrom, dateTo) => {
  const incomes = getIncomes()
  
  return incomes.filter((income) => {
    const incomeDate = new Date(income.date)
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo) : new Date(8640000000000000) // Максимальная дата
    
    return incomeDate >= from && incomeDate <= to
  })
}