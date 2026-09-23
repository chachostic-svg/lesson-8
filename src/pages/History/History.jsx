import React, { useState, useEffect } from 'react'
import TransactionList from '../../components/TransactionList/TransactionList'
import EmptyState from '../../components/EmptyState/EmptyState'
import Modal from '../../components/Modal/Modal'
import TransactionForm from '../../components/TransactionForm/TransactionForm'
import { getFilteredTransactions } from '../../services/summaryService'
import { addIncome, updateIncome, deleteIncome } from '../../services/incomeService'
import { addExpense, updateExpense, deleteExpense } from '../../services/expenseService'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants'
import styles from './History.module.css'

function History() {
  // Состояния данных
  const [transactions, setTransactions] = useState([])
  
  // Состояния фильтров
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Загрузка данных с фильтрами
  const loadData = () => {
    const filters = {
      type: filterType,
      category: filterCategory,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    }
    
    const filtered = getFilteredTransactions(filters)
    setTransactions(filtered)
  }

  // Загружаем данные при монтировании и изменении фильтров
  useEffect(() => {
    loadData()
  }, [filterType, filterCategory, filterDateFrom, filterDateTo])

  // Обработчики фильтров
  const handleResetFilters = () => {
    setFilterType('all')
    setFilterCategory('all')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  // Получаем список категорий для фильтра в зависимости от типа
  const getFilterCategories = () => {
    if (filterType === 'all') {
      // Показываем все категории
      const allCategories = [
        ...INCOME_CATEGORIES.map((c) => ({ ...c, type: 'income' })),
        ...EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'expense' })),
      ]
      return allCategories
    } else if (filterType === 'income') {
      return INCOME_CATEGORIES
    } else {
      return EXPENSE_CATEGORIES
    }
  }

  // Обработчик открытия формы для добавления
  const handleAddClick = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  // Обработчик открытия формы для редактирования
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  // Обработчик закрытия формы
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  // Обработчик отправки формы
  const handleSubmit = (formData) => {
    if (editingTransaction) {
      // Режим редактирования
      if (formData.type === 'income') {
        updateIncome(editingTransaction.id, formData)
      } else {
        updateExpense(editingTransaction.id, formData)
      }
    } else {
      // Режим добавления
      if (formData.type === 'income') {
        addIncome(formData)
      } else {
        addExpense(formData)
      }
    }
    
    // Перезагружаем данные
    loadData()
    handleCloseModal()
  }

  // Обработчик удаления
  const handleDelete = (transaction) => {
    if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
      if (transaction.type === 'income') {
        deleteIncome(transaction.id)
      } else {
        deleteExpense(transaction.id)
      }
      loadData()
    }
  }

  return (
    <div className={styles.history}>
      {/* Заголовок страницы */}
      <div className={styles.header}>
        <h1 className={styles.title}>История операций</h1>
        <button className={styles.addButton} onClick={handleAddClick}>
          <span>+</span>
          <span>Добавить операцию</span>
        </button>
      </div>

      {/* Панель фильтров */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип операции</label>
          <select 
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setFilterCategory('all') // Сбрасываем категорию при смене типа
            }}
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Категория</label>
          <select 
            className={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {getFilterCategories().map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Дата с</label>
          <input 
            type="date"
            className={styles.filterInput}
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Дата по</label>
          <input 
            type="date"
            className={styles.filterInput}
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>

        <button 
          className={styles.resetButton}
          onClick={handleResetFilters}
        >
          Сбросить
        </button>
      </div>

      {/* Список транзакций */}
      <div className={styles.listContainer}>
        <TransactionList 
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Редактировать операцию' : 'Новая операция'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          editData={editingTransaction}
        />
      </Modal>
    </div>
  )
}

export default History