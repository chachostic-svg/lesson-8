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
    isRecurring: Boolean(row.is_recurring),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Получить все расходы пользователя с пагинацией и фильтрами
export async function getAllExpenses(userId, { page, limit, offset, filters = {} }) {
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

  if (filters.isRecurring !== undefined) {
    conditions.push('is_recurring = ?')
    params.push(filters.isRecurring ? 1 : 0)
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  // Получаем общее количество записей
  const countQuery = `SELECT COUNT(*) as total FROM expenses ${whereClause}`
  const countResult = await db.get(countQuery, params)
  const total = countResult.total

  // Получаем данные с пагинацией
  const query = `
    SELECT * FROM expenses 
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

// Получить расход по ID (только если он принадлежит пользователю)
export async function getExpenseById(userId, id) {
  const db = await getDb()
  const row = await db.get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId])
  
  if (!row) {
    throw createNotFoundError(`Расход с ID ${id} не найден`)
  }
  
  return mapToCamelCase(row)
}

// Создать новый расход
export async function createExpense(userId, expenseData) {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const query = `
    INSERT INTO expenses (id, user_id, amount, date, category, comment, is_recurring, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.run(query, [
    id,
    userId,
    Number(expenseData.amount),
    expenseData.date,
    expenseData.category,
    expenseData.comment || '',
    expenseData.isRecurring ? 1 : 0,
    now,
    now,
  ])

  return getExpenseById(userId, id)
}

// Обновить существующий расход (только если он принадлежит пользователю)
export async function updateExpense(userId, id, expenseData) {
  const db = await getDb()
  const now = new Date().toISOString()

  // Проверяем, существует ли запись и принадлежит ли она пользователю
  const existing = await db.get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId])
  if (!existing) {
    throw createNotFoundError(`Расход с ID ${id} не найден`)
  }

  const query = `
    UPDATE expenses
    SET amount = ?, date = ?, category = ?, comment = ?, is_recurring = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `

  await db.run(query, [
    Number(expenseData.amount ?? existing.amount),
    expenseData.date ?? existing.date,
    expenseData.category ?? existing.category,
    expenseData.comment ?? existing.comment,
    expenseData.isRecurring !== undefined ? (expenseData.isRecurring ? 1 : 0) : existing.is_recurring,
    now,
    id,
    userId,
  ])

  return getExpenseById(userId, id)
}

// Удалить расход по ID (только если он принадлежит пользователю)
export async function deleteExpense(userId, id) {
  const db = await getDb()
  
  const result = await db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId])
  
  if (result.changes === 0) {
    throw createNotFoundError(`Расход с ID ${id} не найден`)
  }
  
  return { id, deleted: true }
}