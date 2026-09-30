import { get, post, put, del } from './api.js'

export async function getExpenses(filters = {}) {
  const result = await get('/expenses', filters)
  return result.data || []
}

export async function getExpenseById(id) {
  const result = await get(`/expenses/${id}`)
  return result.data || null
}

export async function addExpense(expenseData) {
  const result = await post('/expenses', {
    amount: Number(expenseData.amount),
    date: expenseData.date,
    category: expenseData.category,
    comment: expenseData.comment || '',
    isRecurring: expenseData.isRecurring || false,
  })
  return result.data
}

export async function updateExpense(id, expenseData) {
  const payload = {}
  if (expenseData.amount !== undefined) payload.amount = Number(expenseData.amount)
  if (expenseData.date !== undefined) payload.date = expenseData.date
  if (expenseData.category !== undefined) payload.category = expenseData.category
  if (expenseData.comment !== undefined) payload.comment = expenseData.comment
  if (expenseData.isRecurring !== undefined) payload.isRecurring = expenseData.isRecurring

  const result = await put(`/expenses/${id}`, payload)
  return result.data
}

export async function deleteExpense(id) {
  await del(`/expenses/${id}`)
  return true
}

export async function getTotalExpense() {
  const result = await get('/summary/balance')
  return result.data?.totalExpense || 0
}

export async function getExpensesByDateRange(dateFrom, dateTo) {
  const filters = {}
  if (dateFrom) filters.dateFrom = dateFrom
  if (dateTo) filters.dateTo = dateTo
  const result = await get('/expenses', { ...filters, limit: 1000 })
  return result.data || []
}