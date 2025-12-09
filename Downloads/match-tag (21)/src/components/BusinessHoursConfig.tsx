"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Clock, Calendar } from "lucide-react"
import type { ReservationConfig } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface BusinessHoursConfigProps {
  config: ReservationConfig
  onConfigChange: (updates: Partial<ReservationConfig>) => void
}

const DAYS_OF_WEEK = [
  { key: "monday", labelKey: "admin.monday" },
  { key: "tuesday", labelKey: "admin.tuesday" },
  { key: "wednesday", labelKey: "admin.wednesday" },
  { key: "thursday", labelKey: "admin.thursday" },
  { key: "friday", labelKey: "admin.friday" },
  { key: "saturday", labelKey: "admin.saturday" },
  { key: "sunday", labelKey: "admin.sunday" }
]

export function BusinessHoursConfig({ config, onConfigChange }: BusinessHoursConfigProps) {
  const t = useT()
  const handleDayToggle = (day: string, isOpen: boolean) => {
    const updatedBusinessHours = {
      ...config.businessHours,
      [day]: {
        ...config.businessHours[day],
        isOpen
      }
    }
    onConfigChange({ businessHours: updatedBusinessHours })
  }

  const handleTimeChange = (day: string, field: "openingTime" | "closingTime", time: string) => {
    console.log("🕐 Cambiando horario:", { day, field, time })
    
    const updatedBusinessHours = {
      ...config.businessHours,
      [day]: {
        ...config.businessHours[day],
        [field]: time
      }
    }
    
    console.log("🕐 Horarios actualizados:", updatedBusinessHours)
    onConfigChange({ businessHours: updatedBusinessHours })
  }

  const handleAllDaysToggle = (isOpen: boolean) => {
    const updatedBusinessHours = { ...config.businessHours }
    Object.keys(updatedBusinessHours).forEach(day => {
      updatedBusinessHours[day].isOpen = isOpen
    })
    onConfigChange({ businessHours: updatedBusinessHours })
  }

  const handleAllDaysTime = (field: "openingTime" | "closingTime", time: string) => {
    console.log("🕐 Cambiando horario para todos los días:", { field, time })
    
    const updatedBusinessHours = { ...config.businessHours }
    Object.keys(updatedBusinessHours).forEach(day => {
      updatedBusinessHours[day][field] = time
    })
    
    console.log("🕐 Horarios actualizados para todos los días:", updatedBusinessHours)
    onConfigChange({ businessHours: updatedBusinessHours })
  }

  const allDaysOpen = Object.values(config.businessHours).every(day => day.isOpen)
  const allDaysClosed = Object.values(config.businessHours).every(day => !day.isOpen)

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("admin.operatingHours")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("admin.operatingHoursDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              checked={allDaysOpen}
              onCheckedChange={handleAllDaysToggle}
            />
            <Label className="text-sm font-medium">{t("admin.openAllDays")}</Label>
          </div>
          
          <div>
            <Label className="text-sm font-medium">{t("admin.openingTimeAll")}</Label>
            <Input
              type="time"
              value={config.businessHours.monday.openingTime}
              onChange={(e) => handleAllDaysTime("openingTime", e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">{t("admin.closingTimeAll")}</Label>
            <Input
              type="time"
              value={config.businessHours.monday.closingTime}
              onChange={(e) => handleAllDaysTime("closingTime", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Configuración por día */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            <Label className="text-sm font-medium">{t("admin.configurationPerDay")}</Label>
          </div>
          
          {DAYS_OF_WEEK.map((day) => {
            const dayConfig = config.businessHours[day.key]
            
            return (
              <div
                key={day.key}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
              >
                {/* Día y switch */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={dayConfig.isOpen}
                    onCheckedChange={(isOpen) => handleDayToggle(day.key, isOpen)}
                  />
                  <Label className="font-medium min-w-[80px]">
                    {t(day.labelKey)}
                  </Label>
                </div>

                {/* Hora de apertura */}
                <div>
                  <Label className="text-sm text-muted-foreground">{t("admin.opening")}</Label>
                  <Input
                    type="time"
                    value={dayConfig.openingTime}
                    onChange={(e) => handleTimeChange(day.key, "openingTime", e.target.value)}
                    disabled={!dayConfig.isOpen}
                    className="mt-1"
                  />
                </div>

                {/* Hora de cierre */}
                <div>
                  <Label className="text-sm text-muted-foreground">{t("admin.closing")}</Label>
                  <Input
                    type="time"
                    value={dayConfig.closingTime}
                    onChange={(e) => handleTimeChange(day.key, "closingTime", e.target.value)}
                    disabled={!dayConfig.isOpen}
                    className="mt-1"
                  />
                </div>

                {/* Estado */}
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      dayConfig.isOpen
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {dayConfig.isOpen ? t("admin.open") : t("admin.closed")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">{t("admin.importantInformation")}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>{t("admin.reservationsOnlyConfiguredHours")}</li>
            <li>{t("admin.customersSeeOnlyAvailableHours")}</li>
            <li>{t("admin.configureSpecialHoursSpecificDates")}</li>
            <li>{t("admin.changesApplyImmediately")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

