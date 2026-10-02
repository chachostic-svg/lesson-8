import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../../services/authService'

function ProtectedRoute({ children }) {
  const token = getToken()

  // Если токена нет — перенаправляем на страницу входа
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Если токен есть — показываем защищённый контент
  return children
}

export default ProtectedRoute