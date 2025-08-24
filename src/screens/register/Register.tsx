import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import banner from '../../assets/banner.png'
import './Register.css'

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

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      console.log('Enviando dados para API:', userData)

      const response = await fetch('http://localhost:5052/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      console.log('Resposta da API - Status:', response.status)
      console.log('Resposta da API - Headers:', response.headers)

      if (!response.ok) {
        if (response.status === 400) {
          return { success: false, error: 'Dados inválidos. Verifique as informações fornecidas.' }
        } else if (response.status === 409) {
          return { success: false, error: 'Este email já está cadastrado.' }
        } else if (response.status === 500) {
          return { success: false, error: 'Erro interno do servidor. Tente novamente mais tarde.' }
        }
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result: ApiResponse = await response.json()

      if (result.isSuccess) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message || 'Erro desconhecido do servidor' }
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Erro detalhado:', error)

      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 5052.'
        }
      }
      return {
        success: false,
        error: 'Erro de conexão com o servidor. Tente novamente.'
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
        setSuccessMessage('Cadastro realizado com sucesso!')
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        // Optionally redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        // Handle API errors
        if (result.error?.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Este email já está em uso' }))
        } else {
          setErrors(prev => ({ ...prev, email: result.error || 'Erro ao criar conta' }))
        }
      }
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
            Crie sua conta e descubra<br />
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
                  {showPassword ? "🙈" : "👁️"}
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
                  {showConfirmPassword ? "🙈" : "👁️"}
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
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>

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

      {/* Right side - Banner Image */}
      <div className="banner-side">
        <img 
          src={banner} 
          alt="Travel banner" 
          className="banner-image"
        />
      </div>
    </div>
  )
}
