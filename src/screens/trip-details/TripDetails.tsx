import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './TripDetails.css'
import { TripService } from '../../services/tripService'
import { LocalService } from '../../services/localService'
import type { TripApiResponse, LocalApiResponse, LocalApiData } from '../../config/api'
import { LocalCard } from '../../components/LocalCard'
import { CreateLocalModal } from '../../components/CreateLocalModal'
import { EditLocalModal } from '../../components/EditLocalModal'
import { Toast } from '../../components/Toast'
import { logger } from '../../utils/logger'

export const TripDetails: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<TripApiResponse | null>(null)
  const [locals, setLocals] = useState<LocalApiResponse[]>([])
  const [isLoadingTrip, setIsLoadingTrip] = useState(true)
  const [isLoadingLocals, setIsLoadingLocals] = useState(true)
  const [tripError, setTripError] = useState<string | null>(null)
  const [localsError, setLocalsError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLocal, setSelectedLocal] = useState<LocalApiResponse | null>(null)
  const [isModalLoading, setIsModalLoading] = useState(false)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const loadTrip = useCallback(async () => {
    if (!tripId) {
      setTripError('ID da viagem não fornecido')
      setIsLoadingTrip(false)
      return
    }

    try {
      setIsLoadingTrip(true)
      setTripError(null)

      const result = await TripService.getTripById(tripId)

      if (result.success && result.data) {
        setTrip(result.data)
      } else {
        setTripError(result.error || 'Erro ao carregar viagem')
      }
    } catch (error) {
      logger.error('Erro ao carregar viagem:', error)
      setTripError('Erro inesperado ao carregar viagem')
    } finally {
      setIsLoadingTrip(false)
    }
  }, [tripId])

  const loadLocals = useCallback(async () => {
    if (!tripId) return

    try {
      setIsLoadingLocals(true)
      setLocalsError(null)

      const result = await LocalService.getLocalsByTripId(tripId)

      if (result.success && result.data) {
        setLocals(result.data)
      } else {
        setLocalsError(result.error || 'Erro ao carregar locais')
      }
    } catch (error) {
      logger.error('Erro ao carregar locais:', error)
      setLocalsError('Erro inesperado ao carregar locais')
    } finally {
      setIsLoadingLocals(false)
    }
  }, [tripId])

  useEffect(() => {
    loadTrip()
    loadLocals()
  }, [loadTrip, loadLocals])

  const handleCreateLocal = async (localData: LocalApiData) => {
    try {
      setIsModalLoading(true)
      const result = await LocalService.createLocal(localData)

      if (result.success) {
        await loadLocals()
        setIsCreateModalOpen(false)
        setToast({ message: 'Local criado com sucesso!', type: 'success' })
      } else {
        setToast({ message: result.error || 'Erro ao criar local', type: 'error' })
      }
    } catch (error) {
      logger.error('Erro ao criar local:', error)
      setToast({ message: 'Erro inesperado ao criar local', type: 'error' })
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleEditLocal = (local: LocalApiResponse) => {
    setSelectedLocal(local)
    setIsEditModalOpen(true)
  }

  const handleUpdateLocal = async (localId: string, localData: LocalApiData) => {
    try {
      setIsModalLoading(true)
      const result = await LocalService.updateLocal(localId, localData)

      if (result.success) {
        await loadLocals()
        setIsEditModalOpen(false)
        setSelectedLocal(null)
        setToast({ message: 'Local atualizado com sucesso!', type: 'success' })
      } else {
        setToast({ message: result.error || 'Erro ao atualizar local', type: 'error' })
      }
    } catch (error) {
      logger.error('Erro ao atualizar local:', error)
      setToast({ message: 'Erro inesperado ao atualizar local', type: 'error' })
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleDeleteLocal = async (localId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este local?')) {
      return
    }

    try {
      const result = await LocalService.deleteLocal(localId)

      if (result.success) {
        await loadLocals()
        setToast({ message: 'Local excluído com sucesso!', type: 'success' })
      } else {
        setToast({ message: result.error || 'Erro ao deletar local', type: 'error' })
      }
    } catch (error) {
      logger.error('Erro ao deletar local:', error)
      setToast({ message: 'Erro inesperado ao deletar local', type: 'error' })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (isLoadingTrip) {
    return (
      <div className="trip-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando viagem...</p>
        </div>
      </div>
    )
  }

  if (tripError || !trip) {
    return (
      <div className="trip-details-container">
        <div className="error-state">
          <p className="error-message">{tripError || 'Viagem não encontrada'}</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trip-details-container">
      <div className="trip-details-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>
        <h1 className="trip-title">{trip.name}</h1>
      </div>

      <div className="trip-info-card">
        <div className="trip-info-row">
          <div className="info-item">
            <span className="info-label">Data de Início:</span>
            <span className="info-value">{formatDate(trip.startDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Data de Fim:</span>
            <span className="info-value">{formatDate(trip.endDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Orçamento:</span>
            <span className="info-value">{formatCurrency(trip.tripBudget)}</span>
          </div>
        </div>

        {trip.notes && trip.notes.length > 0 && (
          <div className="trip-notes">
            <h3 className="notes-title">Notas da Viagem:</h3>
            <ul className="notes-list">
              {trip.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="locals-section">
        <div className="locals-header">
          <h2 className="locals-title">Locais e Roteiros</h2>
          <button 
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Adicionar Local
          </button>
        </div>

        {isLoadingLocals ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando locais...</p>
          </div>
        ) : localsError ? (
          <div className="error-state">
            <p className="error-message">{localsError}</p>
            <button className="btn-secondary" onClick={loadLocals}>
              Tentar Novamente
            </button>
          </div>
        ) : locals.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum local adicionado ainda.</p>
            <button 
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Adicionar Primeiro Local
            </button>
          </div>
        ) : (
          <div className="locals-grid">
            {locals.map((local) => (
              <LocalCard
                key={local.localId}
                local={local}
                onEdit={handleEditLocal}
                onDelete={handleDeleteLocal}
              />
            ))}
          </div>
        )}
      </div>

      <CreateLocalModal
        isOpen={isCreateModalOpen}
        tripId={tripId!}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateLocal}
        isLoading={isModalLoading}
      />

      <EditLocalModal
        isOpen={isEditModalOpen}
        local={selectedLocal}
        tripId={tripId!}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedLocal(null)
        }}
        onSave={handleUpdateLocal}
        isLoading={isModalLoading}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

