import React, { useState, useEffect } from 'react'
import TransactionList from '../../components/TransactionList/TransactionList'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Состояния фильтров
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Загрузка данных с фильтрами
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        type: filterType !== 'all' ? filterType : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      }
      
      const filtered = await getFilteredTransactions(filters)
      setTransactions(filtered)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
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
  const handleSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        // Режим редактирования
        if (formData.type === 'income') {
          await updateIncome(editingTransaction.id, formData)
        } else {
          await updateExpense(editingTransaction.id, formData)
        }
      } else {
        // Режим добавления
        if (formData.type === 'income') {
          await addIncome(formData)
        } else {
          await addExpense(formData)
        }
      }
      
      // Перезагружаем данные
      await loadData()
      handleCloseModal()
    } catch (err) {
      console.error('Ошибка сохранения:', err)
      alert(`Не удалось сохранить операцию: ${err.message}`)
    }
  }

  // Обработчик удаления
  const handleDelete = async (transaction) => {
    if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        if (transaction.type === 'income') {
          await deleteIncome(transaction.id)
        } else {
          await deleteExpense(transaction.id)
        }
        
        // Перезагружаем данные
        await loadData()
      } catch (err) {
        console.error('Ошибка удаления:', err)
        alert(`Не удалось удалить операцию: ${err.message}`)
      }
    }
  }

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.history}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Загрузка данных...
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.history}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div>{error}</div>
          <button 
            onClick={loadData}
            style={{ marginTop: '16px', padding: '8px 16px' }}
          >
            Повторить
          </button>
        </div>
      </div>
    )
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