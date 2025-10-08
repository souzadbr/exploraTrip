/* eslint-disable @typescript-eslint/no-explicit-any */
// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5052/api',
  ENDPOINTS: {
    USER: '/user', // POST - Cadastro de usuário
    LOGIN: '/user/login', // POST - Login de usuário
    CONFIRM_CODE: '/user/confirmCode', // POST - Confirmação de código de ativação
    RESEND_ACTIVATION: '/user/resendActivationCode', // POST - Reenvio de código de ativação
    FORGOT_PASSWORD: '/user/forgotPassword', // POST - Solicitar reset de senha
    VERIFY_OTP: '/user/confirmCode', // POST - Verificar código OTP
    RESET_PASSWORD: '/user/resetPassword', // POST - Redefinir senha
    TRIP: '/trip', // POST/GET - Operações de viagem
    GETUSERBYEMAIL: '/user/getUserByEmail', // GET - Pega o usuário pelo e-mail
    GETTRIPBYUSEREMAIL: '/trip/userTrips'
  }
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// API Response interfaces
export interface ApiSuccessResponse<T = any> {
  data: T
  isSuccess: true
  message: string
}

export interface ApiErrorResponse {
  data: null
  isSuccess: false
  message: string
  errors?: {
    [field: string]: string | string[]
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Login specific interfaces
export interface LoginApiData {
  email: string
  password: string
}

export interface LoginApiResponse {
  id: string
  name: string
  email: string
  token?: string
}

// Trip specific interfaces
export interface TripApiData {
  name: string
  startDate: string
  endDate: string
  tripBudget: number
  notes: string[]
  userRoles: Array<{
    userEmail: string
    role: number
  }>
}

export interface TripApiResponse {
  id: string
  name: string
  startDate: string
  endDate: string
  tripBudget: number
  notes: string[]
  userRoles: Array<{
    userEmail: string
    role: number
  }>
}
