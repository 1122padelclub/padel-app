import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { generalRateLimit, authRateLimit, apiRateLimit } from "@/src/middleware/rateLimit"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Aplicar rate limiting según la ruta
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/admin/login')) {
    // Rate limiting estricto para autenticación
    const authResponse = authRateLimit(request)
    if (authResponse) return authResponse
  } else if (pathname.startsWith('/api/')) {
    // Rate limiting para APIs
    const apiResponse = apiRateLimit(request)
    if (apiResponse) return apiResponse
  } else {
    // Rate limiting general para otras rutas
    const generalResponse = generalRateLimit(request)
    if (generalResponse) return generalResponse
  }

  // Lógica existente para cache headers
  const barDependentRoutes = ["/mesa", "/admin/personalizacion-mesas", "/admin/reservas"]

  const isReservationRoute = /^\/reservar\/[^/]+/.test(pathname)

  const isBarDependent =
    barDependentRoutes.some((route) => pathname.startsWith(route)) || isReservationRoute || searchParams.has("barId")

  if (isBarDependent) {
    const response = NextResponse.next()

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    console.log("[Middleware] Applied no-cache headers to:", pathname)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)",
  ],
}
