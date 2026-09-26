import crypto from 'crypto'
import { getDb } from '../db/connection.js'
import { createNotFoundError } from '../middleware/errorHandler.js'

// Маппинг из snake_case в camelCase
function mapToCamelCase(row) {
  if (!row) return null
  return {
    id: row.id,
    amount: row.amount,
    date: row.date,
    category: row.category,
    comment: row.comment || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Получить все доходы с пагинацией и фильтрами
export async function getAllIncomes({ page, limit, offset, filters = {} }) {
  const db = await getDb()
  
  // Строим WHERE-условия
  const conditions = []
  const params = []

  if (filters.category) {
    conditions.push('category = ?')
    params.push(filters.category)
  }

  if (filters.dateFrom) {
    conditions.push('date >= ?')
    params.push(filters.dateFrom)
  }

  if (filters.dateTo) {
    conditions.push('date <= ?')
    params.push(filters.dateTo)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Получаем общее количество записей
  const countQuery = `SELECT COUNT(*) as total FROM incomes ${whereClause}`
  const countResult = await db.get(countQuery, params)
  const total = countResult.total

  // Получаем данные с пагинацией
  const query = `
    SELECT * FROM incomes 
    ${whereClause}
    ORDER BY date DESC, created_at DESC
    LIMIT ? OFFSET ?
  `
  
  const rows = await db.all(query, [...params, limit, offset])
  const data = rows.map(mapToCamelCase)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Получить доход по ID
export async function getIncomeById(id) {
  const db = await getDb()
  const row = await db.get('SELECT * FROM incomes WHERE id = ?', [id])
  
  if (!row) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }
  
  return mapToCamelCase(row)
}

// Создать новый доход
export async function createIncome(incomeData) {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const query = `
    INSERT INTO incomes (id, amount, date, category, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  await db.run(query, [
    id,
    Number(incomeData.amount),
    incomeData.date,
    incomeData.category,
    incomeData.comment || '',
    now,
    now,
  ])

  return getIncomeById(id)
}

// Обновить существующий доход
export async function updateIncome(id, incomeData) {
  const db = await getDb()
  const now = new Date().toISOString()

  // Проверяем, существует ли запись
  const existing = await db.get('SELECT * FROM incomes WHERE id = ?', [id])
  if (!existing) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }

  const query = `
    UPDATE incomes
    SET amount = ?, date = ?, category = ?, comment = ?, updated_at = ?
    WHERE id = ?
  `

  await db.run(query, [
    Number(incomeData.amount ?? existing.amount),
    incomeData.date ?? existing.date,
    incomeData.category ?? existing.category,
    incomeData.comment ?? existing.comment,
    now,
    id,
  ])

  return getIncomeById(id)
}

// Удалить доход по ID
export async function deleteIncome(id) {
  const db = await getDb()
  
  const result = await db.run('DELETE FROM incomes WHERE id = ?', [id])
  
  if (result.changes === 0) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }
  
  return { id, deleted: true }
}