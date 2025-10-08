import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateTrip.css'
import logoHome from '../../assets/logo-home.png'
import { TripService } from '../../services/tripService'
import type { TripApiData, TripApiResponse } from '../../config/api'
import { TripCard } from '../../components/TripCard/TripCard'
import { EditTripModal } from '../../components/EditTripModal/EditTripModal'
import { AuthService } from '../../services/authService'

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

export const CreateTrip: React.FC = () => {
  const currentUser = AuthService.getUserData()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    startDate: '',
    endDate: '',
    budget: 0,
    notes: [],
    userRoles: [
      {
        userEmail: currentUser!,
        role: 1
      }
    ]
  })

  const [currentNote, setCurrentNote] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState('')

  // Estados para gerenciar viagens
  const [trips, setTrips] = useState<TripApiResponse[]>([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(false)
  const [tripsError, setTripsError] = useState('')

  // Estados para modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<TripApiResponse | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  

  const loadTrips = useCallback (async () => {
    if (!currentUser) return;
    setIsLoadingTrips(true)
    setTripsError('')

    try {
      const result = await TripService.getTripsByUserEmail(currentUser!)
      console.log('Result from getTrips:', result)

      if (result.success) {
        const trips = result.data || []
        console.log('Setting trips:', trips)
        setTrips(trips)
      } else {
        console.error('Error loading trips:', result.error)
        setTripsError(result.error || 'Erro ao carregar viagens')
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error)
      setTripsError('Erro inesperado ao carregar viagens')
    } finally {
      setIsLoadingTrips(false)
    }
  }, [currentUser])

  // Carregar viagens ao montar o componente
  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  const handleInputChange = (field: keyof TripFormData, value: string | number) => {
    // Handle budget field specifically to ensure it's a valid number
    if (field === 'budget') {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value
      setFormData(prev => ({ ...prev, [field]: isNaN(numericValue) ? 0 : numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (error) setError('')
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  const addUserRole = () => {
    if (currentUserEmail.trim()) {
      const newUserRole: UserRole = {
        userEmail: currentUserEmail.trim(),
        role: 1 // Default role
      }
      setFormData(prev => ({
        ...prev,
        userRoles: [...prev.userRoles, newUserRole]
      }))
      setCurrentUserEmail('')
    }
  }

  const removeUserRole = (index: number) => {
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

  const createTripWithData = async () => {
    setError('')
    setSuccessMessage('')
    setFieldErrors({})

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Helper function to convert date input to ISO string
      const convertToISOString = (dateString: string): string => {
        try {
          const date = new Date(dateString + 'T00:00:00.000Z');
          return date.toISOString()
        } catch (error) {
          console.error('Error converting date to ISO:', error)
          return new Date().toISOString()
        }
      }
      // Preparar dados para envio
      const tripData: TripApiData = {
        name: formData.name.trim(),
        startDate: convertToISOString(formData.startDate),
        endDate: convertToISOString(formData.endDate),
        tripBudget: formData.budget,
        notes: formData.notes,
        userRoles: formData.userRoles
      }

      console.log('Enviando dados da viagem:', tripData)

      // Chamar API para criar viagem
      const result = await TripService.createTrip(tripData)

      setIsLoading(false)

      if (result.success) {
        setSuccessMessage('Viagem criada com sucesso!')
        console.log('Viagem criada:', result.data)

        // Adicionar a nova viagem à lista
        if (result.data) {
          setTrips(prev => [result.data!, ...prev])
        }

        // Limpar formulário
        setFormData({
          name: '',
          startDate: '',
          endDate: '',
          budget: 0,
          notes: [],
          userRoles: []
        })
        setCurrentNote('')
        setCurrentUserEmail('')

        // Remover mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      } else {
        // Tratar erros da API
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          setFieldErrors(result.fieldErrors)
        }

        // Verificar se é erro de usuário não encontrado
        if (result.error && result.error.toLowerCase().includes('user not found')) {
          setError('Um ou mais participantes não foram encontrados. Verifique se os emails estão cadastrados no sistema ou clique em "Criar Sem Participantes".')
        } else {
          setError(result.error || 'Erro ao criar viagem. Tente novamente.')
        }
      }

    } catch (error) {
      console.error('Erro inesperado:', error)
      setError('Erro inesperado ao criar viagem. Tente novamente.')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTripWithData() // Incluir participantes
  }

  const handleSubmitWithoutParticipants = async () => {
    await createTripWithData() // Não incluir participantes
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  // Funções para modal de edição
  const handleEditTrip = (trip: TripApiResponse) => {
    setEditingTrip(trip)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTrip(null)
  }

  const handleSaveTrip = async (tripId: string, tripData: TripApiData) => {
    setIsUpdating(true)

    try {
      const result = await TripService.updateTrip(tripId, tripData)

      if (result.success) {
        // Atualizar a viagem na lista
        setTrips(prev => prev.map(trip =>
          trip.id === tripId ? result.data! : trip
        ))

        setSuccessMessage('Viagem atualizada com sucesso!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(result.error || 'Erro ao atualizar viagem')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Erro ao atualizar viagem:', error)
      setError('Erro inesperado ao atualizar viagem')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const result = await TripService.deleteTrip(tripId)

      if (result.success) {
        // Remover a viagem da lista
        setTrips(prev => prev.filter(trip => trip.id !== tripId))
        setSuccessMessage('Viagem excluída com sucesso!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(result.error || 'Erro ao excluir viagem')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Erro ao excluir viagem:', error)
      setError('Erro inesperado ao excluir viagem')
      setTimeout(() => setError(''), 5000)
    }
  }

  return (
    <div className="create-trip-container">
      {/* Header */}
      <header className="create-trip-header">
        <div className="header-content">
          <img src={logoHome} alt="Explora Trip" className="logo" />
          <button className="back-btn" onClick={handleBack}>
            ← Voltar ao Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="create-trip-main">
        <div className="form-container">
          <h1 className="page-title">Criar Nova Viagem</h1>
          <p className="page-subtitle">Planeje sua próxima aventura preenchendo os detalhes abaixo</p>

          <form className="trip-form" onSubmit={handleSubmit}>
            {/* Nome da Viagem */}
            <div className="form-group">
              <label className="form-label">Nome da Viagem *</label>
              <input
                type="text"
                className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                placeholder="Ex: Viagem para Paris"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {fieldErrors.name && (
                <span className="field-error-message">{fieldErrors.name}</span>
              )}
            </div>

            {/* Datas */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Início *</label>
                <input
                  type="date"
                  className={`form-input ${fieldErrors.startDate ? 'error' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                {fieldErrors.startDate && (
                  <span className="field-error-message">{fieldErrors.startDate}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Data de Fim *</label>
                <input
                  type="date"
                  className={`form-input ${fieldErrors.endDate ? 'error' : ''}`}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
                {fieldErrors.endDate && (
                  <span className="field-error-message">{fieldErrors.endDate}</span>
                )}
              </div>
            </div>

            {/* Orçamento */}
            <div className="form-group">
              <label className="form-label">Orçamento (R$)</label>
              <input
                type="number"
                className={`form-input ${fieldErrors.budget ? 'error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
              />
              {fieldErrors.budget && (
                <span className="field-error-message">{fieldErrors.budget}</span>
              )}
            </div>

            {/* Notas */}
            <div className="form-group">
              <label className="form-label">Notas da Viagem</label>
              <div className="notes-input-container">
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
                <div className="notes-list">
                  {formData.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <span>{note}</span>
                      <button type="button" onClick={() => removeNote(index)} className="remove-btn">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participantes */}
            <div className="form-group">
              <label className="form-label">Convidar Participantes</label>
              <div className="notes-input-container">
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@exemplo.com"
                  value={currentUserEmail}
                  onChange={(e) => setCurrentUserEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUserRole())}
                />
                <button type="button" className="add-btn" onClick={addUserRole}>
                  Convidar
                </button>
              </div>
              {formData.userRoles.length > 0 && (
                <div className="notes-list">
                  {formData.userRoles.map((userRole, index) => (
                    <div key={index} className="note-item">
                      <span>{userRole.userEmail}</span>
                      <button type="button" onClick={() => removeUserRole(index)} className="remove-btn">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mensagens */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {/* Botões */}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleBack}>
                Cancelar
              </button>

              {/* Mostrar botão alternativo se houver erro de usuário não encontrado */}
              {error && error.toLowerCase().includes('user not found') && (
                <button
                  type="button"
                  className="submit-btn-secondary"
                  onClick={handleSubmitWithoutParticipants}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando...' : 'Criar Sem Participantes'}
                </button>
              )}

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Viagem'}
              </button>
            </div>
          </form>
        </div>

        {/* Seção de Viagens Criadas */}
        <div className="trips-section">
          <div className="trips-header">
            <h2 className="trips-title">Suas Viagens</h2>
            <button className="refresh-btn" onClick={loadTrips} disabled={isLoadingTrips}>
              {isLoadingTrips ? '🔄' : '↻'} Atualizar
            </button>
          </div>

          {tripsError && (
            <div className="trips-error">
              {tripsError}
            </div>
          )}

          {isLoadingTrips ? (
            <div className="trips-loading">
              <div className="loading-spinner"></div>
              <span>Carregando viagens...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="trips-empty">
              <p>Nenhuma viagem encontrada.</p>
              <p>Crie sua primeira viagem usando o formulário acima!</p>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={{
                    id: trip.id,
                    name: trip.name,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    tripBudget: trip.tripBudget ?? 0,
                    notes: trip.notes ?? [],
                    userRoles: trip.userRoles ?? []
                  }}
                  onEdit={handleEditTrip}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edição */}
      <EditTripModal
        isOpen={isEditModalOpen}
        trip={editingTrip}
        onClose={handleCloseEditModal}
        onSave={handleSaveTrip}
        isLoading={isUpdating}
      />
    </div>
  )
}
