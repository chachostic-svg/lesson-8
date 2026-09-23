import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceCard from '../../components/BalanceCard/BalanceCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import TransactionList from '../../components/TransactionList/TransactionList'
import Modal from '../../components/Modal/Modal'
import TransactionForm from '../../components/TransactionForm/TransactionForm'
import { getTotalIncome } from '../../services/incomeService'
import { getTotalExpense } from '../../services/expenseService'
import { getBalance, getRecentTransactions } from '../../services/summaryService'
import { addIncome } from '../../services/incomeService'
import { addExpense } from '../../services/expenseService'
import styles from './Dashboard.module.css'

function Dashboard() {
  const navigate = useNavigate()
  
  // Состояния данных
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [balance, setBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])
  
  // Состояние модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Загрузка данных
  const loadData = () => {
    setTotalIncome(getTotalIncome())
    setTotalExpense(getTotalExpense())
    setBalance(getBalance())
    setRecentTransactions(getRecentTransactions(5))
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
  const handleSubmit = (formData) => {
    if (formData.type === 'income') {
      addIncome(formData)
    } else {
      addExpense(formData)
    }
    
    // Перезагружаем данные
    loadData()
    setIsModalOpen(false)
  }

  // Обработчик редактирования (переход на страницу истории)
  const handleEdit = (transaction) => {
    navigate('/history')
  }

  // Обработчик удаления
  const handleDelete = (transaction) => {
    if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
      if (transaction.type === 'income') {
        const { deleteIncome } = require('../../services/incomeService')
        deleteIncome(transaction.id)
      } else {
        const { deleteExpense } = require('../../services/expenseService')
        deleteExpense(transaction.id)
      }
      loadData()
    }
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