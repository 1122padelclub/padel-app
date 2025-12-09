"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useRateLimit } from '@/src/hooks/useRateLimit'

interface RateLimitIndicatorProps {
  config: 'IP_GENERAL' | 'IP_AUTH' | 'IP_API' | 'USER_GENERAL' | 'USER_STRICT'
  identifier?: string
  type?: 'ip' | 'user'
  showProgress?: boolean
  showDetails?: boolean
  className?: string
}

export function RateLimitIndicator({
  config,
  identifier,
  type = 'ip',
  showProgress = true,
  showDetails = false,
  className = ''
}: RateLimitIndicatorProps) {
  const { rateLimitInfo, isLoading, resetLimit, isAllowed } = useRateLimit({
    config,
    identifier,
    type
  })

  const [timeUntilReset, setTimeUntilReset] = useState(0)

  useEffect(() => {
    if (!rateLimitInfo?.resetTime) return

    const updateTime = () => {
      const now = Date.now()
      const timeLeft = Math.max(0, Math.ceil((rateLimitInfo.resetTime - now) / 1000))
      setTimeUntilReset(timeLeft)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [rateLimitInfo?.resetTime])

  if (isLoading || !rateLimitInfo) {
    return null
  }

  const { remaining, resetTime, isBlocked, retryAfter } = rateLimitInfo

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusIcon = () => {
    if (isBlocked) return <XCircle className="h-4 w-4 text-red-500" />
    if (remaining <= 5) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = () => {
    if (isBlocked) return 'border-red-500 bg-red-50'
    if (remaining <= 5) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }

  if (isBlocked) {
    return (
      <Alert className={`border-red-500 bg-red-50 ${className}`}>
        <XCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Rate limit excedido</strong>
            <p className="text-sm text-red-600 mt-1">
              Demasiadas solicitudes. Intenta de nuevo en {formatTime(retryAfter || 0)}.
            </p>
          </div>
          {showDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetLimit}
              className="ml-4"
            >
              Reset
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (remaining <= 5) {
    return (
      <Alert className={`border-yellow-500 bg-yellow-50 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Límite de solicitudes</span>
              <span className="text-sm text-yellow-600">
                {remaining} restantes
              </span>
            </div>
            {showProgress && (
              <Progress
                value={(remaining / 100) * 100}
                className="h-2"
              />
            )}
            {showDetails && (
              <div className="flex items-center text-sm text-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                Se resetea en {formatTime(timeUntilReset)}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (showDetails) {
    return (
      <div className={`border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-gray-600">
              {remaining} solicitudes restantes
            </span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(timeUntilReset)}
          </div>
        </div>
        {showProgress && (
          <Progress
            value={(remaining / 100) * 100}
            className="h-1 mt-2"
          />
        )}
      </div>
    )
  }

  return null
}

// Componente específico para autenticación
export function AuthRateLimitIndicator({ identifier, className }: { identifier?: string; className?: string }) {
  return (
    <RateLimitIndicator
      config="IP_AUTH"
      identifier={identifier}
      type="ip"
      showProgress={true}
      showDetails={true}
      className={className}
    />
  )
}

// Componente específico para APIs
export function APIRateLimitIndicator({ identifier, className }: { identifier?: string; className?: string }) {
  return (
    <RateLimitIndicator
      config="IP_API"
      identifier={identifier}
      type="ip"
      showProgress={true}
      showDetails={true}
      className={className}
    />
  )
}

// Componente específico para usuarios
export function UserRateLimitIndicator({ 
  userId, 
  strict = false, 
  className 
}: { 
  userId: string
  strict?: boolean
  className?: string 
}) {
  return (
    <RateLimitIndicator
      config={strict ? 'USER_STRICT' : 'USER_GENERAL'}
      identifier={userId}
      type="user"
      showProgress={true}
      showDetails={true}
      className={className}
    />
  )
}
