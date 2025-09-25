import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { AuthService } from '../../services/authService'
import './VerifyRegistration.css'

export const VerifyRegistration: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = location.state?.email || ''

  const [email, setEmail] = useState(emailFromState)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(!emailFromState)
  const [userFound, setUserFound] = useState(false)

  // Redirecionar apenas se já estiver autenticado
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleInputChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setConfirmationCode(numericValue)
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    if (!confirmationCode.trim()) {
      setError('Por favor, digite o código de verificação')
      setIsLoading(false)
      return
    }

    if (confirmationCode.length !== 6) {
      setError('O código deve ter 6 dígitos')
      setIsLoading(false)
      return
    }

    if (!email.trim()) {
      setError('Email é obrigatório')
      setIsLoading(false)
      return
    }

    try {
      // Chamar API real para confirmar cadastro
      const result = await AuthService.confirmRegistration(email, confirmationCode)

      setIsLoading(false)

      if (result.success) {
        setSuccessMessage('Conta ativada com sucesso! Entrando na aplicação...')

        // Se a API retornar dados do usuário, usar eles
        if (result.data) {
          AuthService.saveAuthData(result.data)
        } else {
          // Fallback: criar dados básicos do usuário
          const userData = {
            id: 'user-id',
            name: 'Usuário',
            email: email,
            token: 'temp-token'
          }
          AuthService.saveAuthData(userData)
        }

        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Código inválido. Tente novamente.')
      }

    } catch (error) {
      setIsLoading(false)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      console.error('Erro ao confirmar cadastro:', error)
    }
  }

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError('Por favor, digite seu email primeiro.')
      return
    }

    setError('')
    setSuccessMessage('')
    setIsResending(true)

    try {
      // Usar o endpoint real de reenvio de código
      const result = await AuthService.resendActivationCode(email)

      setIsResending(false)

      if (result.success) {
        setSuccessMessage(result.message || 'Código de ativação reenviado com sucesso! Verifique seu email.')
        setUserFound(true)
        // Permitir inserir código
        if (showEmailInput) {
          setShowEmailInput(false)
        }
      } else {
        setError(result.error || 'Erro ao reenviar código.')
      }
    } catch (error) {
      setIsResending(false)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      console.error('Erro ao reenviar código:', error)
    }
  }

  return (
    <div className="verify-registration-container">
      <div className="verify-registration-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="verify-registration-title">
          Confirme seu cadastro
        </h1>

        <p className="verify-registration-subtitle">
          {showEmailInput
            ? 'Digite seu email para reenviar o código de confirmação'
            : `Digite o código de 6 dígitos enviado para ${email}`
          }
        </p>

        <form className="verify-registration-form" onSubmit={handleSubmit}>
          {showEmailInput && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {!showEmailInput && (
            <div className="form-group">
              <label className="form-label">Código de confirmação</label>
              <input
                type="text"
                className="form-input confirmation-input"
                placeholder="000000"
                value={confirmationCode}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {!showEmailInput && (
            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar código'}
            </button>
          )}

          <div className="resend-section">
            <p className="resend-text">{showEmailInput ? 'Verificar se usuário existe:' : 'Problemas com o código?'}</p>
            <button
              type="button"
              onClick={handleResendCode}
              className={`resend-button ${isResending ? 'loading' : ''}`}
              disabled={isResending}
            >
              {isResending ? 'Reenviando...' : (showEmailInput ? 'Verificar usuário' : 'Reenviar código')}
            </button>
          </div>

          {showEmailInput && (
            <div className="email-toggle-section">
              <p className="resend-text">Já tem o código?</p>
              <button
                type="button"
                onClick={() => {
                  if (email.trim()) {
                    setShowEmailInput(false)
                    setError('')
                  } else {
                    setError('Digite seu email primeiro.')
                  }
                }}
                className="resend-button"
              >
                Inserir código
              </button>
            </div>
          )}

          <div className="back-to-register">
            <Link to="/register" className="back-link">
              ← Voltar para cadastro
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}




