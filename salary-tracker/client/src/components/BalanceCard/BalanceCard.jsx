import React from 'react'
import styles from './BalanceCard.module.css'

function BalanceCard({ title, amount, color = 'balance' }) {
  // Fallback для amount
  const displayAmount = amount ?? 0
  
  // Форматирование числа с разделителями тысяч
  const formattedAmount = new Intl.NumberFormat('ru-RU').format(displayAmount)
  
  // Определяем класс для цвета
  const colorClass = styles[color] || styles.balance

  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.amount}>
        {formattedAmount} ₽
      </div>
    </div>
  )
}

export default BalanceCard