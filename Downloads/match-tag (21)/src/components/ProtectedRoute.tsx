import type { ReactNode } from "react"
import { useRBAC } from "@/src/hooks/useRBAC"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Lock } from "lucide-react"
import type { Permission } from "@/src/types/rbac"

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback,
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, isLoading, currentUser } = useRBAC()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentUser || !currentUser.isActive) {
    return (
      fallback || (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Acceso Denegado</h3>
                <p className="text-muted-foreground">Tu cuenta no está activa o no tienes permisos suficientes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    )
  }

  // Verificar permisos
  let hasAccess = true

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission)
  }

  if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasAccess = requiredPermissions.every((permission) => hasPermission(permission))
    } else {
      hasAccess = hasAnyPermission(requiredPermissions)
    }
  }

  if (!hasAccess) {
    return (
      fallback || (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Permisos Insuficientes</h3>
                <p className="text-muted-foreground">No tienes los permisos necesarios para acceder a esta sección.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    )
  }

  return <>{children}</>
}
