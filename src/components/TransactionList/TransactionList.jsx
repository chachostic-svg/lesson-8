import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import styles from './TransactionList.module.css'

// Иконки для категорий (fallback, пока не подключены константы)
const CATEGORY_ICONS = {
  salary: '💼',
  freelance: '💻',
  bonus: '🎁',
  debt_return: '🤝',
  deposit_interest: '🏦',
  gift: '🎀',
  groceries: '🛒',
  utilities: '💡',
  rent: '🏠',
  subscriptions: '📱',
  transport: '🚗',
  health: '⚕️',
  clothing: '👕',
  entertainment: '🎬',
  communication: '📞',
  other: '📦',
}

function TransactionList({ transactions, onEdit, onDelete }) {
  // Fallback для пустого массива
  const items = transactions || []

  // Если список пуст — показываем заглушку
  if (items.length === 0) {
    return (
      <EmptyState 
        title="Нет операций"
        description="Добавьте первую операцию, чтобы начать учёт финансов"
        icon="📋"
      />
    )
  }

  // Форматирование суммы
  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('ru-RU').format(amount ?? 0)
    const sign = type === 'expense' ? '-' : '+'
    return `${sign}${formatted} ₽`
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={styles.list}>
      {(items || []).map((transaction) => {
        const icon = CATEGORY_ICONS[transaction.category] || '📦'
        const amountClass = transaction.type === 'income' ? styles.income : styles.expense

        return (
          <div key={transaction.id} className={styles.transaction}>
            {/* Иконка категории */}
            <div className={styles.icon}>{icon}</div>

            {/* Информация о транзакции */}
            <div className={styles.info}>
              <div className={styles.category}>
                {transaction.categoryLabel || transaction.category}
              </div>
              {transaction.comment && (
                <div className={styles.comment}>{transaction.comment}</div>
              )}
            </div>

            {/* Сумма и дата */}
            <div className={styles.right}>
              <div className={`${styles.amount} ${amountClass}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
              <div className={styles.date}>
                {formatDate(transaction.date)}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className={styles.actions}>
              {onEdit && (
                <button 
                  className={styles.actionButton}
                  onClick={() => onEdit(transaction)}
                  aria-label="Редактировать"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onDelete(transaction)}
                  aria-label="Удалить"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TransactionList