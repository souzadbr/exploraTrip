/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import './LocalCard.css'
import type { LocalApiResponse } from '../../config/api'
import { logger } from '../../utils/logger'

interface LocalCardProps {
  local: LocalApiResponse
  onEdit: (local: LocalApiResponse) => void
  onDelete?: (localId: string) => void
}

export const LocalCard: React.FC<LocalCardProps> = ({ local, onEdit, onDelete }) => {
  logger.log('LocalCard received local data:', local)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined) {
      return 'Não definido'
    }

    let numericAmount: number
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount)
    } else if (typeof amount === 'number') {
      numericAmount = amount
    } else {
      return 'Não definido'
    }

    if (isNaN(numericAmount)) {
      return 'Não definido'
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericAmount)
  }

  const getDuration = () => {
    if (!local.dateStart || !local.dateEnd) return null
    
    const start = new Date(local.dateStart)
    const end = new Date(local.dateEnd)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleEdit = () => {
    onEdit(local)
  }

  const handleDelete = () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir este local?')) {
      onDelete(local.localId)
    }
  }

  const duration = getDuration()

  return (
    <div className="local-card">
      <div className="local-card-header">
        <h4 className="local-card-title">{local.localName}</h4>
        <div className="local-card-actions">
          <button 
            className="local-card-btn edit-btn" 
            onClick={handleEdit}
            title="Editar local"
          >
            ✏️
          </button>
          {onDelete && (
            <button 
              className="local-card-btn delete-btn" 
              onClick={handleDelete}
              title="Excluir local"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="local-card-content">
        <div className="local-card-dates">
          <div className="date-item">
            <span className="date-label">Início:</span>
            <span className="date-value">{formatDate(local.dateStart)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Fim:</span>
            <span className="date-value">{formatDate(local.dateEnd)}</span>
          </div>
          {duration !== null && (
            <div className="duration-item">
              <span className="duration-label">Duração:</span>
              <span className="duration-value">{duration} dias</span>
            </div>
          )}
        </div>

        {local.localBudget !== null && local.localBudget !== undefined && (
          <div className="local-card-budget">
            <span className="budget-label">Orçamento:</span>
            <span className="budget-value">{formatCurrency(local.localBudget)}</span>
          </div>
        )}

        {local.notes && local.notes.length > 0 && (
          <div className="local-card-notes">
            <span className="notes-label">Notas:</span>
            <div className="notes-list">
              {local.notes.slice(0, 3).map((note, index) => (
                <span key={index} className="note-item">• {note}</span>
              ))}
              {local.notes.length > 3 && (
                <span className="notes-more">+{local.notes.length - 3} mais</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

