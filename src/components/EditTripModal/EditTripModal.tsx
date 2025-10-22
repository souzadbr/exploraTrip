import React, { useState, useEffect } from 'react'
import './EditTripModal.css'
import type { TripApiData, TripApiResponse } from '../../config/api'
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyUtils'
import { validateEmail, isStartBeforeEnd } from '../../utils/validationUtils'
import { logger } from '../../utils/logger'

interface UserRole {
  userEmail: string
  role: number
}

interface TripFormData {
  name: string
  startDate: string
  endDate: string
  budget: number | null
  notes: string[]
  userRoles: UserRole[]
}

interface EditTripModalProps {
  isOpen: boolean
  trip: TripApiResponse | null
  onClose: () => void
  onSave: (tripId: string, tripData: TripApiData) => Promise<void>
  isLoading?: boolean
  error?: string
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    startDate: '',
    endDate: '',
    budget: null,
    notes: [],
    userRoles: []
  })

  const [budgetDisplay, setBudgetDisplay] = useState('')
  const [currentNote, setCurrentNote] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Helper function to convert ISO date to input date format
  const formatDateForInput = (isoDate: string): string => {
    try {
      const date = new Date(isoDate)
      if (isNaN(date.getTime())) {
        return ''
      }
      // Format as YYYY-MM-DD for date input
      return date.toISOString().split('T')[0]
    } catch (error) {
      logger.error('Error formatting date:', error)
      return ''
    }
  }

  // Populate form when trip changes
  useEffect(() => {
    if (trip) {
      const tripBudget = trip.tripBudget ?? null
      setFormData({
        name: trip.name || '',
        startDate: formatDateForInput(trip.startDate),
        endDate: formatDateForInput(trip.endDate),
        budget: tripBudget,
        notes: trip.notes || [],
        userRoles: trip.userRoles || []
      })

      // Format budget for display
      if (tripBudget !== null) {
        setBudgetDisplay(formatCurrencyInput(tripBudget.toString().replace('.', '')))
      } else {
        setBudgetDisplay('')
      }

      setHasUnsavedChanges(false)
    }
  }, [trip])

  const handleInputChange = (field: keyof TripFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    if (error) setError('')
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatCurrencyInput(value)
    setBudgetDisplay(formatted)

    const numericValue = parseCurrencyInput(formatted)
    setFormData(prev => ({ ...prev, budget: numericValue }))
    setHasUnsavedChanges(true)
    if (error) setError('')
  }

  const addNote = () => {
    if (currentNote.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...prev.notes, currentNote.trim()]
      }))
      setCurrentNote('')
    }
  }

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }))
  }

  const addParticipant = () => {
    const email = currentUserEmail.trim()

    if (!email) {
      setError('Email não pode estar vazio')
      return
    }

    if (!validateEmail(email)) {
      setError('Formato de email inválido')
      return
    }

    if (formData.userRoles.some(ur => ur.userEmail === email)) {
      setError('Este participante já foi adicionado')
      return
    }

    setFormData(prev => ({
      ...prev,
      userRoles: [...prev.userRoles, { userEmail: email, role: 1 }]
    }))
    setCurrentUserEmail('')
    setHasUnsavedChanges(true)
    setError('')
  }

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      userRoles: prev.userRoles.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome da viagem é obrigatório')
      return false
    }
    if (!formData.startDate) {
      setError('Data de início é obrigatória')
      return false
    }
    if (!formData.endDate) {
      setError('Data de fim é obrigatória')
      return false
    }

    // Validate dates
    if (!isStartBeforeEnd(formData.startDate, formData.endDate)) {
      setError('Data de fim deve ser posterior à data de início')
      return false
    }

    // Validate budget
    if (formData.budget !== null && formData.budget < 0) {
      setError('Orçamento não pode ser negativo')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trip) return
    if (!validateForm()) return

    // Helper function to convert date input to ISO string
    const convertToISOString = (dateString: string): string => {
      try {
        const date = new Date(dateString + 'T00:00:00.000Z')
        return date.toISOString()
      } catch (error) {
        logger.error('Error converting date to ISO:', error)
        return new Date().toISOString()
      }
    }

    const tripData: TripApiData = {
      name: formData.name.trim(),
      startDate: convertToISOString(formData.startDate),
      endDate: convertToISOString(formData.endDate),
      tripBudget: formData.budget,
      notes: formData.notes,
      userRoles: formData.userRoles
    }

    try {
      await onSave(trip.id, tripData)
      setHasUnsavedChanges(false)
      onClose()
    } catch (error) {
      logger.error('Erro ao salvar viagem:', error)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
        setError('')
        setHasUnsavedChanges(false)
        onClose()
      }
    } else {
      setError('')
      onClose()
    }
  }

  if (!isOpen || !trip) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Viagem</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Nome da Viagem */}
          <div className="form-group">
            <label className="form-label">Nome da Viagem *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Viagem para Paris"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Datas */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Início *</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Fim *</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Orçamento */}
          <div className="form-group">
            <label className="form-label">Orçamento</label>
            <input
              type="text"
              className="form-input"
              placeholder="R$ 0,00"
              value={budgetDisplay}
              onChange={handleBudgetChange}
              maxLength={20}
            />
          </div>

          {/* Notas */}
          <div className="form-group">
            <label className="form-label">Notas da Viagem</label>
            <div className="input-with-button">
              <input
                type="text"
                className="form-input"
                placeholder="Adicione uma nota..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
                maxLength={500}
              />
              <button
                type="button"
                className="add-btn"
                onClick={addNote}
                disabled={!currentNote.trim()}
              >
                Adicionar
              </button>
            </div>
            {formData.notes.length > 0 && (
              <div className="tags-container">
                {formData.notes.map((note, index) => (
                  <div key={index} className="tag">
                    <span>{note}</span>
                    <button type="button" onClick={() => removeNote(index)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participantes */}
          <div className="form-group">
            <label className="form-label">Participantes</label>
            <div className="input-with-button">
              <input
                type="email"
                className="form-input"
                placeholder="email@exemplo.com"
                value={currentUserEmail}
                onChange={(e) => setCurrentUserEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                maxLength={100}
              />
              <button
                type="button"
                className="add-btn"
                onClick={addParticipant}
                disabled={!currentUserEmail.trim()}
              >
                Adicionar
              </button>
            </div>
            {formData.userRoles.length > 0 && (
              <div className="tags-container">
                {formData.userRoles.map((userRole, index) => (
                  <div key={index} className="tag">
                    <span>{userRole.userEmail}</span>
                    <button type="button" onClick={() => removeParticipant(index)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`save-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
