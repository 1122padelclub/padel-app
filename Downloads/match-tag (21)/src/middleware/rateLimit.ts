import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIP, createRateLimitResponse } from '@/src/utils/rateLimiter'

interface RateLimitOptions {
  config: keyof typeof RATE_LIMIT_CONFIGS
  identifier?: string // Para casos específicos
  skipPaths?: string[] // Rutas a saltar
  skipMethods?: string[] // Métodos HTTP a saltar
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const { config, identifier, skipPaths = [], skipMethods = [] } = options
    
    // Saltar si la ruta está en la lista de exclusión
    const pathname = request.nextUrl.pathname
    if (skipPaths.some(path => pathname.startsWith(path))) {
      return null
    }
    
    // Saltar si el método está en la lista de exclusión
    const method = request.method
    if (skipMethods.includes(method)) {
      return null
    }
    
    // Obtener identificador
    let rateLimitIdentifier: string
    let type: 'ip' | 'user' = 'ip'
    
    if (identifier) {
      // Usar identificador personalizado
      rateLimitIdentifier = identifier
      type = 'user'
    } else {
      // Usar IP del cliente
      rateLimitIdentifier = getClientIP(request)
      type = 'ip'
    }
    
    // Desactivar rate limiting para localhost en desarrollo
    if (process.env.NODE_ENV === 'development' && (rateLimitIdentifier === '::1' || rateLimitIdentifier === '127.0.0.1' || rateLimitIdentifier === 'localhost')) {
      return null
    }
    
    // Verificar límite
    const result = rateLimiter.checkLimit(
      rateLimitIdentifier,
      type,
      RATE_LIMIT_CONFIGS[config]
    )
    
    // Si no está permitido, retornar respuesta de error
    if (!result.allowed) {
      console.log(`[RATE_LIMIT] Blocked ${type}:${rateLimitIdentifier} - ${pathname}`)
      return createRateLimitResponse(
        result.remaining,
        result.resetTime,
        result.retryAfter
      )
    }
    
    // Agregar headers informativos
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS[config].maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
    
    return response
  }
}

// Middlewares predefinidos
export const generalRateLimit = createRateLimitMiddleware({
  config: 'IP_GENERAL',
  skipPaths: ['/api/health', '/api/status']
})

export const authRateLimit = createRateLimitMiddleware({
  config: 'IP_AUTH',
  skipPaths: ['/api/health', '/api/status']
})

export const apiRateLimit = createRateLimitMiddleware({
  config: 'IP_API',
  skipPaths: ['/api/health', '/api/status']
})

// Middleware para usuarios autenticados
export function createUserRateLimit(userId: string) {
  return createRateLimitMiddleware({
    config: 'USER_GENERAL',
    identifier: userId
  })
}

// Middleware para operaciones sensibles de usuarios
export function createStrictUserRateLimit(userId: string) {
  return createRateLimitMiddleware({
    config: 'USER_STRICT',
    identifier: userId
  })
}





