"use client"

import type React from "react"

import { useState } from "react"
import { useSuperAdmin } from "@/src/hooks/useSuperAdmin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SuperAdminUsersList() {
  const { bars, admins, loading, createBarAdmin } = useSuperAdmin()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [assignedBarId, setAssignedBarId] = useState("")

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError("")

    const result = await createBarAdmin(adminEmail, adminPassword, assignedBarId || undefined)

    if (result.success) {
      setIsCreateOpen(false)
      setAdminEmail("")
      setAdminPassword("")
      setAssignedBarId("")
    } else {
      setError(result.error || "Error al crear administrador")
    }

    setIsCreating(false)
  }

  const getBarName = (barId?: string) => {
    if (!barId) return "Sin asignar"
    const bar = bars.find((b) => b.id === barId)
    return bar?.name || "Bar no encontrado"
  }

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-serif">Administradores</CardTitle>
            <CardDescription>Gestionar administradores de bares</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">Crear Administrador</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Administrador</DialogTitle>
                <DialogDescription>Crear una cuenta de administrador para un bar</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="rounded-xl"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Contraseña</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedBar">Asignar a Bar (opcional)</Label>
                  <Select value={assignedBarId} onValueChange={setAssignedBarId} disabled={isCreating}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un bar (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {bars.map((bar) => (
                        <SelectItem key={bar.id} value={bar.id}>
                          {bar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isCreating}>
                  {isCreating ? "Creando..." : "Crear Administrador"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No hay administradores registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <Card key={admin.uid} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{admin.email}</CardTitle>
                      <CardDescription>Administrador de bar</CardDescription>
                    </div>
                    <Badge variant={admin.barId ? "default" : "secondary"} className="rounded-lg">
                      {getBarName(admin.barId)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg bg-transparent"
                      disabled={!admin.barId}
                      onClick={() => admin.barId && window.open(`/admin?barId=${admin.barId}`, "_blank")}
                    >
                      Ver Panel
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
