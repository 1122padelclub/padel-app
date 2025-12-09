"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Save } from "lucide-react"
import { useReservationConfig } from "@/src/hooks/useReservationConfig"

interface ReservationDurationConfigProps {
  barId: string
}

export function ReservationDurationConfig({ barId }: ReservationDurationConfigProps) {
  const { config, updateConfig } = useReservationConfig(barId)
  const [duration, setDuration] = useState(config?.reservationDurationMinutes || 120)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      await updateConfig({
        ...config,
        reservationDurationMinutes: duration
      })
      console.log("✅ Duración de reservas actualizada")
    } catch (error) {
      console.error("❌ Error actualizando duración:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} minutos`
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`
    return `${hours}h ${mins}m`
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Configuración de Duración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="duration">Duración por reserva (minutos)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="duration"
              type="number"
              min="30"
              max="480"
              step="30"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="rounded-xl"
            />
            <Button
              onClick={handleSave}
              disabled={isSaving || duration === config?.reservationDurationMinutes}
              className="rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Duración actual: <strong>{formatDuration(config?.reservationDurationMinutes || 120)}</strong>
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">¿Cómo funciona?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
            <div>• Bloquea mesa por tiempo configurado</div>
            <div>• Recomendado: 90-180 min</div>
            <div>• No disponible para otras reservas</div>
            <div>• Rango: 30 min - 8 horas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
