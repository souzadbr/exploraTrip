import React, { useState, useEffect } from 'react'
import './EditTripModal.css'
import type { TripApiData, TripApiResponse } from '../../config/api'

interface UserRole {
  userEmail: string
  role: number
}

interface TripFormData {
  name: string
  startDate: string
  endDate: string
  budget: number
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
    budget: 0,
    notes: [],
    userRoles: []
  })

  const [currentNote, setCurrentNote] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [error, setError] = useState('')

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
      console.error('Error formatting date:', error)
      return ''
    }
  }

  // Populate form when trip changes
  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name || '',
        startDate: formatDateForInput(trip.startDate),
        endDate: formatDateForInput(trip.endDate),
        budget: trip.budget || 0,
        notes: trip.notes || [],
        userRoles: trip.userRoles || []
      })
    }
  }, [trip])

  const handleInputChange = (field: keyof TripFormData, value: string | number) => {
    // Handle budget field specifically to ensure it's a valid number
    if (field === 'budget') {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value
      setFormData(prev => ({ ...prev, [field]: isNaN(numericValue) ? 0 : numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
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
    if (currentUserEmail.trim() && !formData.userRoles.some(ur => ur.userEmail === currentUserEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        userRoles: [...prev.userRoles, { userEmail: currentUserEmail.trim(), role: 1 }]
      }))
      setCurrentUserEmail('')
    }
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
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (isNaN(startDate.getTime())) {
      setError('Data de início inválida')
      return false
    }

    if (isNaN(endDate.getTime())) {
      setError('Data de fim inválida')
      return false
    }

    if (startDate >= endDate) {
      setError('Data de fim deve ser posterior à data de início')
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
        console.error('Error converting date to ISO:', error)
        return new Date().toISOString()
      }
    }

    const tripData: TripApiData = {
      name: formData.name.trim(),
      startDate: convertToISOString(formData.startDate),
      endDate: convertToISOString(formData.endDate),
      budget: formData.budget,
      notes: formData.notes,
      userRoles: formData.userRoles
    }

    try {
      await onSave(trip.id, tripData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar viagem:', error)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
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
            <label className="form-label">Orçamento (R$)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
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
              />
              <button type="button" className="add-btn" onClick={addNote}>
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
              />
              <button type="button" className="add-btn" onClick={addParticipant}>
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
