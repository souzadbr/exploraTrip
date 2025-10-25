import React from 'react'
import { Navigate } from 'react-router-dom'
import { AuthService } from '../services/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Verifica se o usuário está autenticado
  const isAuthenticated = AuthService.isAuthenticated()

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se estiver autenticado, renderiza o componente filho
  return <>{children}</>
}
