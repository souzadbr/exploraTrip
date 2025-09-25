import React from 'react'
import './TripCard.css'
import type { TripApiResponse } from '../../config/api'

interface TripCardProps {
  trip: TripApiResponse
  onEdit: (trip: TripApiResponse) => void
  onDelete?: (tripId: string) => void
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  // Debug log to check trip data
  console.log('TripCard received trip data:', trip)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: any) => {
    console.log('Formatting currency for amount:', amount, 'type:', typeof amount)

    // Verificar se o valor é válido
    if (amount === null || amount === undefined) {
      console.log('Amount is null or undefined, returning default')
      return 'R$ 0,00'
    }

    // Converter para número se for string
    let numericAmount: number
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount)
    } else if (typeof amount === 'number') {
      numericAmount = amount
    } else {
      console.log('Amount is not string or number, returning default')
      return 'R$ 0,00'
    }

    // Verificar se a conversão foi bem-sucedida
    if (isNaN(numericAmount)) {
      console.log('Amount is NaN after conversion, returning default')
      return 'R$ 0,00'
    }

    console.log('Successfully formatting amount:', numericAmount)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericAmount)
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
          <span className="budget-value">{formatCurrency(trip.budget)}</span>
        </div>

        {trip.notes && trip.notes.length > 0 && (
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

        {trip.userRoles && trip.userRoles.length > 0 && (
          <div className="trip-card-participants">
            <span className="participants-label">Participantes:</span>
            <div className="participants-list">
              {trip.userRoles.slice(0, 2).map((userRole, index) => (
                <span key={index} className="participant-item">
                  {userRole.userEmail}
                </span>
              ))}
              {trip.userRoles.length > 2 && (
                <span className="participants-more">+{trip.userRoles.length - 2} mais</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="trip-card-footer">
        <button className="trip-card-view-btn" onClick={handleEdit}>
          Ver Detalhes
        </button>
      </div>
    </div>
  )
}
