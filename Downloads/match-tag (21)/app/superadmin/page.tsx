"use client"

import { RoleGate } from "@/src/components/RoleGate"
import { useAuth } from "@/src/hooks/useAuth"
import { SuperAdminBarsList } from "@/src/components/SuperAdminBarsList"
import { SuperAdminUsersList } from "@/src/components/SuperAdminUsersList"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

function SuperAdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif">Super Admin</h1>
            <p className="text-muted-foreground">Panel de administración global - {user?.email}</p>
          </div>
          <Button onClick={logout} variant="outline" className="rounded-xl bg-transparent">
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="bars" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl mb-6">
            <TabsTrigger value="bars" className="rounded-lg">
              Bares
            </TabsTrigger>
            <TabsTrigger value="admins" className="rounded-lg">
              Administradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bars">
            <SuperAdminBarsList />
          </TabsContent>

          <TabsContent value="admins">
            <SuperAdminUsersList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function SuperAdminPage() {
  return (
    <RoleGate
      allowedRoles={["super_admin"]}
      redirectTo="/admin/login"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Acceso Denegado</CardTitle>
              <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SuperAdminDashboard />
    </RoleGate>
  )
}
