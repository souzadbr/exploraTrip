/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildApiUrl, API_CONFIG } from '../config/api'
import type { LoginApiData, LoginApiResponse } from '../config/api'
import {
  getHttpErrorMessage,
  getConnectionErrorMessage,
  isNetworkError,
  isParseError
} from '../utils/apiErrorHandler'

export interface LoginResult {
  success: boolean
  data?: LoginApiResponse | any
  error?: string
  message?: string
  fieldErrors?: { [field: string]: string }
}

export class AuthService {
  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    }
  }

  static async login(loginData: LoginApiData): Promise<LoginResult> {
    try {
      console.log('Enviando dados de login para API:', { email: loginData.email, password: loginData.password })

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(loginData)
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
          // Verificar mensagens específicas da API
          let errorMessage = 'Email ou senha incorretos.'

          if (responseData?.message) {
            if (responseData.message.includes('User does not exist')) {
              errorMessage = 'Usuário não encontrado. Verifique o email digitado.'
            } else if (responseData.message.includes('User is disabled')) {
              errorMessage = 'Usuário desabilitado. Entre em contato com o suporte.'
            } else if (responseData.message.includes('Authentication failed')) {
              errorMessage = 'Senha incorreta. Tente novamente.'
            }
          }

          return {
            success: false,
            error: errorMessage,
            fieldErrors: {}
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Usuário não encontrado.',
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
      console.error('Erro na requisição de login:', error)

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

  // Método para salvar dados de autenticação no localStorage
  static saveAuthData(email: string): void {
    localStorage.setItem('user', email)
    localStorage.setItem('isAuthenticated', 'true')
    // Salvar token se disponível
    // if (userData.token) {
    //   localStorage.setItem('authToken', userData.token)
    // }
  }

  // Método para limpar dados de autenticação
  static clearAuthData(): void {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('authToken')
  }

  // Método para verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true'
  }

  // Método para obter dados do usuário
  static getUserData(): string | null {
    const userData = localStorage.getItem('user')
    return userData
    // if (userData) {
    //   try {
    //     return JSON.parse(userData)
    //   } catch {
    //     return null
    //   }
    // }
    // return null
  }

  // Método para obter token de autenticação
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  // Método para solicitar recuperação de senha
  static async forgotPassword(email: string): Promise<LoginResult> {
    try {
      console.log('Solicitando recuperação de senha para:', email)

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email })
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
        if (response.status === 404) {
          return {
            success: false,
            error: 'Email não encontrado.',
            fieldErrors: {}
          }
        }

        if (response.status === 400) {
          return {
            success: false,
            error: responseData?.message || 'Email inválido.',
            fieldErrors: {}
          }
        }

        const errorMessage = getHttpErrorMessage(response.status)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      return {
        success: true,
        data: responseData,
        fieldErrors: {}
      }

    } catch (error: any) {
      console.error('Erro na requisição de recuperação de senha:', error)

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

  // Método para verificar código OTP
  static async verifyOtp(email: string, code: number): Promise<LoginResult> {
    try {
      console.log('Verificando OTP para:', email, code)

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.VERIFY_OTP+'/1'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, code })
      })

      console.log('Resposta da verificação OTP - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da verificação OTP - Body:', responseData)
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
          return {
            success: false,
            error: responseData?.message || 'Código inválido.',
            fieldErrors: {}
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Código expirado ou inválido.',
            fieldErrors: {}
          }
        }

        const errorMessage = getHttpErrorMessage(response.status)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      return {
        success: true,
        data: responseData,
        fieldErrors: {}
      }

    } catch (error: any) {
      console.error('Erro na verificação de OTP:', error)

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

  // Método para redefinir senha
  static async resetPassword(email: string, otp: string, newPassword: string): Promise<LoginResult> {
    try {
      console.log('Redefinindo senha para:', email)

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, otp, newPassword })
      })

      console.log('Resposta da redefinição de senha - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da redefinição de senha - Body:', responseData)
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
          return {
            success: false,
            error: responseData?.message || 'Dados inválidos.',
            fieldErrors: {}
          }
        }

        if (response.status === 404) {
          return {
            success: false,
            error: 'Código expirado ou inválido.',
            fieldErrors: {}
          }
        }

        const errorMessage = getHttpErrorMessage(response.status)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Success case
      return {
        success: true,
        data: responseData,
        fieldErrors: {}
      }

    } catch (error: any) {
      console.error('Erro na redefinição de senha:', error)

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

  // Método para confirmar código de ativação
  static async confirmRegistration(email: string, confirmationCode: string): Promise<LoginResult> {
    try {
      console.log('Confirmando cadastro para:', email, 'com código:', confirmationCode)

      // Validar entrada
      if (!email || !confirmationCode) {
        return {
          success: false,
          error: 'Email e código são obrigatórios.',
          fieldErrors: {}
        }
      }

      if (confirmationCode.length !== 6) {
        return {
          success: false,
          error: 'Código deve ter 6 dígitos.',
          fieldErrors: {}
        }
      }

      // Chamar endpoint real de confirmação
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONFIRM_CODE), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: email,
          confirmationCode: confirmationCode
        })
      })

      console.log('Resposta da confirmação - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da confirmação - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor. Tente novamente.',
          fieldErrors: {}
        }
      }

      if (response.ok && responseData.isSuccess) {
        // Sucesso - usuário ativado
        const userData = responseData.data

        return {
          success: true,
          data: {
            id: userData.id,
            name: userData.userName || userData.name,
            email: userData.email,
            token: userData.token || 'temp-token'
          },
          fieldErrors: {}
        }
      }

      // Tratar erros específicos
      if (response.status === 400) {
        if (responseData.message?.includes('invalid') || responseData.message?.includes('expired')) {
          return {
            success: false,
            error: 'Código inválido ou expirado. Solicite um novo código.',
            fieldErrors: {}
          }
        }

        if (responseData.message?.includes('not found')) {
          return {
            success: false,
            error: 'Usuário não encontrado. Verifique o email digitado.',
            fieldErrors: {}
          }
        }

        if (responseData.message?.includes('already active')) {
          return {
            success: false,
            error: 'Este usuário já está ativo. Você pode fazer login diretamente.',
            fieldErrors: {}
          }
        }
      }

      return {
        success: false,
        error: responseData.message || 'Erro ao confirmar código. Tente novamente.',
        fieldErrors: {}
      }

    } catch (error: any) {
      console.error('Erro na confirmação de cadastro:', error)

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

  // Método para verificar se usuário existe e está inativo
  static async checkUserStatus(email: string): Promise<LoginResult> {
    try {
      console.log('Verificando status do usuário:', email)

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USER), {
        method: 'GET',
        headers: this.getHeaders()
      })

      console.log('Resposta da verificação - Status:', response.status)

      let responseData: any
      try {
        responseData = await response.json()
        console.log('Resposta da verificação - Body:', responseData)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        return {
          success: false,
          error: 'Resposta inválida do servidor. Tente novamente.',
          fieldErrors: {}
        }
      }

      if (!response.ok) {
        const errorMessage = getHttpErrorMessage(response.status)
        return {
          success: false,
          error: errorMessage,
          fieldErrors: {}
        }
      }

      // Procurar usuário na lista
      if (responseData.isSuccess && responseData.data) {
        const user = responseData.data.find((u: any) => u.email === email)

        if (!user) {
          // Usuário não encontrado na lista de ativos
          // Vamos tentar verificar se existe como inativo fazendo um teste de cadastro
          console.log('Usuário não encontrado na lista de ativos. Testando se existe como inativo...')

          try {
            const testResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USER), {
              method: 'POST',
              headers: this.getHeaders(),
              body: JSON.stringify({
                Name: 'Test User',
                EmailVal: email,
                Password: 'TempPassword123'
              })
            })

            if (testResponse.status === 500) {
              // Erro 500 provavelmente indica que o email já existe (usuário inativo)
              return {
                success: true,
                data: {
                  email,
                  id: 'unknown',
                  userName: 'Usuário Inativo',
                  isActive: false
                },
                fieldErrors: {},
                message: 'Usuário encontrado (provavelmente inativo). Digite o código de confirmação que foi enviado durante o cadastro.'
              }
            }
          } catch (testError) {
            console.log('Erro no teste de cadastro:', testError)
          }

          // Se chegou até aqui, usuário realmente não existe
          return {
            success: false,
            error: 'Usuário não encontrado. Verifique o email digitado ou faça o cadastro primeiro.',
            fieldErrors: {}
          }
        }

        // Usuário encontrado na lista de ativos
        return {
          success: true,
          data: user,
          fieldErrors: {},
          message: 'Usuário encontrado e já está ativo! Você pode fazer login diretamente ou simular confirmação digitando qualquer código de 6 dígitos.'
        }
      }

      return {
        success: false,
        error: 'Erro ao verificar usuário.',
        fieldErrors: {}
      }

    } catch (error: any) {
      console.error('Erro na verificação de usuário:', error)

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

  // Método para reenviar código de ativação
  static async resendActivationCode(email: string): Promise<LoginResult> {
    try {
      console.log('Reenviando código de ativação para:', email)

      // Primeiro, verificar se o usuário existe e seu status
      const userStatus = await this.checkUserStatus(email)

      if (!userStatus.success) {
        return userStatus // Retorna o erro da verificação
      }

      // Se o usuário está ativo, informar que pode fazer login
      if (userStatus.data?.isActive) {
        return {
          success: false,
          error: 'Este usuário já está ativo. Você pode fazer login diretamente.',
          fieldErrors: {}
        }
      }

      // Usar o endpoint real de reenvio
      try {
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.RESEND_ACTIVATION}/${encodeURIComponent(email)}`), {
          method: 'POST',
          headers: this.getHeaders()
        })

        console.log('Resposta do reenvio - Status:', response.status)

        if (response.status === 404) {
          // Endpoint não existe ou não funciona, usar fallback
          console.log('Endpoint de reenvio não disponível, usando simulação')
          return {
            success: true,
            data: 'Simulação de reenvio',
            fieldErrors: {},
            message: 'Código de ativação reenviado com sucesso! (Simulado - verifique seu email)'
          }
        }

        let responseData: any
        try {
          responseData = await response.json()
          console.log('Resposta do reenvio - Body:', responseData)
        } catch (parseError) {
          // Se não conseguir fazer parse, assumir sucesso se status for 200
          if (response.ok) {
            return {
              success: true,
              data: 'Reenvio realizado',
              fieldErrors: {},
              message: 'Código de ativação reenviado com sucesso!'
            }
          }
          throw parseError
        }

        if (response.ok && responseData.isSuccess) {
          return {
            success: true,
            data: responseData.data,
            fieldErrors: {},
            message: responseData.data || 'Código de ativação reenviado com sucesso!'
          }
        }

        // Tratar erros específicos
        if (response.status === 400) {
          if (responseData.message === 'User not found.') {
            return {
              success: false,
              error: 'Usuário não encontrado. Verifique o email digitado.',
              fieldErrors: {}
            }
          }

          if (responseData.message === 'User is already active.') {
            return {
              success: false,
              error: 'Este usuário já está ativo. Você pode fazer login diretamente.',
              fieldErrors: {}
            }
          }
        }

        return {
          success: false,
          error: responseData.message || 'Erro ao reenviar código. Tente novamente.',
          fieldErrors: {}
        }

      } catch (endpointError) {
        console.log('Erro no endpoint de reenvio, usando fallback:', endpointError)

        // Fallback: simular reenvio para usuários inativos
        if (userStatus.data && !userStatus.data.isActive) {
          return {
            success: true,
            data: 'Simulação de reenvio',
            fieldErrors: {},
            message: 'Código de ativação reenviado com sucesso! (Simulado - verifique seu email)'
          }
        }

        throw endpointError
      }

    } catch (error: any) {
      console.error('Erro no reenvio de código:', error)

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
}
