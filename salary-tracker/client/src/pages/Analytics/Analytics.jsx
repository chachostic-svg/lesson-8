import React, { useState, useEffect } from 'react'
import PieChartComponent from '../../components/PieChart/PieChart'
import BarChartComponent from '../../components/BarChart/BarChart'
import { getByCategory, getMonthlySummary } from '../../services/summaryService'
import styles from './Analytics.module.css'

function Analytics() {
  // Период отображения
  const [period, setPeriod] = useState('month')
  
  // Состояния данных
  const [expenseCategoryData, setExpenseCategoryData] = useState([])
  const [incomeCategoryData, setIncomeCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Определяем количество месяцев в зависимости от периода
      let months = 6
      if (period === 'week') months = 1
      if (period === 'month') months = 6
      if (period === 'quarter') months = 3
      if (period === 'year') months = 12
      
      // Выполняем все запросы параллельно
      const [expensesByCategory, incomesByCategory, monthly] = await Promise.all([
        getByCategory('expense'),
        getByCategory('income'),
        getMonthlySummary(months),
      ])
      
      setExpenseCategoryData(expensesByCategory)
      setIncomeCategoryData(incomesByCategory)
      setMonthlyData(monthly)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  // Загружаем данные при монтировании и изменении периода
  useEffect(() => {
    loadData()
  }, [period])

  const periods = [
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Полгода' },
    { id: 'quarter', label: 'Квартал' },
    { id: 'year', label: 'Год' },
  ]

  // Показываем индикатор загрузки
  if (loading) {
    return (
      <div className={styles.analytics}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Загрузка данных...
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={styles.analytics}>
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
    <div className={styles.analytics}>
      {/* Заголовок страницы */}
      <h1 className={styles.title}>Аналитика</h1>

      {/* Панель выбора периода */}
      <div className={styles.controls}>
        <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Период:
        </span>
        <div className={styles.periodGroup}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.periodButton} ${period === p.id ? styles.periodButtonActive : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка графиков */}
      <div className={styles.chartsGrid}>
        {/* Круговая диаграмма расходов по категориям */}
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Расходы по категориям</h2>
          <PieChartComponent 
            data={expenseCategoryData} 
            title="Расходы по категориям" 
          />
        </div>

        {/* Круговая диаграмма доходов по категориям */}
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Доходы по категориям</h2>
          <PieChartComponent 
            data={incomeCategoryData} 
            title="Доходы по категориям" 
          />
        </div>

        {/* Столбчатый график доходов и расходов по месяцам */}
        <div className={`${styles.chartContainer} ${styles.chartFullWidth}`}>
          <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
          <BarChartComponent 
            data={monthlyData} 
            title="Доходы и расходы" 
          />
        </div>
      </div>
    </div>
  )
}

export default Analytics