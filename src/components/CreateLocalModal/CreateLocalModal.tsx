import React, { useState, useEffect } from 'react'
import './CreateLocalModal.css'
import type { LocalApiData } from '../../config/api'
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyUtils'
import { isStartBeforeEnd } from '../../utils/validationUtils'

interface LocalFormData {
  localName: string
  dateStart: string
  dateEnd: string
  localBudget: number | null
  notes: string[]
}

interface CreateLocalModalProps {
  isOpen: boolean
  tripId: string
  onClose: () => void
  onCreate: (localData: LocalApiData) => Promise<void>
  isLoading?: boolean
}

export const CreateLocalModal: React.FC<CreateLocalModalProps> = ({
  isOpen,
  tripId,
  onClose,
  onCreate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<LocalFormData>({
    localName: '',
    dateStart: '',
    dateEnd: '',
    localBudget: null,
    notes: []
  })

  const [budgetDisplay, setBudgetDisplay] = useState('')
  const [currentNote, setCurrentNote] = useState('')
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasChanges =
      formData.localName.trim() !== '' ||
      formData.dateStart !== '' ||
      formData.dateEnd !== '' ||
      formData.localBudget !== null ||
      formData.notes.length > 0

    setHasUnsavedChanges(hasChanges)
  }, [formData])

  const handleInputChange = (field: keyof LocalFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatCurrencyInput(value)
    setBudgetDisplay(formatted)

    const numericValue = parseCurrencyInput(formatted)
    setFormData(prev => ({ ...prev, localBudget: numericValue }))
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

  const validateForm = (): boolean => {
    if (!formData.localName.trim()) {
      setError('Nome do local é obrigatório')
      return false
    }

    if (formData.dateStart && formData.dateEnd) {
      if (!isStartBeforeEnd(formData.dateStart, formData.dateEnd)) {
        setError('Data de fim deve ser posterior à data de início')
        return false
      }
    }

    if (formData.localBudget !== null && formData.localBudget < 0) {
      setError('Orçamento não pode ser negativo')
      return false
    }

    if (formData.localBudget !== null && formData.localBudget < 0) {
      setError('Orçamento não pode ser negativo')
      return false
    }

    return true
  }

  const convertToISOString = (dateString: string): string | null => {
    if (!dateString) return null
    try {
      const date = new Date(dateString + 'T00:00:00.000Z')
      return date.toISOString()
    } catch (error) {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const localData: LocalApiData = {
      localName: formData.localName.trim(),
      dateStart: convertToISOString(formData.dateStart),
      dateEnd: convertToISOString(formData.dateEnd),
      tripId: tripId,
      localBudget: formData.localBudget,
      notes: formData.notes.length > 0 ? formData.notes : null
    }

    try {
      await onCreate(localData)
      resetForm()
      onClose()
    } catch (error) {
      // Error is handled by parent component
    }
  }

  const resetForm = () => {
    setFormData({
      localName: '',
      dateStart: '',
      dateEnd: '',
      localBudget: null,
      notes: []
    })
    setBudgetDisplay('')
    setCurrentNote('')
    setError('')
    setHasUnsavedChanges(false)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
        resetForm()
        onClose()
      }
    } else {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Local/Roteiro</h2>
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

          {/* Nome do Local */}
          <div className="form-group">
            <label className="form-label">Nome do Local *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Paris - Torre Eiffel"
              value={formData.localName}
              onChange={(e) => handleInputChange('localName', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Datas */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Início</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateStart}
                onChange={(e) => handleInputChange('dateStart', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Fim</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateEnd}
                onChange={(e) => handleInputChange('dateEnd', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Orçamento */}
          <div className="form-group">
            <label className="form-label">Orçamento (opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="R$ 0,00"
              value={budgetDisplay}
              onChange={handleBudgetChange}
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          {/* Notas */}
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <div className="notes-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Adicione uma nota"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
                maxLength={500}
                disabled={isLoading}
              />
              <button
                type="button"
                className="add-note-btn"
                onClick={addNote}
                disabled={isLoading || !currentNote.trim()}
              >
                Adicionar
              </button>
            </div>
            {formData.notes.length > 0 && (
              <div className="notes-list">
                {formData.notes.map((note, index) => (
                  <div key={index} className="note-item">
                    <span className="note-text">{note}</span>
                    <button
                      type="button"
                      className="remove-note-btn"
                      onClick={() => removeNote(index)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Local'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

