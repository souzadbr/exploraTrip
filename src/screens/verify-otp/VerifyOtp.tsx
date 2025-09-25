import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { AuthService } from '../../services/authService'
import './VerifyOtp.css'

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  // Redirecionar se não tiver email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleInputChange = (value: string) => {
    // Permitir apenas números e limitar a 6 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setOtp(numericValue)
    
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
    if (!otp.trim()) {
      setError('Por favor, digite o código de verificação')
      setIsLoading(false)
      return
    }

    if (otp.length !== 6) {
      setError('O código deve ter 6 dígitos')
      setIsLoading(false)
      return
    }

    try {
      const result = await AuthService.verifyOtp(email, otp)

      setIsLoading(false)

      if (result.success) {
        setSuccessMessage('Código verificado com sucesso!')

        // Navegar para tela de nova senha após 1 segundo
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otp } })
        }, 1000)
      } else {
        setError(result.error || 'Código inválido. Tente novamente.')
      }

    } catch (error) {
      setIsLoading(false)
      setError('Código inválido. Tente novamente.')
      console.error('Erro ao verificar OTP:', error)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await AuthService.forgotPassword(email)

      setIsResending(false)

      if (result.success) {
        setSuccessMessage('Novo código enviado! Verifique seu email.')
      } else {
        setError(result.error || 'Erro ao reenviar código. Tente novamente.')
      }

    } catch (error) {
      setIsResending(false)
      setError('Erro ao reenviar código. Tente novamente.')
      console.error('Erro ao reenviar código:', error)
    }
  }

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="verify-otp-title">
          Verificação de e-mail
        </h1>

        <p className="verify-otp-subtitle">
          Digite o código de 6 dígitos enviado para<br />
          <strong>{email}</strong>
        </p>

        <form className="verify-otp-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Código de verificação</label>
            <input
              type="text"
              className="form-input otp-input"
              placeholder="000000"
              value={otp}
              onChange={(e) => handleInputChange(e.target.value)}
              maxLength={6}
              autoComplete="one-time-code"
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
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </button>

          <div className="resend-section">
            <p className="resend-text">Não recebeu o código?</p>
            <button
              type="button"
              onClick={handleResendCode}
              className={`resend-button ${isResending ? 'loading' : ''}`}
              disabled={isResending}
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>

          <div className="back-to-login">
            <Link to="/forgot-password" className="back-link">
              ← Voltar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
