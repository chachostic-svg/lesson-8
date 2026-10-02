import React from 'react'
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// Цвета для категорий
const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'
]

function PieChartComponent({ data, title }) {
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
        <div style={{ fontSize: '48px' }}>📊</div>
        <div>Нет данных для отображения</div>
      </div>
    )
  }

  // Форматирование суммы в подсказке
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const formattedValue = new Intl.NumberFormat('ru-RU').format(data.value)
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {data.name}
          </div>
          <div style={{ color: '#6b7280' }}>
            {formattedValue} ₽
          </div>
        </div>
      )
    }
    return null
  }

  // Форматирование легенды
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center'
      }}>
        {payload.map((entry, index) => (
          <li 
            key={`legend-${index}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '14px',
              color: '#6b7280'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            {entry.value}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend content={renderLegend} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChartComponent