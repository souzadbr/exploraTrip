/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildApiUrl, API_CONFIG } from '../config/api'
import type { LocalApiData, LocalApiResponse } from '../config/api'
import {
  getHttpErrorMessage,
  getConnectionErrorMessage,
  isNetworkError,
  isParseError
} from '../utils/apiErrorHandler'
import { AuthService } from './authService'

export interface CreateLocalResult {
  success: boolean
  data?: LocalApiResponse
  error?: string
  fieldErrors?: { [field: string]: string }
}

export interface GetLocalsResult {
  success: boolean
  data?: LocalApiResponse[]
  error?: string
}

export interface UpdateLocalResult {
  success: boolean
  data?: LocalApiResponse
  error?: string
  fieldErrors?: { [field: string]: string }
}

export interface DeleteLocalResult {
  success: boolean
  error?: string
}

export class LocalService {
  private static getAuthHeaders(): HeadersInit {
    const token = AuthService.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  static async createLocal(localData: LocalApiData): Promise<CreateLocalResult> {
    try {
      console.log('Enviando dados do local para API:', localData)
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOCAL), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...localData,
          notes: localData.notes === null ? [] : localData.notes
        })
      })

      console.log('Resposta da API - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da API - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor. Tente novamente.',
          fieldErrors: {}
        }
      }

      if (!response.ok) {
        if (response.status === 400) {
          if ('errors' in responseData && 'title' in responseData) {
            return {
              success: false,
              error: responseData.title || 'Dados inválidos fornecidos.',
              fieldErrors: responseData.errors || {}
            }
          }

          if ('isSuccess' in responseData) {
            return {
              success: false,
              error: responseData.message || 'Dados inválidos.',
              fieldErrors: responseData.errors || {}
            }
          }
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Não autorizado. Faça login novamente.',
            fieldErrors: {}
          }
        }

        return {
          success: false,
          error: getHttpErrorMessage(response.status),
          fieldErrors: {}
        }
      }

      if (responseData.isSuccess && responseData.data) {
        return {
          success: true,
          data: responseData.data
        }
      }

      return {
        success: false,
        error: 'Resposta inesperada do servidor.',
        fieldErrors: {}
      }
    } catch (error: any) {
      console.error('Erro ao criar local:', error)

      if (isNetworkError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(),
          fieldErrors: {}
        }
      }

      if (isParseError(error)) {
        return {
          success: false,
          error: 'Erro ao processar resposta do servidor.',
          fieldErrors: {}
        }
      }

      return {
        success: false,
        error: error.message || 'Erro inesperado ao criar local.',
        fieldErrors: {}
      }
    }
  }

  static async getLocalsByTripId(tripId: string): Promise<GetLocalsResult> {
    try {
      console.log('Buscando locais da viagem:', tripId)
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.LOCAL}?tripId=${tripId}`), {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      console.log('Resposta da API - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da API - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor.'
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: responseData.message || 'Viagem não encontrada.'
          }
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Não autorizado. Faça login novamente.'
          }
        }

        return {
          success: false,
          error: getHttpErrorMessage(response.status)
        }
      }

      if (responseData.isSuccess && responseData.data) {
        return {
          success: true,
          data: responseData.data
        }
      }

      return {
        success: false,
        error: 'Resposta inesperada do servidor.'
      }
    } catch (error: any) {
      console.error('Erro ao buscar locais:', error)

      if (isNetworkError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage()
        }
      }

      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar locais.'
      }
    }
  }

  // MÉTODO REMOVIDO: getLocalById não é suportado pelo backend
  // Backend não possui endpoint GET /api/local/{id}
  // Este método não é usado atualmente no frontend
  /*
  static async getLocalById(localId: string): Promise<CreateLocalResult> {
    try {
      console.log('Buscando local:', localId)
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.LOCAL}/${localId}`), {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      console.log('Resposta da API - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da API - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor.',
          fieldErrors: {}
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: responseData.message || 'Local não encontrado.',
            fieldErrors: {}
          }
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Não autorizado. Faça login novamente.',
            fieldErrors: {}
          }
        }

        return {
          success: false,
          error: getHttpErrorMessage(response.status),
          fieldErrors: {}
        }
      }

      if (responseData.isSuccess && responseData.data) {
        return {
          success: true,
          data: responseData.data
        }
      }

      return {
        success: false,
        error: 'Resposta inesperada do servidor.',
        fieldErrors: {}
      }
    } catch (error: any) {
      console.error('Erro ao buscar local:', error)

      if (isNetworkError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(),
          fieldErrors: {}
        }
      }

      return {
        success: false,
        error: error.message || 'Erro inesperado ao buscar local.',
        fieldErrors: {}
      }
    }
  }
  */




  static async updateLocal(localId: string, localData: LocalApiData): Promise<UpdateLocalResult> {
    try {
      console.log('Atualizando local:', localId, localData)

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOCAL), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          localId: localId,
          ...localData,
          notes: localData.notes === null ? [] : localData.notes
        })
      })

      console.log('Resposta da API - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da API - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor. Tente novamente.',
          fieldErrors: {}
        }
      }

      if (!response.ok) {
        if (response.status === 400) {
          if ('errors' in responseData && 'title' in responseData) {
            return {
              success: false,
              error: responseData.title || 'Dados inválidos fornecidos.',
              fieldErrors: responseData.errors || {}
            }
          }

          if ('isSuccess' in responseData) {
            return {
              success: false,
              error: responseData.message || 'Dados inválidos.',
              fieldErrors: responseData.errors || {}
            }
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Local não encontrado.',
            fieldErrors: {}
          }
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Não autorizado. Faça login novamente.',
            fieldErrors: {}
          }
        }

        return {
          success: false,
          error: getHttpErrorMessage(response.status),
          fieldErrors: {}
        }
      }

      if (responseData.isSuccess && responseData.data) {
        return {
          success: true,
          data: responseData.data
        }
      }

      return {
        success: false,
        error: 'Resposta inesperada do servidor.',
        fieldErrors: {}
      }
    } catch (error: any) {
      console.error('Erro ao atualizar local:', error)

      if (isNetworkError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(),
          fieldErrors: {}
        }
      }

      if (isParseError(error)) {
        return {
          success: false,
          error: 'Erro ao processar resposta do servidor.',
          fieldErrors: {}
        }
      }

      return {
        success: false,
        error: error.message || 'Erro inesperado ao atualizar local.',
        fieldErrors: {}
      }
    }
  }

  static async deleteLocal(localId: string): Promise<DeleteLocalResult> {
    try {
      console.log('Deletando local:', localId)
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.LOCAL}?localID=${localId}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      console.log('Resposta da API - Status:', response.status)

      if (!response.ok) {
        let responseData: any
        try {
          responseData = await response.json()
          console.log('Resposta da API - Body:', responseData)
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError)
        }

        if (response.status === 404) {
          return {
            success: false,
            error: responseData?.message || 'Local não encontrado.'
          }
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Não autorizado. Faça login novamente.'
          }
        }

        return {
          success: false,
          error: getHttpErrorMessage(response.status)
        }
      }

      return {
        success: true
      }
    } catch (error: any) {
      console.error('Erro ao deletar local:', error)

      if (isNetworkError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage()
        }
      }

      return {
        success: false,
        error: error.message || 'Erro inesperado ao deletar local.'
      }
    }
  }
}
