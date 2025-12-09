# 🛡️ Rate Limiting Implementation

## 📋 Resumen

Sistema completo de rate limiting implementado para proteger la aplicación contra ataques de fuerza bruta, spam y abuso. Funciona tanto por IP como por usuario autenticado.

## 🚀 Características

- ✅ **Rate limiting por IP** - Protección contra ataques desde la misma IP
- ✅ **Rate limiting por usuario** - Control granular por usuario autenticado
- ✅ **Múltiples configuraciones** - Diferentes límites para diferentes tipos de operaciones
- ✅ **Bloqueo temporal** - Bloqueo automático después de exceder límites
- ✅ **Headers informativos** - Headers HTTP para mostrar estado del rate limit
- ✅ **UI indicators** - Componentes React para mostrar estado en tiempo real
- ✅ **API de testing** - Endpoints para probar y monitorear el sistema

## 📊 Configuraciones Disponibles

### **IP_GENERAL** (Rutas generales)
- **Ventana**: 15 minutos
- **Máximo**: 100 requests
- **Bloqueo**: 30 minutos
- **Uso**: Páginas generales, navegación

### **IP_AUTH** (Autenticación)
- **Ventana**: 15 minutos
- **Máximo**: 5 requests
- **Bloqueo**: 1 hora
- **Uso**: Login, registro, recuperación de contraseña

### **IP_API** (APIs)
- **Ventana**: 1 minuto
- **Máximo**: 30 requests
- **Bloqueo**: 5 minutos
- **Uso**: Endpoints de API, operaciones sensibles

### **USER_GENERAL** (Usuarios autenticados)
- **Ventana**: 1 minuto
- **Máximo**: 60 requests
- **Bloqueo**: 5 minutos
- **Uso**: Operaciones normales de usuarios

### **USER_STRICT** (Operaciones sensibles de usuarios)
- **Ventana**: 1 minuto
- **Máximo**: 20 requests
- **Bloqueo**: 10 minutos
- **Uso**: Cambios de configuración, operaciones críticas

## 🔧 Uso

### **1. En Middleware (Automático)**

El rate limiting se aplica automáticamente en `middleware.ts`:

```typescript
// Se aplica automáticamente según la ruta
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
```

### **2. En Componentes React**

```typescript
import { useAuthRateLimit, useAPIRateLimit, useUserRateLimit } from '@/src/hooks/useRateLimit'

// Para autenticación
function LoginComponent() {
  const { checkLimit, isAllowed, remaining } = useAuthRateLimit()
  
  const handleLogin = async () => {
    const allowed = await checkLimit()
    if (!allowed) {
      alert('Demasiados intentos de login')
      return
    }
    // Proceder con login
  }
}

// Para usuarios autenticados
function UserComponent({ userId }: { userId: string }) {
  const { checkLimit, isAllowed } = useUserRateLimit(userId, true) // strict mode
  
  const handleSensitiveOperation = async () => {
    const allowed = await checkLimit()
    if (!allowed) {
      alert('Demasiadas operaciones sensibles')
      return
    }
    // Proceder con operación
  }
}
```

### **3. En APIs**

```typescript
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIP } from '@/src/utils/rateLimiter'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  
  // Verificar rate limit
  const result = rateLimiter.checkLimit(ip, 'ip', RATE_LIMIT_CONFIGS.IP_API)
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { 
        status: 429,
        headers: { 'Retry-After': result.retryAfter?.toString() || '0' }
      }
    )
  }
  
  // Proceder con la lógica de la API
}
```

### **4. Componentes UI**

```typescript
import { AuthRateLimitIndicator, APIRateLimitIndicator, UserRateLimitIndicator } from '@/src/components/RateLimitIndicator'

// En el login
<AuthRateLimitIndicator className="mb-4" />

// En APIs
<APIRateLimitIndicator className="mb-4" />

// Para usuarios
<UserRateLimitIndicator userId={userId} strict={true} />
```

## 🧪 Testing

### **Página de Testing**

Visita `/test-rate-limit` para probar el sistema:

- ✅ Probar rate limiting en tiempo real
- ✅ Ver estadísticas del rate limiter
- ✅ Resetear límites para testing
- ✅ Monitorear headers HTTP

### **API de Testing**

```bash
# Probar rate limit
curl http://localhost:3000/api/test-rate-limit

# Resetear rate limit
curl -X POST http://localhost:3000/api/test-rate-limit \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'

# Ver estadísticas
curl -X POST http://localhost:3000/api/test-rate-limit \
  -H "Content-Type: application/json" \
  -d '{"action": "stats"}'
```

## 📈 Monitoreo

### **Headers HTTP**

El sistema incluye headers informativos:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 300 (solo cuando está bloqueado)
```

### **Logs**

```typescript
// En la consola del navegador
[RATE_LIMIT] Blocked ip:192.168.1.1 - /api/sensitive-endpoint
[AuthRateLimit] Blocked for 3600 seconds
[APIRateLimit] Only 5 requests remaining
```

## ⚙️ Configuración Avanzada

### **Personalizar Límites**

```typescript
// En src/utils/rateLimiter.ts
export const RATE_LIMIT_CONFIGS = {
  CUSTOM: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 50, // 50 requests
    blockDurationMs: 15 * 60 * 1000 // Bloqueo por 15 minutos
  }
}
```

### **Middleware Personalizado**

```typescript
import { createRateLimitMiddleware } from '@/src/middleware/rateLimit'

const customRateLimit = createRateLimitMiddleware({
  config: 'CUSTOM',
  skipPaths: ['/api/health'],
  skipMethods: ['GET']
})
```

## 🔒 Seguridad

### **Protección Implementada**

- ✅ **Ataques de fuerza bruta** - Límites estrictos en autenticación
- ✅ **Spam de APIs** - Rate limiting en endpoints
- ✅ **Abuso de usuarios** - Control por usuario autenticado
- ✅ **DDoS básico** - Protección por IP
- ✅ **Bypass prevention** - Múltiples capas de validación

### **Recomendaciones Adicionales**

1. **Monitoreo externo** - Integrar con servicios como Cloudflare
2. **IP whitelist** - Permitir IPs confiables
3. **Geolocalización** - Bloquear regiones sospechosas
4. **Machine learning** - Detectar patrones anómalos
5. **Rate limiting distribuido** - Para aplicaciones multi-instancia

## 📚 Archivos Creados

```
src/utils/rateLimiter.ts          # Lógica principal del rate limiter
src/middleware/rateLimit.ts       # Middlewares predefinidos
src/hooks/useRateLimit.ts         # Hooks de React
src/components/RateLimitIndicator.tsx # Componentes UI
app/api/test-rate-limit/route.ts  # API de testing
app/test-rate-limit/page.tsx      # Página de testing
middleware.ts                     # Middleware principal (actualizado)
app/admin/login/page.tsx          # Login con rate limiting (actualizado)
```

## 🚀 Próximos Pasos

1. **Monitoreo en producción** - Integrar con servicios de logging
2. **Rate limiting por endpoint** - Límites específicos por ruta
3. **Rate limiting distribuido** - Para múltiples instancias
4. **Machine learning** - Detección automática de patrones anómalos
5. **Dashboard de administración** - Panel para monitorear rate limits

---

**¡El sistema de rate limiting está listo para proteger tu aplicación!** 🛡️





