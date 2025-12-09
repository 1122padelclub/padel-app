/**
 * Utilidad para manejar errores de rate limit de Firebase
 */

export interface RateLimitError {
  error: string
  message: string
  retryAfter: number
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error?.error === "Rate limit exceeded" && typeof error?.retryAfter === "number"
}

export function formatRetryTime(retryAfter: number): string {
  const minutes = Math.floor(retryAfter / 60)
  const seconds = retryAfter % 60
  
  if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''} y ${seconds} segundo${seconds > 1 ? 's' : ''}`
  }
  
  return `${seconds} segundo${seconds > 1 ? 's' : ''}`
}

export function handleRateLimitError(error: any): string {
  if (isRateLimitError(error)) {
    const timeToWait = formatRetryTime(error.retryAfter)
    return `Demasiadas solicitudes. Por favor, espera ${timeToWait} antes de intentar nuevamente.`
  }
  
  return "Error de conexión. Por favor, intenta nuevamente."
}

/**
 * Retry con backoff exponencial para rate limits
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (isRateLimitError(error)) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Rate limit hit, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
  
  throw lastError
}
