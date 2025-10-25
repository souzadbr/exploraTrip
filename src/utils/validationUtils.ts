/**
 * Utility functions for form validation
 */

/**
 * Email validation regex
 * Validates standard email format: user@domain.com
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Validates if an email address is in valid format
 * @param email - Email string to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * validateEmail("user@example.com") // true
 * validateEmail("invalid") // false
 * validateEmail("user@") // false
 */
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Validates if a string is not empty after trimming
 * @param value - String to validate
 * @returns True if not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Validates if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validates if start date is before end date
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns True if start is before end, false otherwise
 */
export const isStartBeforeEnd = (startDate: string, endDate: string): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return start < end
}

/**
 * Validates if a number is positive
 * @param value - Number to validate
 * @returns True if positive or null, false otherwise
 */
export const isPositiveOrNull = (value: number | null): boolean => {
  if (value === null) return true
  return value >= 0
}

