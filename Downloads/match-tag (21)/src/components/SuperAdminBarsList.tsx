"use client"

import type React from "react"

import { useState } from "react"
import { useSuperAdmin } from "@/src/hooks/useSuperAdmin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SuperAdminBarsList() {
  const { bars, admins, loading, createBar, updateBar, deleteBar, assignAdminToBar, removeAdminFromBar } =
    useSuperAdmin()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedBarId, setSelectedBarId] = useState("")

  // Form states
  const [barName, setBarName] = useState("")
  const [barAddress, setBarAddress] = useState("")
  const [selectedAdminId, setSelectedAdminId] = useState("")

  const handleCreateBar = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createBar(barName, barAddress)
    if (result.success) {
      setIsCreateOpen(false)
      setBarName("")
      setBarAddress("")
    }
  }

  const handleToggleActive = async (barId: string, isActive: boolean) => {
    await updateBar(barId, { isActive })
  }

  const handleDeleteBar = async (barId: string) => {
    await deleteBar(barId)
  }

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdminId || !selectedBarId) return

    const result = await assignAdminToBar(selectedAdminId, selectedBarId)
    if (result.success) {
      setIsAssignOpen(false)
      setSelectedAdminId("")
      setSelectedBarId("")
    }
  }

  const getBarAdmins = (barId: string) => {
    const bar = bars.find((b) => b.id === barId)
    if (!bar) return []
    return admins.filter((admin) => bar.adminIds.includes(admin.uid))
  }

  const getUnassignedAdmins = () => {
    return admins.filter(
      (admin) => !admin.barId || admin.barId === null || admin.barId === undefined || admin.barId === "",
    )
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
            <CardTitle className="font-serif">Gestión de Bares</CardTitle>
            <CardDescription>Administrar bares y asignar administradores</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  Asignar Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Asignar Administrador</DialogTitle>
                  <DialogDescription>Asignar un administrador a un bar</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectBar">Seleccionar Bar</Label>
                    <Select value={selectedBarId} onValueChange={setSelectedBarId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona un bar" />
                      </SelectTrigger>
                      <SelectContent>
                        {bars.map((bar) => (
                          <SelectItem key={bar.id} value={bar.id}>
                            {bar.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selectAdmin">Seleccionar Administrador</Label>
                    <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona un administrador" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnassignedAdmins().map((admin) => (
                          <SelectItem key={admin.uid} value={admin.uid}>
                            {admin.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    Asignar Administrador
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl">Crear Bar</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Bar</DialogTitle>
                  <DialogDescription>Ingresa los datos del nuevo bar</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barName">Nombre del Bar</Label>
                    <Input
                      id="barName"
                      value={barName}
                      onChange={(e) => setBarName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barAddress">Dirección</Label>
                    <Input
                      id="barAddress"
                      value={barAddress}
                      onChange={(e) => setBarAddress(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    Crear Bar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bars.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No hay bares registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bars.map((bar) => (
              <Card key={bar.id} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{bar.name}</CardTitle>
                      <CardDescription>{bar.address}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={bar.isActive ? "default" : "secondary"} className="rounded-lg">
                        {bar.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline" className="rounded-lg">
                        {getBarAdmins(bar.id).length} admins
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`active-${bar.id}`} className="text-sm">
                      Bar activo
                    </Label>
                    <Switch
                      id={`active-${bar.id}`}
                      checked={bar.isActive}
                      onCheckedChange={(checked) => handleToggleActive(bar.id, checked)}
                    />
                  </div>

                  {getBarAdmins(bar.id).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Administradores:</Label>
                      <div className="space-y-1">
                        {getBarAdmins(bar.id).map((admin) => (
                          <div key={admin.uid} className="flex justify-between items-center text-sm">
                            <span>{admin.email}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAdminFromBar(admin.uid, bar.id)}
                              className="h-6 px-2 rounded-lg text-destructive hover:text-destructive"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg bg-transparent"
                      onClick={() => window.open(`/admin?barId=${bar.id}`, "_blank")}
                    >
                      Ver Panel
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-lg">
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar bar?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el bar "{bar.name}" y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBar(bar.id)}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
