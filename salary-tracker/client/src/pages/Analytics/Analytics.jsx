import React, { useState, useEffect, useCallback } from 'react'
import PieChartComponent from '../../components/PieChart/PieChart'
import BarChartComponent from '../../components/BarChart/BarChart'
import { getByCategory, getMonthlySummary } from '../../services/summaryService'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CHART_COLORS } from '../../utils/constants'
import styles from './Analytics.module.css'

// Период: подпись в интерфейсе, число месяцев для столбчатой диаграммы и
// границы дат для круговых. Раньше период применялся только к столбчатой
// диаграмме, а круговые всегда показывали данные за всё время.
const PERIODS = [
  { id: 'week', label: 'Неделя', months: 1, days: 7 },
  { id: 'month', label: 'Полгода', months: 6 },
  { id: 'quarter', label: 'Квартал', months: 3 },
  { id: 'year', label: 'Год', months: 12 },
]

// Даты сравниваются с колонкой date как со строкой, поэтому собираем YYYY-MM-DD
// вручную. toISOString() переводит в UTC и у местного времени около полуночи
// сдвигает дату на день назад.
const toDateString = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function getDateRange(periodId) {
  const today = new Date()
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[1]

  if (period.days) {
    const from = new Date(today)
    from.setDate(from.getDate() - (period.days - 1))
    return { dateFrom: toDateString(from), dateTo: toDateString(today) }
  }

  // Считаем с первого числа месяца, который отстоит на months - 1 месяцев назад
  const from = new Date(today.getFullYear(), today.getMonth() - (period.months - 1), 1)
  return { dateFrom: toDateString(from), dateTo: toDateString(today) }
}

// API отдаёт в поле name идентификатор категории (utilities, groceries и т.п.),
// поэтому подменяем его на русское название и закрепляем цвет за категорией.
const decorateCategories = (rows, type) => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return rows.map((row) => {
    const index = list.findIndex((category) => category.id === row.name)
    const category = index >= 0 ? list[index] : null

    return {
      name: category ? category.label : row.name,
      value: row.value,
      color: CHART_COLORS[(index >= 0 ? index : 0) % CHART_COLORS.length],
    }
  })
}

function Analytics() {
  // Период отображения
  const [period, setPeriod] = useState('month')
  
  // Состояния данных
  const [expenseCategoryData, setExpenseCategoryData] = useState([])
  const [incomeCategoryData, setIncomeCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const months = (PERIODS.find((p) => p.id === period) || PERIODS[1]).months

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const range = getDateRange(period)
      
      // Выполняем все запросы параллельно
      const [expensesByCategory, incomesByCategory, monthly] = await Promise.all([
        getByCategory('expense', range),
        getByCategory('income', range),
        getMonthlySummary(months),
      ])
      
      setExpenseCategoryData(decorateCategories(expensesByCategory, 'expense'))
      setIncomeCategoryData(decorateCategories(incomesByCategory, 'income'))
      setMonthlyData(monthly)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError(err.message || 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [period, months])

  // Загружаем данные при монтировании и изменении периода
  useEffect(() => {
    loadData()
  }, [loadData])

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
          {PERIODS.map((p) => (
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
          <PieChartComponent data={expenseCategoryData} />
        </div>

        {/* Круговая диаграмма доходов по категориям */}
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Доходы по категориям</h2>
          <PieChartComponent data={incomeCategoryData} />
        </div>

        {/* Столбчатый график доходов и расходов по месяцам */}
        <div className={`${styles.chartContainer} ${styles.chartFullWidth}`}>
          <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
          <BarChartComponent data={monthlyData} />
        </div>
      </div>
    </div>
  )
}

export default Analytics