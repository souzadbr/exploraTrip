/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildApiUrl, API_CONFIG } from '../config/api'
import type { TripApiData, TripApiResponse } from '../config/api'
import {
  getHttpErrorMessage,
  getConnectionErrorMessage,
  isNetworkError,
  isParseError
} from '../utils/apiErrorHandler'
import { AuthService } from './authService'

export interface CreateTripResult {
  success: boolean
  data?: TripApiResponse
  error?: string
  fieldErrors?: { [field: string]: string }
}

export interface GetTripsResult {
  success: boolean
  data?: TripApiResponse[]
  error?: string
}

export interface UpdateTripResult {
  success: boolean
  data?: TripApiResponse
  error?: string
  fieldErrors?: { [field: string]: string }
}

export interface DeleteTripResult {
  success: boolean
  error?: string
}

export class TripService {
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

  static async createTrip(tripData: TripApiData): Promise<CreateTripResult> {
    try {
      console.log('Enviando dados da viagem para API:', tripData)
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TRIP), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData)
      })

      console.log('Resposta da API - Status:', response.status)
      console.log('Resposta da API - Headers:', response.headers)

      // Parse response body for both success and error cases
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
        // Handle different error response formats from the API
        
        if (response.status === 400) {
          // Check if it's a validation error response (ASP.NET format)
          if ('errors' in responseData && 'title' in responseData) {
            return {
              success: false,
              error: responseData.title || 'Dados inválidos fornecidos.',
              fieldErrors: responseData.errors || {}
            }
          }

          // Check if it's a simple API error response
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
            error: 'Sessão expirada. Faça login novamente.',
            fieldErrors: {}
          }
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Você não tem permissão para criar viagens.',
            fieldErrors: {}
          }
        }

        if (response.status === 500) {
          return {
            success: false,
            error: 'Erro interno do servidor. Tente novamente mais tarde.',
            fieldErrors: {}
          }
        }

        // Fallback for other error types
        const errorMessage = getHttpErrorMessage(response.status, responseData?.message)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      if (responseData.isSuccess) {
        return { 
          success: true, 
          data: responseData.data,
          fieldErrors: {} 
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Erro desconhecido do servidor',
          fieldErrors: {}
        }
      }

    } catch (error: any) {
      console.error('Erro na requisição:', error)

      if (isNetworkError(error) || isParseError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(error),
          fieldErrors: {}
        }
      }

      return {
        success: false,
        error: 'Erro inesperado. Tente novamente.',
        fieldErrors: {}
      }
    }
  }

  static async getTripsByUserEmail(email: string): Promise<GetTripsResult> {
  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.GETTRIPBYUSEREMAIL}/${email}`),
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    let responseData: any;
    try {
      responseData = await response.json();
      console.log('Resposta da API - Body:', responseData);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
      return {
        success: false,
        error: 'Resposta inválida do servidor. Tente novamente.'
      };
    }

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Sessão expirada. Faça login novamente.'
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: 'Você não tem permissão para visualizar viagens.'
        };
      }

      if (response.status === 404) {
        // 404 pode significar que não há viagens, retornar lista vazia
        console.log('No trips found (404), returning empty array');
        return {
          success: true,
          data: []
        };
      }

      const errorMessage = getHttpErrorMessage(response.status, responseData?.message);
      return {
        success: false,
        error: errorMessage
      };
    }

    // Success case
    if (responseData.isSuccess) {
      console.log('Viagens carregadas com sucesso:', responseData.data);
      return {
        success: true,
        data: responseData.data || []
      };
    } else {
      return {
        success: false,
        error: responseData.message || 'Erro desconhecido do servidor'
      };
    }
  } catch (error: any) {
    console.error('Erro na requisição:', error);

    if (isNetworkError(error) || isParseError(error)) {
      return {
        success: false,
        error: getConnectionErrorMessage(error)
      };
    }

    return {
      success: false,
      error: 'Erro inesperado. Tente novamente.'
    };
  }
}

  static async getTrips(): Promise<GetTripsResult> {
    try {
      console.log('Buscando viagens do usuário...')

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TRIP), {
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
          error: 'Resposta inválida do servidor. Tente novamente.'
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: 'Sessão expirada. Faça login novamente.'
          }
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Você não tem permissão para visualizar viagens.'
          }
        }

        if (response.status === 404) {
          // 404 pode significar que não há viagens, retornar lista vazia
          console.log('No trips found (404), returning empty array')
          return {
            success: true,
            data: []
          }
        }

        const errorMessage = getHttpErrorMessage(response.status, responseData?.message)
        return {
          success: false,
          error: errorMessage
        }
      }

      // Success case
      if (responseData.isSuccess) {
        console.log('Viagens carregadas com sucesso:', responseData.data)
        return {
          success: true,
          data: responseData.data || []
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Erro desconhecido do servidor'
        }
      }

    } catch (error: any) {
      console.error('Erro na requisição:', error)

      if (isNetworkError(error) || isParseError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(error)
        }
      }

      return {
        success: false,
        error: 'Erro inesperado. Tente novamente.'
      }
    }
  }

  static async updateTrip(tripId: string, tripData: TripApiData): Promise<UpdateTripResult> {
    try {
      console.log('Atualizando viagem:', tripId, tripData)

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.TRIP}/${tripId}`), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData)
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
          // Check if it's a validation error response (ASP.NET format)
          if ('errors' in responseData && 'title' in responseData) {
            return {
              success: false,
              error: responseData.title || 'Dados inválidos fornecidos.',
              fieldErrors: responseData.errors || {}
            }
          }

          // Check if it's a simple API error response
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
            error: 'Sessão expirada. Faça login novamente.',
            fieldErrors: {}
          }
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Você não tem permissão para editar esta viagem.',
            fieldErrors: {}
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Viagem não encontrada.',
            fieldErrors: {}
          }
        }

        const errorMessage = getHttpErrorMessage(response.status, responseData?.message)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      if (responseData.isSuccess) {
        return {
          success: true,
          data: responseData.data,
          fieldErrors: {}
        }
      } else {
        return {
          success: false,
          error: responseData.message || 'Erro desconhecido do servidor',
          fieldErrors: {}
        }
      }

    } catch (error: any) {
      console.error('Erro na requisição:', error)

      if (isNetworkError(error) || isParseError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(error),
          fieldErrors: {}
        }
      }

      return {
        success: false,
        error: 'Erro inesperado. Tente novamente.',
        fieldErrors: {}
      }
    }
  }

  static async deleteTrip(tripId: string): Promise<DeleteTripResult> {
    try {
      console.log('Deletando viagem:', tripId)

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.TRIP}/${tripId}`), {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      console.log('Resposta da API - Status:', response.status)

      if (!response.ok) {
        let responseData: any = {}
        try {
          responseData = await response.json()
        } catch (parseError) {
          // Ignore parse errors for DELETE requests
          console.log(parseError)
        }

        if (response.status === 401) {
          return {
            success: false,
            error: 'Sessão expirada. Faça login novamente.'
          }
        }

        if (response.status === 403) {
          return {
            success: false,
            error: 'Você não tem permissão para deletar esta viagem.'
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Viagem não encontrada.'
          }
        }

        const errorMessage = getHttpErrorMessage(response.status, responseData?.message)
        return {
          success: false,
          error: errorMessage
        }
      }

      // Success case - DELETE usually returns 204 No Content or 200 OK
      return {
        success: true
      }

    } catch (error: any) {
      console.error('Erro na requisição:', error)

      if (isNetworkError(error) || isParseError(error)) {
        return {
          success: false,
          error: getConnectionErrorMessage(error)
        }
      }

      return {
        success: false,
        error: 'Erro inesperado. Tente novamente.'
      }
    }
  }

}
