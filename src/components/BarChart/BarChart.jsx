import React from 'react'
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts'

function BarChartComponent({ data, title }) {
  // Fallback для пустых данных
  const chartData = data || []

  // Если данных нет — показываем заглушку
  if (chartData.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '300px',
        color: '#9ca3af',
        fontSize: '14px',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ fontSize: '48px' }}>📈</div>
        <div>Нет данных для отображения</div>
      </div>
    )
  }

  // Форматирование суммы в подсказке
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
            {label}
          </div>
          {payload.map((entry, index) => {
            const formattedValue = new Intl.NumberFormat('ru-RU').format(entry.value)
            return (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '4px'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: entry.color,
                  borderRadius: '2px'
                }} />
                <span style={{ color: '#6b7280' }}>
                  {entry.name}: {formattedValue} ₽
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  // Форматирование значений на оси Y
  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value
  }

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            tickFormatter={formatYAxis}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={renderTooltip} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey="income" 
            name="Доходы" 
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            name="Расходы" 
            fill="#ef4444" 
            radius={[8, 8, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartComponent