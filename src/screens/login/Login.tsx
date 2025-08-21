import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import banner from '../../assets/banner.png'
import './Login.css'

interface LoginFormData {
  username: string
  password: string
}

interface LoginFormErrors {
  username?: string
  password?: string
}

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })

  const [errors, setErrors] = useState<LoginFormErrors>({})

  const validateUsername = (username: string): string | undefined => {
    if (username.trim().length < 3) {
      return 'Usuário deve ter pelo menos 3 caracteres'
    }
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) {
      return 'Senha deve ter pelo menos 8 caracteres'
    }
    return undefined
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof LoginFormData) => {
    const value = formData[field]
    let error: string | undefined

    switch (field) {
      case 'username':
        error = validateUsername(value)
        break
      case 'password':
        error = validatePassword(value)
        break
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: LoginFormErrors = {}

    // Validate all fields
    const usernameError = validateUsername(formData.username)
    const passwordError = validatePassword(formData.password)

    if (usernameError) newErrors.username = usernameError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      console.log('Login submitted:', formData)
      // Here you would typically send data to your API
    }
  }

  return (
    <div className="login-container">
      {/* Left side - Login Form */}
      <div className="login-form-side">
        <div className="login-form-container">
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
            Bem-vindo de volta,<br />
            pronto pra próxima viagem?
          </h1>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Usuário
              </label>
              <input
                type="text"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Digite seu usuário"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Senha
              </label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                />
                Mantenha-me contactado
              </label>
              <a
                href="#"
                className="forgot-password"
              >
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className="submit-button"
            >
              Embarcar
            </button>

            <div className="register-link-container">
              <span className="register-link-text">
                Não tem conta? {' '}
                <Link to="/" className="register-link">
                  Cadastre-se
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
