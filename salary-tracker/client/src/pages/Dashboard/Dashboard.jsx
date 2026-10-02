import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceCard from '../../components/BalanceCard/BalanceCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import TransactionList from '../../components/TransactionList/TransactionList'
import Modal from '../../components/Modal/Modal'
import TransactionForm from '../../components/TransactionForm/TransactionForm'
import { getTotalIncome, addIncome, deleteIncome } from '../../services/incomeService'
import { getTotalExpense, addExpense, deleteExpense } from '../../services/expenseService'
import { getBalance, getRecentTransactions } from '../../services/summaryService'
import styles from './Dashboard.module.css'

function Dashboard() {
  const navigate = useNavigate()
  
  // Состояния данных
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [balance, setBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Выполняем все запросы параллельно
      const [income, expense, balanceData, recent] = await Promise.all([
        getTotalIncome(),
        getTotalExpense(),
        getBalance(),
        getRecentTransactions(5),
      ])
      
      setTotalIncome(income)
      setTotalExpense(expense)
      setBalance(balanceData.balance)
      setRecentTransactions(recent)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData()
  }, [])

  // Обработчик открытия формы
  const handleAddClick = () => {
    setIsModalOpen(true)
  }

  // Обработчик закрытия формы
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Обработчик отправки формы
  const handleSubmit = async (formData) => {
    try {
      if (formData.type === 'income') {
        await addIncome(formData)
      } else {
        await addExpense(formData)
      }
      
      // Перезагружаем данные
      await loadData()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Ошибка сохранения:', err)
      alert(`Не удалось сохранить операцию: ${err.message}`)
    }
  }

  // Обработчик редактирования (переход на страницу истории)
  const handleEdit = (transaction) => {
    navigate('/history')
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
      <div className={styles.dashboard}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Загрузка данных...
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.dashboard}>
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
    <div className={styles.dashboard}>
      {/* Заголовок с кнопкой добавления */}
      <div className={styles.header}>
        <h1 className={styles.title}>Обзор</h1>
        <button className={styles.addButton} onClick={handleAddClick}>
          <span>+</span>
          <span>Добавить операцию</span>
        </button>
      </div>

      {/* Карточки баланса */}
      <div className={styles.cardsGrid}>
        <BalanceCard 
          title="Доходы" 
          amount={totalIncome} 
          color="income" 
        />
        <BalanceCard 
          title="Расходы" 
          amount={totalExpense} 
          color="expense" 
        />
        <BalanceCard 
          title="Баланс" 
          amount={balance} 
          color="balance" 
        />
      </div>

      {/* Последние операции */}
      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Последние операции</h2>
        <TransactionList 
          transactions={recentTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Новая операция"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default Dashboard