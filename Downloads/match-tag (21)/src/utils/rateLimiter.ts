"use client"

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests en la ventana
  blockDurationMs?: number // Duración del bloqueo en ms
  skipSuccessfulRequests?: boolean // No contar requests exitosos
  skipFailedRequests?: boolean // No contar requests fallidos
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        this.store.delete(key)
      }
    }
  }

  private getKey(identifier: string, type: 'ip' | 'user'): string {
    return `${type}:${identifier}`
  }

  private isBlocked(entry: RateLimitEntry): boolean {
    if (!entry.blocked) return false
    if (!entry.blockUntil) return false
    return Date.now() < entry.blockUntil
  }

  private shouldReset(entry: RateLimitEntry): boolean {
    return Date.now() > entry.resetTime
  }

  checkLimit(
    identifier: string, 
    type: 'ip' | 'user', 
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const key = this.getKey(identifier, type)
    const now = Date.now()
    
    let entry = this.store.get(key)
    
    // Si no existe la entrada, crear una nueva
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      }
      this.store.set(key, entry)
    }

    // Verificar si está bloqueado
    if (this.isBlocked(entry)) {
      const retryAfter = Math.ceil((entry.blockUntil! - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      }
    }

    // Verificar si necesita reset
    if (this.shouldReset(entry)) {
      entry.count = 0
      entry.resetTime = now + config.windowMs
      entry.blocked = false
      entry.blockUntil = undefined
    }

    // Incrementar contador
    entry.count++

    // Verificar si excede el límite
    if (entry.count > config.maxRequests) {
      entry.blocked = true
      entry.blockUntil = now + (config.blockDurationMs || config.windowMs)
      
      const retryAfter = Math.ceil((entry.blockUntil - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }

  // Método para resetear límites (útil para testing)
  reset(identifier: string, type: 'ip' | 'user'): void {
    const key = this.getKey(identifier, type)
    this.store.delete(key)
  }

  // Método para obtener estadísticas
  getStats(identifier: string, type: 'ip' | 'user'): RateLimitEntry | null {
    const key = this.getKey(identifier, type)
    return this.store.get(key) || null
  }

  // Limpiar todo (útil para testing)
  clear(): void {
    this.store.clear()
  }

  // Destruir el limiter
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter()

// Configuraciones predefinidas
export const RATE_LIMIT_CONFIGS = {
  // Límites generales por IP (más permisivos para desarrollo)
  IP_GENERAL: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 200, // 200 requests por 5 minutos
    blockDurationMs: 2 * 60 * 1000 // Bloqueo por 2 minutos
  },
  
  // Límites estrictos para autenticación
  IP_AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10, // 10 intentos de login por 15 minutos
    blockDurationMs: 15 * 60 * 1000 // Bloqueo por 15 minutos
  },
  
  // Límites para APIs sensibles
  IP_API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    blockDurationMs: 2 * 60 * 1000 // Bloqueo por 2 minutos
  },
  
  // Límites por usuario autenticado
  USER_GENERAL: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 120, // 120 requests por minuto
    blockDurationMs: 2 * 60 * 1000 // Bloqueo por 2 minutos
  },
  
  // Límites estrictos para usuarios
  USER_STRICT: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 40, // 40 requests por minuto
    blockDurationMs: 5 * 60 * 1000 // Bloqueo por 5 minutos
  }
}

// Función helper para obtener IP del request
export function getClientIP(request: Request): string {
  try {
    // Intentar obtener IP de diferentes headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    // Fallback a IP local
    return '127.0.0.1'
  } catch (error) {
    console.error('[RateLimiter] Error getting client IP:', error)
    return '127.0.0.1'
  }
}

// Función helper para crear respuesta de rate limit
export function createRateLimitResponse(
  remaining: number, 
  resetTime: number, 
  retryAfter?: number
): Response {
  const headers = new Headers({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'Retry-After': retryAfter?.toString() || '0'
  })

  if (retryAfter) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json'
        }
      }
    )
  }

  return new Response(null, { status: 200, headers })
}
