import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './Register.css'
import {
  mapApiFieldErrors,
  inferFieldFromErrorMessage,
  getHttpErrorMessage,
  getConnectionErrorMessage
} from '../../utils/apiErrorHandler'
import { AuthService } from '../../services/authService'
import { buildApiUrl, API_CONFIG } from '../../config/api'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}



interface ApiResponse {
  data: {
    id: string
    name: string
    emailVal: string
    password: string
  }
  isSuccess: boolean
  message: string
}

interface ApiErrorResponse {
  data: null
  isSuccess: false
  message: string
  errors?: {
    [field: string]: string[]
  }
}

interface ValidationErrorResponse {
  type: string
  title: string
  status: number
  errors: {
    [field: string]: string[]
  }
  traceId: string
}

interface ServerErrorResponse {
  title: string
  status: number
}

export const Register: React.FC = () => {
  const navigate = useNavigate()

  // Verifica se o usuário já está autenticado ao carregar o componente
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)

  // Estados para confirmação de código

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const validateFullName = (name: string): string | undefined => {
    const nameParts = name.trim().split(' ').filter(part => part.length > 0)
    if (nameParts.length < 2) {
      return 'Digite nome e sobrenome completos'
    }
    if (nameParts.some(part => part.length < 2)) {
      return 'Nome e sobrenome devem ter pelo menos 2 caracteres cada'
    }
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!emailRegex.test(email)) {
      return 'Email inválido'
    }
    return undefined
  }



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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof FormData) => {
    const value = formData[field]
    let error: string | undefined

    switch (field) {
      case 'fullName':
        error = validateFullName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
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

  const registerUser = async (userData: { name: string; emailVal: string; password: string }) => {
    try {
      // Converter para o formato esperado pelo backend (campos com maiúscula)
      const backendData = {
        Name: userData.name,
        EmailVal: userData.emailVal,
        Password: userData.password
      }

      console.log('Enviando dados para API:', backendData)

      const response = await fetch('http://localhost:5052/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      })

      console.log('Resposta da API - Status:', response.status)
      console.log('Resposta da API - Headers:', response.headers)

      // Parse response body for both success and error cases
      let responseData: ApiResponse | ApiErrorResponse | ValidationErrorResponse | ServerErrorResponse
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor. Tente novamente.',
          fieldErrors: {}
        }
      }

      if (!response.ok) {
        // Handle different error response formats from the API

        if (response.status === 400) {
          // Check if it's a validation error response (ASP.NET format)
          if ('errors' in responseData && 'title' in responseData) {
            const validationError = responseData as ValidationErrorResponse
            return {
              success: false,
              error: validationError.title || 'Dados inválidos fornecidos.',
              fieldErrors: validationError.errors || {}
            }
          }

          // Check if it's a simple API error response
          if ('isSuccess' in responseData) {
            const apiError = responseData as ApiErrorResponse
            return {
              success: false,
              error: apiError.message || 'Dados inválidos.',
              fieldErrors: apiError.errors || {}
            }
          }
        }

        if (response.status === 500) {
          // Handle server error response - provavelmente email duplicado
          return {
            success: false,
            error: 'Este email já pode estar cadastrado. Se você já se cadastrou antes, vá para "Confirmar Cadastro" para ativar sua conta.',
            fieldErrors: { email: 'Email pode já estar em uso' },
            suggestVerification: true
          }
        }

        // Fallback for other error types
        const errorMessage = getHttpErrorMessage(response.status)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      const result = responseData as ApiResponse
      if (result.isSuccess) {
        return { success: true, data: result.data, fieldErrors: {} }
      } else {
        return {
          success: false,
          error: result.message || 'Erro desconhecido do servidor',
          fieldErrors: {}
        }
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Erro detalhado:', error)

      // Use utility functions for consistent error handling
      const errorMessage = getConnectionErrorMessage(error)

      return {
        success: false,
        error: errorMessage,
        fieldErrors: {}
      }
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous messages
    setSuccessMessage('')
    setErrors({})

    const newErrors: FormErrors = {}

    // Validate all fields
    const fullNameError = validateFullName(formData.fullName)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    if (fullNameError) newErrors.fullName = fullNameError
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)

      const result = await registerUser({
        name: formData.fullName,
        emailVal: formData.email,
        password: formData.password
      })

      setIsLoading(false)

      if (result.success) {
        setSuccessMessage('Cadastro realizado com sucesso! Redirecionando para verificação...')

        // Navegar para tela de verificação de cadastro após 2 segundos
        setTimeout(() => {
          navigate('/verify-registration', { state: { email: formData.email } })
        }, 2000)
      } else {
        // Handle API errors with improved field-specific error mapping
        const newErrors: FormErrors = {}

        // Use utility function to map API field errors
        if (result.fieldErrors) {
          const mappedErrors = mapApiFieldErrors(result.fieldErrors)
          Object.assign(newErrors, mappedErrors)
        }

        // If no specific field errors, determine field based on error message
        if (Object.keys(newErrors).length === 0 && result.error) {
          const fieldName = inferFieldFromErrorMessage(result.error)
          newErrors[fieldName as keyof FormErrors] = result.error
        }

        // If still no specific errors, show generic error
        if (Object.keys(newErrors).length === 0) {
          newErrors.email = result.error || 'Erro ao criar conta. Tente novamente.'
        }

        setErrors(prev => ({ ...prev, ...newErrors }))

        // Se é erro de email duplicado, mostrar opção de reenvio
        if ((result as any).suggestVerification) {
          setSuccessMessage('')
          setShowResendOption(true)
        }
      }
    }
  }

  const handleResendCode = async () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Digite seu email primeiro.' }))
      return
    }

    setIsResending(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const result = await AuthService.resendActivationCode(formData.email)

      setIsResending(false)

      if (result.success) {
        setSuccessMessage('Código reenviado com sucesso! Redirecionando para verificação...')
        setShowResendOption(false)

        // Redirecionar para verificação após 2 segundos
        setTimeout(() => {
          navigate('/verify-registration', { state: { email: formData.email } })
        }, 2000)
      } else {
        setErrors(prev => ({ ...prev, email: result.error || 'Erro ao reenviar código.' }))
      }
    } catch (error) {
      setIsResending(false)
      setErrors(prev => ({ ...prev, email: 'Erro de conexão. Tente novamente.' }))
      console.error('Erro ao reenviar código:', error)
    }
  }



  return (
    <div className="register-container">
      {/* Left side - Register Form */}
      <div className="register-form-side">
        <div className="register-form-container">
          {/* Logo */}
          <div className="logo-container">
            <img 
              src={logo} 
              alt="explora trip logo" 
              className="logo"
            />
          </div>

          {/* Welcome Message */}
          <h1 className="welcome-title">
            Crie sua conta e explore<br />
            novos destinos
          </h1>

          {/* Register Form */}
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Nome completo
              </label>
              <input
                type="text"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Nome e sobrenome"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                E-mail
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Senha
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Sua senha"
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
              <label className="form-label">
                Confirmar senha
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirme sua senha"
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
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            {showResendOption && (
              <div className="resend-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>
                  Email já cadastrado? Reenvie o código de ativação:
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className={`resend-button ${isResending ? 'loading' : ''}`}
                  disabled={isResending}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    opacity: isResending ? 0.6 : 1
                  }}
                >
                  {isResending ? 'Reenviando...' : 'Reenviar código de ativação'}
                </button>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
                  Ou <Link to="/verify-registration" style={{ color: '#007bff' }}>clique aqui para inserir o código</Link> se já o possui.
                </p>
              </div>
            )}

            <div className="login-link-container">
              <span className="login-link-text">
                Já tem cadastro? {' '}
                <Link to="/login" className="login-link">
                  Entrar
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

    </div>
  )
}
