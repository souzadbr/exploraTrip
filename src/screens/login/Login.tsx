import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './Login.css'
import { AuthService } from '../../services/authService'

export const Login: React.FC = () => {
  const navigate = useNavigate()

  // Verifica se o usuário já está autenticado ao carregar o componente
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validação básica dos campos
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor, preencha todos os campos')
      setIsLoading(false)
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido')
      setIsLoading(false)
      return
    }

    try {
      // Chamar o serviço de autenticação
      const result = await AuthService.login({
        email: formData.email,
        password: formData.password
      })

      setIsLoading(false)

      if (result.success && result.data) {
        // Salvar dados de autenticação
        console.log('data salva no storage: ', formData.email)
        AuthService.saveAuthData(formData.email)

        // Navegar para o dashboard
        navigate('/dashboard')
      } else {
        // Exibir erro retornado pela API
        setError(result.error || 'Erro ao fazer login. Tente novamente.')
      }
    } catch (error) {
      setIsLoading(false)
      setError('Erro inesperado. Tente novamente.')
      console.error('Erro no login:', error)
    }
  }
  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="welcome-title">
          Bem-vindo de volta
        </h1>

        <p className="welcome-subtitle">
          Pronto para a próxima viagem?
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              Mantenha-me contactado
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Embarcar'}
          </button>

          <div className="register-link-container">
            <span className="register-link-text">
              Não possui conta? {' '}
              <Link to="/register" className="register-link">
                Cadastre-se
              </Link>
            </span>
          </div>

          <div className="register-link-container" style={{ marginTop: '10px' }}>
            <span className="register-link-text">
              Já se cadastrou mas não confirmou? {' '}
              <Link to="/verify-registration" className="register-link">
                Confirmar cadastro
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
