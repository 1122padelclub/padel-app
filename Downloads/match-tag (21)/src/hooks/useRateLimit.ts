"use client"

import { useState, useEffect, useCallback } from 'react'
import { rateLimiter, RATE_LIMIT_CONFIGS } from '@/src/utils/rateLimiter'

interface RateLimitInfo {
  remaining: number
  resetTime: number
  isBlocked: boolean
  retryAfter?: number
}

interface UseRateLimitOptions {
  config: keyof typeof RATE_LIMIT_CONFIGS
  identifier?: string
  type?: 'ip' | 'user'
  onBlocked?: (retryAfter: number) => void
  onLimitReached?: (remaining: number) => void
}

export function useRateLimit(options: UseRateLimitOptions) {
  const { config, identifier, type = 'ip', onBlocked, onLimitReached } = options
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkLimit = useCallback(async (customIdentifier?: string) => {
    setIsLoading(true)
    try {
      const id = customIdentifier || identifier || 'anonymous'
      const result = rateLimiter.checkLimit(id, type, RATE_LIMIT_CONFIGS[config])
      
      const info: RateLimitInfo = {
        remaining: result.remaining,
        resetTime: result.resetTime,
        isBlocked: !result.allowed,
        retryAfter: result.retryAfter
      }
      
      setRateLimitInfo(info)
      
      if (!result.allowed && onBlocked && result.retryAfter) {
        onBlocked(result.retryAfter)
      }
      
      if (result.remaining <= 5 && onLimitReached) {
        onLimitReached(result.remaining)
      }
      
      return result.allowed
    } catch (error) {
      console.error('[RateLimit] Error checking limit:', error)
      return true // Permitir en caso de error
    } finally {
      setIsLoading(false)
    }
  }, [config, identifier, type, onBlocked, onLimitReached])

  const resetLimit = useCallback(() => {
    if (identifier) {
      rateLimiter.reset(identifier, type)
      setRateLimitInfo(null)
    }
  }, [identifier, type])

  const getStats = useCallback(() => {
    if (identifier) {
      return rateLimiter.getStats(identifier, type)
    }
    return null
  }, [identifier, type])

  // Verificar límite automáticamente al montar el componente
  useEffect(() => {
    if (identifier) {
      checkLimit()
    }
  }, [identifier, checkLimit])

  return {
    rateLimitInfo,
    isLoading,
    checkLimit,
    resetLimit,
    getStats,
    isAllowed: rateLimitInfo ? !rateLimitInfo.isBlocked : true,
    remaining: rateLimitInfo?.remaining || 0,
    resetTime: rateLimitInfo?.resetTime || 0
  }
}

// Hook específico para operaciones de autenticación
export function useAuthRateLimit(identifier?: string) {
  return useRateLimit({
    config: 'IP_AUTH',
    identifier,
    type: 'ip',
    onBlocked: (retryAfter) => {
      console.warn(`[AuthRateLimit] Blocked for ${retryAfter} seconds`)
    },
    onLimitReached: (remaining) => {
      console.warn(`[AuthRateLimit] Only ${remaining} attempts remaining`)
    }
  })
}

// Hook específico para operaciones de API
export function useAPIRateLimit(identifier?: string) {
  return useRateLimit({
    config: 'IP_API',
    identifier,
    type: 'ip',
    onBlocked: (retryAfter) => {
      console.warn(`[APIRateLimit] Blocked for ${retryAfter} seconds`)
    },
    onLimitReached: (remaining) => {
      console.warn(`[APIRateLimit] Only ${remaining} requests remaining`)
    }
  })
}

// Hook específico para usuarios autenticados
export function useUserRateLimit(userId: string, strict = false) {
  return useRateLimit({
    config: strict ? 'USER_STRICT' : 'USER_GENERAL',
    identifier: userId,
    type: 'user',
    onBlocked: (retryAfter) => {
      console.warn(`[UserRateLimit] User ${userId} blocked for ${retryAfter} seconds`)
    },
    onLimitReached: (remaining) => {
      console.warn(`[UserRateLimit] User ${userId} has ${remaining} requests remaining`)
    }
  })
}





