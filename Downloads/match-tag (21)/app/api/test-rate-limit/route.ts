import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIP } from '@/src/utils/rateLimiter'

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  
  // Probar rate limiting general
  const result = rateLimiter.checkLimit(ip, 'ip', RATE_LIMIT_CONFIGS.IP_GENERAL)
  
  const response = NextResponse.json({
    success: true,
    data: {
      ip,
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter,
      timestamp: new Date().toISOString()
    }
  })
  
  // Agregar headers informativos
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS.IP_GENERAL.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }
  
  return response
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const body = await request.json()
  const { action, identifier, type = 'ip' } = body
  
  switch (action) {
    case 'reset':
      if (identifier) {
        rateLimiter.reset(identifier, type)
        return NextResponse.json({ success: true, message: 'Rate limit reset' })
      }
      return NextResponse.json({ success: false, error: 'Identifier required' })
    
    case 'stats':
      if (identifier) {
        const stats = rateLimiter.getStats(identifier, type)
        return NextResponse.json({ success: true, stats })
      }
      return NextResponse.json({ success: false, error: 'Identifier required' })
    
    case 'test':
      const testResult = rateLimiter.checkLimit(ip, 'ip', RATE_LIMIT_CONFIGS.IP_GENERAL)
      return NextResponse.json({
        success: true,
        data: {
          ip,
          allowed: testResult.allowed,
          remaining: testResult.remaining,
          resetTime: testResult.resetTime,
          retryAfter: testResult.retryAfter
        }
      })
    
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' })
  }
}





