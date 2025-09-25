import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { AuthService } from '../../services/authService'
import './ForgotPassword.css'

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (value: string) => {
    setEmail(value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    // Validação básica
    if (!email.trim()) {
      setError('Por favor, digite seu email')
      setIsLoading(false)
      return
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido')
      setIsLoading(false)
      return
    }

    try {
      const result = await AuthService.forgotPassword(email)

      setIsLoading(false)

      if (result.success) {
        setSuccessMessage('Código de verificação enviado! Verifique seu email.')

        // Navegar para tela de OTP após 2 segundos
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } })
        }, 2000)
      } else {
        setError(result.error || 'Erro ao enviar email. Tente novamente.')
      }

    } catch (error) {
      setIsLoading(false)
      setError('Erro ao enviar email. Tente novamente.')
      console.error('Erro ao solicitar recuperação de senha:', error)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="forgot-password-title">
          Esqueceu a senha?
        </h1>

        <p className="forgot-password-subtitle">
          Digite seu email e enviaremos um código de verificação
        </p>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </button>

          <div className="back-to-login">
            <Link to="/login" className="back-link">
              ← Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
