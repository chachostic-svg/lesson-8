// Форматирование суммы в рубли
export const formatCurrency = (amount) => {
  const value = amount ?? 0
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Форматирование суммы без символа валюты
export const formatNumber = (amount) => {
  const value = amount ?? 0
  return new Intl.NumberFormat('ru-RU').format(value)
}

// Форматирование даты в короткий формат (дд.мм.гггг)
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Форматирование даты в длинный формат (дд месяц гггг)
export const formatDateLong = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Форматирование даты для графиков (мм.гг)
export const formatDateShort = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    month: '2-digit',
    year: '2-digit',
  })
}

// Получение названия месяца
export const getMonthName = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    month: 'long',
  })
}

// Получение названия месяца в родительном падеже (для "Январь 2024")
export const getMonthYear = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
}

// Преобразование даты в формат YYYY-MM-DD для input[type="date"]
export const toInputDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Получение текущей даты в формате YYYY-MM-DD
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}