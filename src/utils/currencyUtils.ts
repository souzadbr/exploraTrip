/**
 * Utility functions for currency formatting and parsing
 * Handles Brazilian Real (R$) format: R$ 1.234,56
 */

/**
 * Formats a numeric input value as Brazilian currency
 * @param value - String input from user (can contain any characters)
 * @returns Formatted string in Brazilian currency format (e.g., "1.234,56")
 * 
 * @example
 * formatCurrencyInput("123456") // "1.234,56"
 * formatCurrencyInput("abc123") // "1,23"
 * formatCurrencyInput("") // ""
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '')
  
  if (numbers === '') return ''
  
  // Converte para número (centavos) e formata
  const amount = parseInt(numbers) / 100
  
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Parses a formatted currency string to a number
 * @param value - Formatted currency string (e.g., "1.234,56" or "R$ 1.234,56")
 * @returns Number value or null if empty/invalid
 * 
 * @example
 * parseCurrencyInput("1.234,56") // 1234.56
 * parseCurrencyInput("R$ 1.234,56") // 1234.56
 * parseCurrencyInput("") // null
 */
export const parseCurrencyInput = (value: string): number | null => {
  if (!value || value.trim() === '') return null
  
  // Remove R$, espaços e pontos de milhar
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? null : parsed
}

/**
 * Formats a number as Brazilian currency for display
 * @param amount - Number to format
 * @returns Formatted string with R$ prefix (e.g., "R$ 1.234,56")
 * 
 * @example
 * formatCurrencyDisplay(1234.56) // "R$ 1.234,56"
 * formatCurrencyDisplay(null) // "Não definido"
 * formatCurrencyDisplay(0) // "R$ 0,00"
 */
export const formatCurrencyDisplay = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return 'Não definido'
  }
  
  if (isNaN(amount)) {
    return 'Não definido'
  }
  
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Validates if a currency value is valid (non-negative)
 * @param value - Number to validate
 * @returns True if valid, false otherwise
 */
export const isValidCurrencyValue = (value: number | null): boolean => {
  if (value === null) return true // null is valid (optional field)
  return !isNaN(value) && value >= 0
}

