"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTableT } from "@/src/hooks/useTableTranslation"
import { TableLanguageSelector } from "@/src/components/TableLanguageSelector"

interface TablePasswordPromptProps {
  tableNumber: number
  onPasswordSubmit: (password: string) => void
  error?: string
}

export function TablePasswordPrompt({ tableNumber, onPasswordSubmit, error }: TablePasswordPromptProps) {
  const tableT = useTableT()
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPasswordSubmit(password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-end mb-2">
            <TableLanguageSelector />
          </div>
          <CardTitle className="text-2xl font-serif">{tableT.t("table.table")} {tableNumber}</CardTitle>
          <CardDescription>{tableT.t("password.requiresPassword")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{tableT.t("password.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tableT.t("password.enterPassword")}
                className="rounded-xl"
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full rounded-xl">
              {tableT.t("password.accessTable")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
