import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './Login.css'

export const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={logo} alt="explora trip logo" className="logo" />
        </div>

        <h1 className="welcome-title">
          Bem-vindo de volta, <br /> pronto pra próxima viagem?
        </h1>

        <form className="login-form">
          <div className="form-group">
            <label className="form-label">Usuário</label>
            <input
              type="text"
              className="form-input"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="Digite sua senha"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              Mantenha-me contactado
            </label>
            <a href="#" className="forgot-password">
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
              Não possui conta? {' '}
              <Link to="/" className="register-link">
                Cadastre-se
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
