import { get, post, put, del } from './api.js'

export async function getIncomes(filters = {}) {
  const result = await get('/incomes', filters)
  return result.data || []
}

export async function getIncomeById(id) {
  const result = await get(`/incomes/${id}`)
  return result.data || null
}

export async function addIncome(incomeData) {
  const result = await post('/incomes', {
    amount: Number(incomeData.amount),
    date: incomeData.date,
    category: incomeData.category,
    comment: incomeData.comment || '',
  })
  return result.data
}

export async function updateIncome(id, incomeData) {
  const payload = {}
  if (incomeData.amount !== undefined) payload.amount = Number(incomeData.amount)
  if (incomeData.date !== undefined) payload.date = incomeData.date
  if (incomeData.category !== undefined) payload.category = incomeData.category
  if (incomeData.comment !== undefined) payload.comment = incomeData.comment

  const result = await put(`/incomes/${id}`, payload)
  return result.data
}

export async function deleteIncome(id) {
  await del(`/incomes/${id}`)
  return true
}

export async function getTotalIncome() {
  const result = await get('/summary/balance')
  return result.data?.totalIncome || 0
}

export async function getIncomesByDateRange(dateFrom, dateTo) {
  const filters = {}
  if (dateFrom) filters.dateFrom = dateFrom
  if (dateTo) filters.dateTo = dateTo
  const result = await get('/incomes', { ...filters, limit: 1000 })
  return result.data || []
}