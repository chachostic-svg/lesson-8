// Ключи для localStorage
export const STORAGE_KEYS = {
  INCOMES: 'incomes',
  EXPENSES: 'expenses',
}

// Получить данные из localStorage
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Ошибка чтения из localStorage (ключ: ${key}):`, error)
    return null
  }
}

// Сохранить данные в localStorage
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Ошибка записи в localStorage (ключ: ${key}):`, error)
    return false
  }
}

// Удалить данные из localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Ошибка удаления из localStorage (ключ: ${key}):`, error)
    return false
  }
}

// Очистить весь localStorage
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Ошибка очистки localStorage:', error)
    return false
  }
}

// Генерация уникального идентификатора
export const generateId = () => {
  // Используем crypto.randomUUID() если доступен
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback: генерируем UUID вручную
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Получить текущую дату в формате ISO
export const getCurrentTimestamp = () => {
  return new Date().toISOString()
}