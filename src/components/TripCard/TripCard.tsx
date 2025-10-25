/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './TripCard.css'
import type { TripApiResponse } from '../../config/api'
import { formatCurrencyDisplay } from '../../utils/currencyUtils'
import { logger } from '../../utils/logger'

interface TripCardProps {
  trip: TripApiResponse
  onEdit: (trip: TripApiResponse) => void
  onDelete?: (tripId: string) => void
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDuration = () => {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleEdit = () => {
    onEdit(trip)
  }

  const handleDelete = () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      onDelete(trip.id)
    }
  }

  return (
    <div className="trip-card">
      <div className="trip-card-header">
        <h3 className="trip-card-title">{trip.name}</h3>
        <div className="trip-card-actions">
          <button 
            className="trip-card-btn edit-btn" 
            onClick={handleEdit}
            title="Editar viagem"
          >
            ✏️
          </button>
          {onDelete && (
            <button 
              className="trip-card-btn delete-btn" 
              onClick={handleDelete}
              title="Excluir viagem"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="trip-card-content">
        <div className="trip-card-dates">
          <div className="date-item">
            <span className="date-label">Início:</span>
            <span className="date-value">{formatDate(trip.startDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Fim:</span>
            <span className="date-value">{formatDate(trip.endDate)}</span>
          </div>
          <div className="duration-item">
            <span className="duration-label">Duração:</span>
            <span className="duration-value">{getDuration()} dias</span>
          </div>
        </div>

        <div className="trip-card-budget">
          <span className="budget-label">Orçamento:</span>
          <span className="budget-value">{formatCurrencyDisplay(trip.tripBudget)}</span>
        </div>

        {trip.notes && Array.isArray(trip.notes) && trip.notes.length > 0 && (
          <div className="trip-card-notes">
            <span className="notes-label">Notas:</span>
            <div className="notes-list">
              {trip.notes.slice(0, 2).map((note, index) => (
                <span key={index} className="note-item">• {note}</span>
              ))}
              {trip.notes.length > 2 && (
                <span className="notes-more">+{trip.notes.length - 2} mais</span>
              )}
            </div>
          </div>
        )}

        {trip.usersRolesDTO && Array.isArray(trip.usersRolesDTO) && trip.usersRolesDTO.length > 0 && (
          <div className="trip-card-participants">
            <span className="participants-label">Participantes:</span>
            <div className="participants-list">
              {trip.usersRolesDTO.slice(0, 2).map((userRole, index) => (
                <span key={index} className="participant-item">
                  {userRole.userEmail}
                </span>
              ))}
              {trip.usersRolesDTO.length > 2 && (
                <span className="participants-more">+{trip.usersRolesDTO.length - 2} mais</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="trip-card-footer">
        <button className="trip-card-view-btn" onClick={() => navigate(`/trip/${trip.id}`)}>
          Ver Detalhes
        </button>
      </div>
    </div>
  )
}
