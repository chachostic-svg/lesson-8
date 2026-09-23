import React, { useState, useEffect } from 'react'
import styles from './TransactionForm.module.css'

// Fallback-категории — будут заменены на импорт из constants.js позже
const FALLBACK_INCOME_CATEGORIES = [
  { id: 'salary', label: 'Зарплата' },
  { id: 'freelance', label: 'Подработка' },
  { id: 'bonus', label: 'Премия' },
  { id: 'debt_return', label: 'Возврат долга' },
  { id: 'deposit_interest', label: 'Проценты по вкладу' },
  { id: 'gift', label: 'Подарок' },
  { id: 'other', label: 'Прочее' },
]

const FALLBACK_EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Продукты' },
  { id: 'utilities', label: 'Коммуналка' },
  { id: 'rent', label: 'Аренда' },
  { id: 'subscriptions', label: 'Подписки' },
  { id: 'transport', label: 'Транспорт' },
  { id: 'health', label: 'Здоровье' },
  { id: 'clothing', label: 'Одежда' },
  { id: 'entertainment', label: 'Развлечения' },
  { id: 'communication', label: 'Связь' },
  { id: 'other', label: 'Прочее' },
]

// Пытаемся импортировать константы, если они уже существуют
let INCOME_CATEGORIES = FALLBACK_INCOME_CATEGORIES
let EXPENSE_CATEGORIES = FALLBACK_EXPENSE_CATEGORIES

try {
  const constants = require('../../utils/constants.js')
  INCOME_CATEGORIES = constants.INCOME_CATEGORIES || FALLBACK_INCOME_CATEGORIES
  EXPENSE_CATEGORIES = constants.EXPENSE_CATEGORIES || FALLBACK_EXPENSE_CATEGORIES
} catch (e) {
  // Константы ещё не созданы — используем fallback
}

function TransactionForm({ onSubmit, onCancel, editData }) {
  // Определяем начальные значения из editData или по умолчанию
  const initialType = editData?.type || 'expense'
  const initialCategory = editData?.category || ''
  const initialAmount = editData?.amount ?? ''
  const initialDate = editData?.date || new Date().toISOString().split('T')[0]
  const initialComment = editData?.comment || ''

  // Состояния формы
  const [type, setType] = useState(initialType)
  const [category, setCategory] = useState(initialCategory)
  const [amount, setAmount] = useState(initialAmount)
  const [date, setDate] = useState(initialDate)
  const [comment, setComment] = useState(initialComment)

  // Сбрасываем категорию при смене типа
  useEffect(() => {
    setCategory('')
  }, [type])

  // Заполняем форму при изменении editData (режим редактирования)
  useEffect(() => {
    if (editData) {
      setType(editData.type || 'expense')
      setCategory(editData.category || '')
      setAmount(editData.amount ?? '')
      setDate(editData.date || new Date().toISOString().split('T')[0])
      setComment(editData.comment || '')
    }
  }, [editData])

  // Получаем список категорий в зависимости от типа
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault()

    // Валидация
    if (!category || !amount || !date) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    // Находим label категории
    const categoryObj = categories.find((c) => c.id === category)

    const formData = {
      type,
      category,
      categoryLabel: categoryObj?.label || category,
      amount: Number(amount),
      date,
      comment: comment.trim(),
    }

    // Если редактируем — передаём id
    if (editData?.id) {
      formData.id = editData.id
    }

    onSubmit?.(formData)
  }

  // Классы для кнопок типа
  const getIncomeButtonClass = () => {
    const classes = [styles.typeButton]
    if (type === 'income') {
      classes.push(styles.typeButtonActive, styles.typeButtonActiveIncome)
    }
    return classes.join(' ')
  }

  const getExpenseButtonClass = () => {
    const classes = [styles.typeButton]
    if (type === 'expense') {
      classes.push(styles.typeButtonActive, styles.typeButtonActiveExpense)
    }
    return classes.join(' ')
  }

  // Класс для основной кнопки
  const getPrimaryButtonClass = () => {
    const classes = [styles.button, styles.primaryButton]
    if (type === 'income') classes.push(styles.primaryButtonIncome)
    if (type === 'expense') classes.push(styles.primaryButtonExpense)
    return classes.join(' ')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Переключатель типа операции */}
      <div className={styles.typeToggle}>
        <button
          type="button"
          className={getIncomeButtonClass()}
          onClick={() => setType('income')}
        >
          Доход
        </button>
        <button
          type="button"
          className={getExpenseButtonClass()}
          onClick={() => setType('expense')}
        >
          Расход
        </button>
      </div>

      {/* Сетка полей */}
      <div className={styles.fieldsGrid}>
        {/* Категория */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Категория <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            {(categories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Сумма */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Сумма (₽) <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            className={styles.input}
            placeholder="0"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Дата */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Дата <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Комментарий */}
        <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
          <label className={styles.label}>Комментарий</label>
          <textarea
            className={styles.textarea}
            placeholder="Необязательное поле"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={onCancel}
        >
          Отмена
        </button>
        <button type="submit" className={getPrimaryButtonClass()}>
          {editData?.id ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm