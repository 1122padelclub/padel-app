"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUserManagement } from "@/src/hooks/useRBAC"
import { ProtectedRoute } from "./ProtectedRoute"
import { Shield, Plus, Edit, Trash2, Eye, EyeOff, Clock, MapPin, Smartphone, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { User, Role, Permission } from "@/src/types/rbac"

interface UserManagementPanelProps {
  barId: string
}

export function UserManagementPanel({ barId }: UserManagementPanelProps) {
  return (
    <ProtectedRoute requiredPermissions={["staff.view", "staff.manage"]} requireAll={false}>
      <UserManagementContent barId={barId} />
    </ProtectedRoute>
  )
}

function UserManagementContent({ barId }: { barId: string }) {
  const {
    users,
    roles,
    sessions,
    securityLogs,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    revokeUserSession,
  } = useUserManagement(barId)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando gestión de usuarios...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gestión de Usuarios y Seguridad
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <CreateUserForm
                    roles={roles}
                    onSubmit={async (userData) => {
                      const success = await createUser(userData)
                      if (success) setIsCreateUserOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Rol
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Rol</DialogTitle>
                  </DialogHeader>
                  <CreateRoleForm
                    onSubmit={async (roleData) => {
                      const success = await createRole(roleData)
                      if (success) setIsCreateRoleOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} roles={roles} onUpdate={updateUser} onDelete={deleteUser} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                userCount={users.filter((u) => u.roleId === role.id).length}
                onUpdate={updateRole}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                user={users.find((u) => u.id === session.userId)}
                onRevoke={revokeUserSession}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-2">
            {securityLogs.map((log) => (
              <SecurityLogCard key={log.id} log={log} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componentes auxiliares
function UserCard({
  user,
  roles,
  onUpdate,
  onDelete,
}: {
  user: User
  roles: Role[]
  onUpdate: (id: string, updates: Partial<User>) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}) {
  const userRole = roles.find((r) => r.id === user.roleId)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{user.name}</h3>
              <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Activo" : "Inactivo"}</Badge>
              {userRole && <Badge variant="outline">{userRole.name}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
            {user.lastLoginAt && (
              <p className="text-xs text-muted-foreground">
                Último acceso: {format(new Date(user.lastLoginAt), "dd/MM/yyyy HH:mm", { locale: es })}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onUpdate(user.id, { isActive: !user.isActive })}>
              {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <ProtectedRoute requiredPermission="staff.delete">
              <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </ProtectedRoute>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RoleCard({
  role,
  userCount,
  onUpdate,
}: {
  role: Role
  userCount: number
  onUpdate: (id: string, updates: Partial<Role>) => Promise<boolean>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{role.name}</h3>
              {role.isSystemRole && <Badge variant="secondary">Sistema</Badge>}
              <Badge variant="outline">{userCount} usuarios</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 5).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
              {role.permissions.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 5} más
                </Badge>
              )}
            </div>
          </div>
          {!role.isSystemRole && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionCard({
  session,
  user,
  onRevoke,
}: {
  session: any
  user?: User
  onRevoke: (id: string) => Promise<boolean>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-semibold">{user?.name || "Usuario desconocido"}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {session.ipAddress}
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                {session.deviceInfo}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(session.createdAt), "dd/MM HH:mm", { locale: es })}
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onRevoke(session.id)}>
            Revocar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SecurityLogCard({ log }: { log: any }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${getSeverityColor(log.severity)}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">{log.action}</span>
            <Badge variant="outline" className="text-xs">
              {log.severity}
            </Badge>
          </div>
          <p className="text-sm">{log.resource}</p>
          <p className="text-xs opacity-75">
            {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })} - {log.ipAddress}
          </p>
        </div>
      </div>
    </div>
  )
}

function CreateUserForm({
  roles,
  onSubmit,
}: {
  roles: Role[]
  onSubmit: (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
    isActive: true,
    twoFactorEnabled: false,
    sessionTimeout: 480, // 8 horas
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      barId: "", // Se establecerá en el hook
      lastLoginAt: undefined,
      allowedIPs: undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="active">Usuario activo</Label>
      </div>

      <Button type="submit" className="w-full">
        Crear Usuario
      </Button>
    </form>
  )
}

function CreateRoleForm({
  onSubmit,
}: {
  onSubmit: (roleData: Omit<Role, "id" | "createdAt" | "updatedAt">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
    isSystemRole: false,
  })

  const allPermissions: Permission[] = [
    "orders.view",
    "orders.manage",
    "orders.delete",
    "menu.view",
    "menu.edit",
    "menu.delete",
    "customers.view",
    "customers.edit",
    "customers.export",
    "analytics.view",
    "analytics.advanced",
    "analytics.export",
    "staff.view",
    "staff.manage",
    "staff.delete",
    "settings.view",
    "settings.edit",
    "settings.advanced",
    "reservations.view",
    "reservations.manage",
    "reviews.view",
    "reviews.respond",
    "reviews.moderate",
    "announcements.view",
    "announcements.create",
    "announcements.delete",
    "themes.view",
    "themes.edit",
    "billing.view",
    "billing.manage",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const togglePermission = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="roleName">Nombre del Rol</Label>
        <Input
          id="roleName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="roleDescription">Descripción</Label>
        <Input
          id="roleDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Permisos</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
          {allPermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={permission}
                checked={formData.permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
                className="rounded"
              />
              <Label htmlFor={permission} className="text-sm">
                {permission}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Crear Rol
      </Button>
    </form>
  )
}
