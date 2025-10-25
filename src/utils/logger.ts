/**
 * Conditional logging utility
 * Logs only in development mode to avoid console pollution in production
 */

const isDevelopment = import.meta.env.DEV

/**
 * Logger utility with conditional logging based on environment
 */
export const logger = {
  /**
   * Log general information (only in development)
   * @param args - Arguments to log
   */
  log: (...args: any[]): void => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log errors (always logged, even in production)
   * @param args - Arguments to log
   */
  error: (...args: any[]): void => {
    console.error(...args)
  },

  /**
   * Log warnings (only in development)
   * @param args - Arguments to log
   */
  warn: (...args: any[]): void => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Log debug information (only in development)
   * @param args - Arguments to log
   */
  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

