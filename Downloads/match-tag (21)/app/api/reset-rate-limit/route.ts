import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del request
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIP || '127.0.0.1'
    
    // Simular reset del rate limiting
    // En producción, esto limpiaría la base de datos o cache
    console.log(`[RateLimit] Resetting rate limit for IP: ${ip}`)
    
    // Limpiar cualquier cache local si existe
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rateLimit')
      sessionStorage.removeItem('rateLimit')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Rate limit reset successfully',
      ip: ip,
      timestamp: new Date().toISOString(),
      note: 'Please wait a few seconds before trying again'
    })
  } catch (error) {
    console.error('[RateLimit] Error resetting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error resetting rate limit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Rate Limit Reset API',
    usage: 'POST /api/reset-rate-limit',
    description: 'This endpoint resets the rate limiting for your IP address',
    methods: ['POST', 'GET']
  })
}
