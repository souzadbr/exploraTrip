// Utility functions for handling API errors consistently across the application

export interface ApiErrorResponse {
  data: null
  isSuccess: false
  message: string
  errors?: {
    [field: string]: string | string[]
  }
}

export interface ApiSuccessResponse<T = any> {
  data: T
  isSuccess: true
  message: string
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Maps API field errors to form field names
 * Updated to handle ExploraTrip API specific field names
 */
export const mapApiFieldErrors = (apiErrors: { [field: string]: string | string[] }) => {
  const mappedErrors: { [field: string]: string } = {}

  Object.entries(apiErrors).forEach(([field, messages]) => {
    const errorMessage = Array.isArray(messages) ? messages[0] : messages

    // Map API field names to form field names (case-sensitive for ASP.NET)
    switch (field) {
      // ASP.NET validation field names (exact match)
      case 'Name':
        mappedErrors.fullName = errorMessage
        break
      case 'EmailVal':
        mappedErrors.email = errorMessage
        break
      case 'Password':
        mappedErrors.password = errorMessage
        break

      // Lowercase variations for other APIs
      case 'name':
      case 'fullname':
      case 'nome':
        mappedErrors.fullName = errorMessage
        break
      case 'email':
      case 'emailval':
      case 'e-mail':
        mappedErrors.email = errorMessage
        break
      case 'password':
      case 'senha':
        mappedErrors.password = errorMessage
        break
      case 'confirmpassword':
      case 'confirm_password':
      case 'confirmarsenha':
        mappedErrors.confirmPassword = errorMessage
        break

      default:
        // For unknown fields, try to map based on common patterns
        const fieldLower = field.toLowerCase()
        if (fieldLower.includes('email') || fieldLower.includes('mail')) {
          mappedErrors.email = errorMessage
        } else if (fieldLower.includes('password') || fieldLower.includes('senha')) {
          mappedErrors.password = errorMessage
        } else if (fieldLower.includes('name') || fieldLower.includes('nome')) {
          mappedErrors.fullName = errorMessage
        } else {
          // Fallback to original field name
          mappedErrors[field] = errorMessage
        }
    }
  })

  return mappedErrors
}

/**
 * Determines which form field should show an error based on error message content
 */
export const inferFieldFromErrorMessage = (errorMessage: string) => {
  const msg = errorMessage.toLowerCase()
  
  if (msg.includes('email') || msg.includes('e-mail') || msg.includes('mail')) {
    return 'email'
  }
  
  if (msg.includes('nome') || msg.includes('name')) {
    return 'fullName'
  }
  
  if (msg.includes('senha') || msg.includes('password')) {
    return 'password'
  }
  
  if (msg.includes('confirma') || msg.includes('confirm')) {
    return 'confirmPassword'
  }
  
  // Default fallback
  return 'email'
}

/**
 * Gets user-friendly error messages for common HTTP status codes
 * Updated for ExploraTrip API specific responses
 */
export const getHttpErrorMessage = (status: number, apiMessage?: string) => {
  const defaultMessages: { [key: number]: string } = {
    400: 'Dados inválidos. Verifique as informações fornecidas.',
    401: 'Credenciais inválidas. Verifique seu email e senha.',
    403: 'Acesso negado. Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Este email já está cadastrado.',
    422: 'Dados fornecidos são inválidos.',
    429: 'Muitas tentativas. Tente novamente em alguns minutos.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
    502: 'Servidor temporariamente indisponível.',
    503: 'Serviço temporariamente indisponível.',
    504: 'Tempo limite do servidor excedido.'
  }

  // For status 500, always use a user-friendly message instead of technical details
  if (status === 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.'
  }

  return apiMessage || defaultMessages[status] || `Erro do servidor (${status}). Tente novamente.`
}

/**
 * Checks if an error is a network/connection error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError && 
    (error.message.includes('fetch') || 
     error.message.includes('network') ||
     error.message.includes('Failed to fetch'))
  )
}

/**
 * Checks if an error is a JSON parsing error
 */
export const isParseError = (error: any): boolean => {
  return error instanceof SyntaxError
}

/**
 * Gets a user-friendly error message for network and parsing errors
 */
export const getConnectionErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }
  
  if (isParseError(error)) {
    return 'Resposta inválida do servidor. Tente novamente.'
  }
  
  return 'Erro de conexão com o servidor. Tente novamente.'
}
