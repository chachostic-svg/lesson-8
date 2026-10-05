import React from 'react'
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import { CHART_COLORS } from '../../utils/constants'

function PieChartComponent({ data }) {
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

  // Подсказка: название категории, сумма и доля
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0]
      const percent = typeof point.percent === 'number' ? point.percent * 100 : null
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {point.name}
          </div>
          <div style={{ color: '#6b7280' }}>
            {formatCurrency(point.value)}
          </div>
          {percent !== null && (
            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
              {percent.toFixed(1)}% от суммы
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Легенда: цвет, название и сумма. Название берём из chartData по индексу,
  // чтобы не зависеть от того, что recharts кладёт в payload.
  const renderLegend = ({ payload }) => {
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
        {payload.map((entry, index) => {
          const datum = chartData[index]
          if (!datum) return null
          return (
            <li 
              key={`legend-${datum.name || index}`}
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
                backgroundColor: datum.color || entry.color,
                borderRadius: '2px'
              }} />
              {datum.name}
              <span style={{ color: '#9ca3af' }}>{formatCurrency(datum.value)}</span>
            </li>
          )
        })}
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
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${entry.name || index}`} 
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
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