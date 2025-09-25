import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logoHome from '../../assets/logo-home.png';
import { AuthService } from '../../services/authService';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Obter dados do usuário logado
  const userData = AuthService.getUserData();
  const userName = userData?.name || 'Usuário';

  const handleLogout = () => {
    // Limpar dados de autenticação usando o AuthService
    AuthService.clearAuthData();
    navigate('/login');
  };

  const handleCreateTrip = () => {
    navigate('/create-trip');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <img src={logoHome} alt="Explora Trip" className="logo" />
          <nav className="nav-menu">
            <a href="#" className="nav-link">Minhas Viagens</a>
            <a href="#" className="nav-link">Roteiros</a>
            <a href="#" className="nav-link">Gastos</a>
            <a href="#" className="nav-link">Perfil</a>
          </nav>
          <div className="user-section">
            <span className="user-name">Olá, {userName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">Bem-vindo ao Explora Trip!</h1>
          <p className="welcome-subtitle">
            Pronto para planejar sua próxima aventura?
          </p>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2 className="section-title">Ações Rápidas</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>Nova Viagem</h3>
              <p>Comece a planejar uma nova aventura</p>
              <button className="action-btn" onClick={handleCreateTrip}>Criar Viagem</button>
            </div>
            <div className="action-card">
              <h3>Novo Roteiro</h3>
              <p>Organize os detalhes do seu roteiro</p>
              <button className="action-btn">Criar Roteiro</button>
            </div>
            <div className="action-card">
              <h3>Controle de Gastos</h3>
              <p>Gerencie o orçamento da sua viagem</p>
              <button className="action-btn">Ver Gastos</button>
            </div>
          </div>
        </section>

        {/* Recent Activities */}
        <section className="recent-activities">
          <h2 className="section-title">Atividades Recentes</h2>
          <div className="activities-list">
            <div className="activity-item">
              <div className="activity-icon">🗺️</div>
              <div className="activity-content">
                <h4>Bem-vindo ao Explora Trip!</h4>
                <p>Sua conta foi criada com sucesso. Comece explorando as funcionalidades.</p>
                <span className="activity-time">Agora</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
