import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Obtener IP de forma simple
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1'
    
    // Simular rate limiting básico
    const timestamp = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutos
    const maxRequests = 100
    
    // Simular contador (en producción esto sería persistente)
    const mockRemaining = Math.max(0, maxRequests - Math.floor(Math.random() * 10))
    const mockResetTime = timestamp + windowMs
    
    const response = NextResponse.json({
      success: true,
      data: {
        ip,
        allowed: true,
        remaining: mockRemaining,
        resetTime: mockResetTime,
        retryAfter: undefined,
        timestamp: new Date().toISOString(),
        message: 'Rate limiting funcionando correctamente'
      }
    })
    
    // Agregar headers informativos
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', mockRemaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(mockResetTime / 1000).toString())
    
    return response
  } catch (error) {
    console.error('[TestRateLimit] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'test':
        return NextResponse.json({
          success: true,
          message: 'Test POST funcionando',
          action,
          timestamp: new Date().toISOString()
        })
      
      case 'reset':
        return NextResponse.json({
          success: true,
          message: 'Rate limit reset (simulado)',
          timestamp: new Date().toISOString()
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida',
          validActions: ['test', 'reset']
        })
    }
  } catch (error) {
    console.error('[TestRateLimit] POST Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error procesando POST',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}





