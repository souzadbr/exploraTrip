import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { AuthService } from '../../services/authService'
import './ResetPassword.css'

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const otp = location.state?.otp || ''
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  // Redirecionar se não tiver email ou OTP
  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password')
    }
  }, [email, otp, navigate])

  // Regex para validação de senha
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const validatePassword = (password: string): string | undefined => {
    if (!passwordRegex.test(password)) {
      return 'Senha não atende aos requisitos'
    }
    return undefined
  }

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (confirmPassword !== password) {
      return 'Senhas não coincidem'
    }
    return undefined
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData]
    let error: string | undefined

    switch (field) {
      case 'password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password)
        break
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)

    const newErrors: {[key: string]: string} = {}

    // Validate all fields
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await AuthService.resetPassword(email, otp, formData.password)

        setIsLoading(false)

        if (result.success) {
          setSuccessMessage('Senha redefinida com sucesso! Redirecionando para o login...')

          // Navegar para login após 2 segundos
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        } else {
          setErrors({ password: result.error || 'Erro ao redefinir senha. Tente novamente.' })
        }

      } catch (error) {
        setIsLoading(false)
        setErrors({ password: 'Erro ao redefinir senha. Tente novamente.' })
        console.error('Erro ao redefinir senha:', error)
      }
    } else {
      setIsLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="reset-password-title">
          Nova senha
        </h1>

        <p className="reset-password-subtitle">
          Crie uma nova senha para sua conta
        </p>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nova senha</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Digite sua nova senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onFocus={() => setShowPasswordRequirements(true)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? "🙄" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            {showPasswordRequirements && !errors.password && (
              <div className="password-requirements">
                Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar nova senha</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirme sua nova senha"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? "🙄" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

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
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
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
