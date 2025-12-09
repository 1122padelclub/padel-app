"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface RateLimitTestResult {
  success: boolean
  data: {
    ip: string
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
    timestamp: string
  }
}

export default function RateLimitTestPage() {
  const [results, setResults] = useState<RateLimitTestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<any>(null)

  const testRateLimit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/test-rate-limit')
      const result = await response.json()
      
      if (result.success) {
        setResults(prev => [result, ...prev.slice(0, 9)]) // Mantener solo los últimos 10
      } else {
        setError('Error en la prueba de rate limiting')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const resetRateLimit = async () => {
    try {
      const response = await fetch('/api/test-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })
      
      const result = await response.json()
      if (result.success) {
        setResults([])
        setError('')
      }
    } catch (err) {
      setError('Error al resetear rate limit')
    }
  }

  const getStats = async () => {
    try {
      const response = await fetch('/api/test-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' })
      })
      
      const result = await response.json()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (err) {
      console.error('Error getting stats:', err)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusIcon = (allowed: boolean, remaining: number) => {
    if (!allowed) return <XCircle className="h-4 w-4 text-red-500" />
    if (remaining <= 5) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = (allowed: boolean, remaining: number) => {
    if (!allowed) return 'border-red-500 bg-red-50'
    if (remaining <= 5) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }

  useEffect(() => {
    // Test inicial
    testRateLimit()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rate Limiting Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testRateLimit} disabled={isLoading}>
                {isLoading ? 'Probando...' : 'Probar Rate Limit'}
              </Button>
              <Button variant="outline" onClick={resetRateLimit}>
                Reset Rate Limit
              </Button>
              <Button variant="outline" onClick={getStats}>
                Ver Stats
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {stats && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Estadísticas del Rate Limiter</h3>
                  <pre className="text-sm bg-white p-2 rounded border">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados de las Pruebas</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay resultados aún. Haz clic en "Probar Rate Limit" para comenzar.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getStatusColor(result.data.allowed, result.data.remaining)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.data.allowed, result.data.remaining)}
                        <span className="font-medium">
                          {result.data.allowed ? 'Permitido' : 'Bloqueado'}
                        </span>
                        <Badge variant={result.data.allowed ? 'default' : 'destructive'}>
                          {result.data.remaining} restantes
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTime(result.data.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>IP:</strong> {result.data.ip}</p>
                      <p><strong>Reset Time:</strong> {formatTime(result.data.resetTime)}</p>
                      {result.data.retryAfter && (
                        <p><strong>Retry After:</strong> {result.data.retryAfter}s</p>
                      )}
                    </div>
                    
                    {result.data.allowed && (
                      <div className="mt-2">
                        <Progress 
                          value={(result.data.remaining / 100) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">IP General</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ventana: 15 minutos</li>
                  <li>• Máximo: 100 requests</li>
                  <li>• Bloqueo: 30 minutos</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">IP Auth</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ventana: 15 minutos</li>
                  <li>• Máximo: 5 requests</li>
                  <li>• Bloqueo: 1 hora</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">IP API</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ventana: 1 minuto</li>
                  <li>• Máximo: 30 requests</li>
                  <li>• Bloqueo: 5 minutos</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">User General</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ventana: 1 minuto</li>
                  <li>• Máximo: 60 requests</li>
                  <li>• Bloqueo: 5 minutos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





