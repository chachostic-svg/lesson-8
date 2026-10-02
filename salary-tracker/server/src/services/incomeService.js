import crypto from 'crypto'
import { getDb } from '../db/connection.js'
import { createNotFoundError } from '../middleware/errorHandler.js'

// Маппинг из snake_case в camelCase
function mapToCamelCase(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    date: row.date,
    category: row.category,
    comment: row.comment || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Получить все доходы пользователя с пагинацией и фильтрами
export async function getAllIncomes(userId, { page, limit, offset, filters = {} }) {
  const db = await getDb()
  
  // Строим WHERE-условия
  const conditions = ['user_id = ?']
  const params = [userId]

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

  const whereClause = `WHERE ${conditions.join(' AND ')}`

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

// Получить доход по ID (только если он принадлежит пользователю)
export async function getIncomeById(userId, id) {
  const db = await getDb()
  const row = await db.get('SELECT * FROM incomes WHERE id = ? AND user_id = ?', [id, userId])
  
  if (!row) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }
  
  return mapToCamelCase(row)
}

// Создать новый доход
export async function createIncome(userId, incomeData) {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const query = `
    INSERT INTO incomes (id, user_id, amount, date, category, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.run(query, [
    id,
    userId,
    Number(incomeData.amount),
    incomeData.date,
    incomeData.category,
    incomeData.comment || '',
    now,
    now,
  ])

  return getIncomeById(userId, id)
}

// Обновить существующий доход (только если он принадлежит пользователю)
export async function updateIncome(userId, id, incomeData) {
  const db = await getDb()
  const now = new Date().toISOString()

  // Проверяем, существует ли запись и принадлежит ли она пользователю
  const existing = await db.get('SELECT * FROM incomes WHERE id = ? AND user_id = ?', [id, userId])
  if (!existing) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }

  const query = `
    UPDATE incomes
    SET amount = ?, date = ?, category = ?, comment = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `

  await db.run(query, [
    Number(incomeData.amount ?? existing.amount),
    incomeData.date ?? existing.date,
    incomeData.category ?? existing.category,
    incomeData.comment ?? existing.comment,
    now,
    id,
    userId,
  ])

  return getIncomeById(userId, id)
}

// Удалить доход по ID (только если он принадлежит пользователю)
export async function deleteIncome(userId, id) {
  const db = await getDb()
  
  const result = await db.run('DELETE FROM incomes WHERE id = ? AND user_id = ?', [id, userId])
  
  if (result.changes === 0) {
    throw createNotFoundError(`Доход с ID ${id} не найден`)
  }
  
  return { id, deleted: true }
}