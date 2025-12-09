"use client"

import { AlertCircle, RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleRateLimitError, formatRetryTime, isRateLimitError } from "@/src/utils/rateLimitHandler"
import { useState, useEffect } from "react"

interface RateLimitErrorProps {
  error: any
  onRetry?: () => void
  onGoBack?: () => void
}

export function RateLimitError({ error, onRetry, onGoBack }: RateLimitErrorProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (isRateLimitError(error)) {
      setTimeLeft(error.retryAfter)
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [error])

  const canRetry = timeLeft === null || timeLeft === 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">
            Demasiadas Solicitudes
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {handleRateLimitError(error)}
            </AlertDescription>
          </Alert>

          {timeLeft !== null && timeLeft > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Tiempo restante: {formatRetryTime(timeLeft)}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {canRetry && onRetry && (
              <Button 
                onClick={onRetry}
                className="w-full"
                disabled={!canRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Button>
            )}
            
            {onGoBack && (
              <Button 
                variant="outline" 
                onClick={onGoBack}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>💡 <strong>Consejo:</strong> Evita hacer clic repetidamente en los botones para prevenir este error.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
