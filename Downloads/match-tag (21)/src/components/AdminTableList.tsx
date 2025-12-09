"use client"

import type { Table } from "@/components/ui/table"

import type React from "react"

import { useState } from "react"
import { useAdminTables } from "@/src/hooks/useAdminTables"
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
import { useT } from "@/src/hooks/useTranslation"
import { Users } from "lucide-react"

interface AdminTableListProps {
  barId: string
}

export function AdminTableList({ barId }: AdminTableListProps) {
  const { tables, loading, createTable, updateTable, deleteTable } = useAdminTables(barId)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState("")
  const [newTableCapacity, setNewTableCapacity] = useState("4")
  const [newTablePassword, setNewTablePassword] = useState("")
  const [editPasswordTable, setEditPasswordTable] = useState<string | null>(null)
  const [editPassword, setEditPassword] = useState("")
  const [editCapacityTable, setEditCapacityTable] = useState<string | null>(null)
  const [editCapacity, setEditCapacity] = useState("4")
  const t = useT()

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    const number = Number.parseInt(newTableNumber)
    const capacity = Number.parseInt(newTableCapacity)
    if (isNaN(number) || number <= 0) return
    if (isNaN(capacity) || capacity <= 0) return

    const success = await createTable(number, newTablePassword || undefined, capacity)
    if (success) {
      setIsCreateOpen(false)
      setNewTableNumber("")
      setNewTableCapacity("4")
      setNewTablePassword("")
    }
  }

  const handleToggleActive = async (tableId: string, isActive: boolean) => {
    console.log("Toggle active called:", { tableId, isActive })
    try {
      const success = await updateTable(tableId, { isActive })
      console.log("Update result:", success)
    } catch (error) {
      console.error("Error toggling active status:", error)
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    await deleteTable(tableId)
  }

  const handleUpdatePassword = async (tableId: string) => {
    const success = await updateTable(tableId, { password: editPassword || undefined })
    if (success) {
      setEditPasswordTable(null)
      setEditPassword("")
    }
  }

  const handleUpdateCapacity = async (tableId: string) => {
    const capacity = Number.parseInt(editCapacity)
    if (isNaN(capacity) || capacity <= 0) return
    const success = await updateTable(tableId, { capacity })
    if (success) {
      setEditCapacityTable(null)
      setEditCapacity("4")
    }
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
            <CardTitle className="font-serif">{t("admin.tables")}</CardTitle>
            <CardDescription>{t("admin.manageBarTables")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl">{t("admin.newTable")}</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>{t("admin.createNewTable")}</DialogTitle>
                  <DialogDescription>{t("admin.enterTableNumberAndPassword")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTable} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">{t("admin.tableNumber")}</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      min="1"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tableCapacity">{t("admin.capacity")} ({t("admin.people")})</Label>
                    <Input
                      id="tableCapacity"
                      type="number"
                      min="1"
                      max="20"
                      value={newTableCapacity}
                      onChange={(e) => setNewTableCapacity(e.target.value)}
                      required
                      className="rounded-xl"
                      placeholder="Ej: 4"
                    />
                    <p className="text-xs text-gray-500">{t("admin.maximumPeopleForTable")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tablePassword">{t("admin.passwordOptional")}</Label>
                    <Input
                      id="tablePassword"
                      type="password"
                      value={newTablePassword}
                      onChange={(e) => setNewTablePassword(e.target.value)}
                      placeholder={t("admin.leaveEmptyForFreeAccess")}
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    {t("admin.createTable")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>{t("admin.noTablesCreated")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card key={table.id} className="rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{t("admin.table")} {table.number}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={table.isActive ? "default" : "secondary"} className="rounded-lg">
                        {table.isActive ? t("admin.active") : t("admin.inactive")}
                      </Badge>
                      {table.password && (
                        <Badge variant="outline" className="rounded-lg">
                          🔒
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{t("admin.capacity")}: <strong>{table.capacity || 4} {t("admin.people")}</strong></span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`active-${table.id}`} className="text-sm">
                        {t("admin.tableActive")}
                      </Label>
                      <div className="text-xs text-gray-500 mt-1">
                        {t("admin.currentStatus")}: {table.isActive ? t("admin.active") : t("admin.inactive")}
                      </div>
                    </div>
                    <Switch
                      id={`active-${table.id}`}
                      checked={table.isActive}
                      onCheckedChange={(checked) => {
                        console.log(`Switch clicked for table ${table.number}:`, { 
                          currentState: table.isActive, 
                          newState: checked,
                          tableId: table.id 
                        })
                        handleToggleActive(table.id, checked)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t("admin.capacity")}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg bg-transparent"
                        onClick={() => {
                          setEditCapacityTable(table.id)
                          setEditCapacity(String(table.capacity || 4))
                        }}
                      >
                        {t("admin.change")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {table.capacity || 4} {t("admin.people")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t("admin.password")}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg bg-transparent"
                        onClick={() => {
                          setEditPasswordTable(table.id)
                          setEditPassword(table.password || "")
                        }}
                      >
                        {table.password ? t("admin.change") : t("admin.add")}
                      </Button>
                    </div>
                    {table.password && (
                      <p className="text-xs text-muted-foreground">
                        {t("admin.passwordConfigured")} {"*".repeat(table.password.length)}
                      </p>
                    )}
                  </div>
                  {/* <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Diseño</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg bg-transparent"
                        onClick={() => handleCustomizeTable(table.id)}
                      >
                        Personalizar
                      </Button>
                    </div>
                  </div> */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg bg-transparent"
                      onClick={() =>
                        window.open(`/mesa?barId=${barId}&tableId=${table.id}&tableNumber=${table.number}`, "_blank")
                      }
                    >
                      {t("admin.viewTable")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-lg">
                          {t("admin.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.deleteTable")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.deleteTableDescription", { number: table.number })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">{t("admin.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTable(table.id)}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("admin.delete")}
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

      {/* <Dialog open={customizeTable !== null} onOpenChange={() => setCustomizeTable(null)}>
        ... todo el modal de personalización ...
      </Dialog> */}

      <Dialog open={editCapacityTable !== null} onOpenChange={() => setEditCapacityTable(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.configureCapacity")}</DialogTitle>
            <DialogDescription>
              {t("admin.setMaximumPeopleForTable")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCapacity">{t("admin.capacity")} ({t("admin.people")})</Label>
              <Input
                id="editCapacity"
                type="number"
                min="1"
                max="20"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                placeholder="Ej: 4"
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
                onClick={() => setEditCapacityTable(null)}
              >
                {t("admin.cancel")}
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => editCapacityTable && handleUpdateCapacity(editCapacityTable)}
              >
                {t("admin.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editPasswordTable !== null} onOpenChange={() => setEditPasswordTable(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.configurePassword")}</DialogTitle>
            <DialogDescription>
              {editPasswordTable && tables.find((t) => t.id === editPasswordTable)?.password
                ? t("admin.changeTablePassword")
                : t("admin.addTablePassword")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPassword">{t("admin.newPassword")}</Label>
              <Input
                id="editPassword"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder={t("admin.leaveEmptyToRemovePassword")}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl bg-transparent"
                onClick={() => setEditPasswordTable(null)}
              >
                {t("admin.cancel")}
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => editPasswordTable && handleUpdatePassword(editPasswordTable)}
              >
                {t("admin.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
