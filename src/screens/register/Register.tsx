import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import banner from '../../assets/banner.png'
import './Register.css'

interface FormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/
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

  const validatePhone = (phone: string): string | undefined => {
    if (!phoneRegex.test(phone)) {
      return 'Telefone inválido. Use formato: (11) 99999-9999'
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
      case 'phone':
        error = validatePhone(value)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}

    // Validate all fields
    const fullNameError = validateFullName(formData.fullName)
    const emailError = validateEmail(formData.email)
    const phoneError = validatePhone(formData.phone)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)

    if (fullNameError) newErrors.fullName = fullNameError
    if (emailError) newErrors.email = emailError
    if (phoneError) newErrors.phone = phoneError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData)
      // Here you would typically send data to your API
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
                Telefone
              </label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Senha
              </label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onFocus={() => setShowPasswordRequirements(true)}
              />
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
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="submit-button"
            >
              Cadastrar
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
