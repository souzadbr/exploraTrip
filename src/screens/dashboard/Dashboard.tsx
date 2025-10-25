import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import logoHome from '../../assets/logo-home.png';
import { AuthService } from '../../services/authService';
import { TripService } from '../../services/tripService';
import { TripCard } from '../../components/TripCard/TripCard';
import type { TripApiResponse } from '../../config/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Obter dados do usuário logado
  const userEmail = AuthService.getUserData();
  // const userData = await AuthService.getByEmail(userEmail!);
  const [userName, setUserName] = useState<string>('Usuário');

  // Estados para gerenciar viagens
  const [trips, setTrips] = useState<TripApiResponse[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState('');

  useEffect(() => {
      const fetchUser = async () => {
        if (userEmail) {
          const userData = await AuthService.getByEmail(userEmail);
          if (userData.success && userData.data) {
            console.log(userData.data)
            setUserName(userData.data.userName || userData.data.name || 'Usuário');
          }
        }
      };
      fetchUser();
    }, [userEmail]);
  // Função para carregar viagens do usuário
  const loadTrips = useCallback(async () => {
    if (!userEmail) return;

    setIsLoadingTrips(true);
    setTripsError('');

    try {
      const result = await TripService.getTripsByUserEmail(userEmail);

      if (result.success) {
        // Pegar apenas as 3 primeiras viagens para o dashboard
        setTrips(result.data?.slice(0, 3) || []);
      } else {
        setTripsError(result.error || 'Erro ao carregar viagens');
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      setTripsError('Erro inesperado ao carregar viagens');
    } finally {
      setIsLoadingTrips(false);
    }
  }, [userEmail]);

  // Função para excluir viagem
  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      return;
    }

    try {
      const result = await TripService.deleteTrip(tripId);

      if (result.success) {
        // Recarregar viagens após exclusão
        loadTrips();
      } else {
        alert('Erro ao excluir viagem: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      alert('Erro inesperado ao excluir viagem');
    }
  };

  // Carregar viagens ao montar o componente
  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

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
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/create-trip');
              }}
            >
              Minhas Viagens
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidade de Roteiros em desenvolvimento');
              }}
            >
              Roteiros
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidade de Gastos em desenvolvimento');
              }}
            >
              Gastos
            </a>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Funcionalidade de Perfil em desenvolvimento');
              }}
            >
              Perfil
            </a>
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

        {/* Minhas Viagens */}
        <section className="my-trips-section">
          <div className="section-header">
            <h2 className="section-title">Minhas Viagens</h2>
            <button
              className="view-all-btn"
              onClick={() => navigate('/create-trip')}
            >
              Ver Todas →
            </button>
          </div>

          {isLoadingTrips ? (
            <div className="trips-loading">
              <div className="loading-spinner"></div>
              <span>Carregando viagens...</span>
            </div>
          ) : tripsError ? (
            <div className="trips-error">
              <p>{tripsError}</p>
              <button onClick={loadTrips} className="retry-btn">
                Tentar Novamente
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="trips-empty">
              <div className="empty-icon">✈️</div>
              <h3>Nenhuma viagem cadastrada</h3>
              <p>Comece a planejar sua primeira aventura!</p>
              <button
                className="create-first-trip-btn"
                onClick={handleCreateTrip}
              >
                Criar Primeira Viagem
              </button>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onEdit={() => navigate('/create-trip')}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
