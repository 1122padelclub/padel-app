"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReportSchedules } from "@/src/hooks/useReportSchedules"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Play, Pause, Mail, Clock, Calendar, Send } from "lucide-react"
import type { ReportSchedule, ReportType } from "@/src/types"
import { useT } from "@/src/hooks/useTranslation"

interface ReportSchedulerProps {
  barId: string
}

export function ReportScheduler({ barId }: ReportSchedulerProps) {
  const t = useT()
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } = useReportSchedules(barId)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ReportSchedule>>({
    name: "",
    description: "",
    frequency: "daily",
    dataPeriod: "day",
    time: "09:00",
    recipients: [],
    reportTypes: [],
    isActive: true
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      frequency: "daily",
      dataPeriod: "day",
      time: "09:00",
      recipients: [],
      reportTypes: [],
      isActive: true
    })
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.recipients?.length || !formData.reportTypes?.length) {
      toast.error(t("errors.validationError"))
      return
    }

    try {
      if (editingId) {
        await updateSchedule(editingId, formData as ReportSchedule)
        toast.success(t("success.settingsSaved"))
      } else {
        await createSchedule(formData as Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt'>)
        toast.success(t("success.settingsSaved"))
      }
      resetForm()
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const handleEdit = (schedule: ReportSchedule) => {
    setFormData(schedule)
    setEditingId(schedule.id)
    setIsCreating(true)
  }

  const handleDelete = async (scheduleId: string) => {
    if (confirm(t("admin.areYouSureDeleteReport"))) {
      try {
        await deleteSchedule(scheduleId)
        toast.success(t("success.settingsSaved"))
      } catch (error: any) {
        toast.error(`Error: ${error.message}`)
      }
    }
  }

  const handleToggle = async (scheduleId: string, isActive: boolean) => {
    try {
      await toggleSchedule(scheduleId, isActive)
      toast.success(isActive ? t("admin.reportActivated") : t("admin.reportDeactivated"))
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const sendReportNow = async (scheduleId: string) => {
    try {
      console.log("📧 ===== ENVIANDO REPORTE MANUAL =====")
      console.log("📧 Schedule ID:", scheduleId)
      console.log("📧 Bar ID:", barId)
      
      const response = await fetch('/api/reports/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId,
          barId
        })
      })

      const result = await response.json()
      console.log("📧 ===== RESPUESTA DEL API =====")
      console.log("📧 Status:", response.status)
      console.log("📧 Result:", result)

      if (response.ok) {
        console.log("✅ Reporte enviado exitosamente")
        console.log("✅ Message ID:", result.messageId)
        console.log("✅ Recipients:", result.recipients)
        console.log("✅ Email Sent:", result.emailSent)
        toast.success(t("admin.reportSentSuccessfully", { recipients: result.recipients?.join(', ') }))
      } else {
        console.error("❌ Error en API de reportes:", result)
        toast.error(`Error: ${result.error}`)
      }
    } catch (error: any) {
      console.error("❌ Error de conexión:", error)
      toast.error(`Error: ${error.message}`)
    }
  }

  const checkEmailStatus = async (messageId: string) => {
    try {
      console.log("📧 Verificando estado del email...", messageId)
      
      const response = await fetch(`/api/check-email-status?messageId=${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      console.log("📧 Estado del email:", result)

      if (response.ok) {
        const status = result.emailStatus
        const info = `
Estado del Email:
- ID: ${messageId}
- Estado: ${status.state || 'Desconocido'}
- Destinatario: ${status.to?.[0] || 'No disponible'}
- Enviado: ${status.created_at || 'No disponible'}
- Última actualización: ${status.last_event || 'No disponible'}
- Eventos: ${status.events?.length || 0}
        `
        alert(info)
        toast.success(t("admin.emailStatusVerified"))
      } else {
        toast.error(`Error: ${result.error}`)
        console.error("❌ Error verificando estado:", result)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error de conexión:", error)
    }
  }

  const listRecentEmails = async () => {
    try {
      console.log("📧 Listando emails recientes...")
      
      const response = await fetch('/api/check-email-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      console.log("📧 Emails recientes:", result)

      if (response.ok) {
        const emails = result.emails || []
        const info = `
Emails Recientes (${emails.length}):
${emails.slice(0, 5).map((email: any, index: number) => 
  `${index + 1}. ${email.to?.[0] || 'N/A'} - ${email.state || 'N/A'} - ${new Date(email.created_at).toLocaleString()}\n   ID: ${email.id}\n   Subject: ${email.subject}`
).join('\n\n')}
        `
        alert(info)
        toast.success(t("admin.emailListObtained"))
        
        // Guardar el primer email para verificar su estado
        if (emails.length > 0) {
          setLastMessageId(emails[0].id)
        }
      } else {
        toast.error(`Error: ${result.error}`)
        console.error("❌ Error listando emails:", result)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error de conexión:", error)
    }
  }

  const testReportsEmail = async () => {
    const testEmail = prompt(t("admin.enterEmailToTestReports"))
    if (!testEmail || !testEmail.includes("@")) {
      toast.error(t("admin.invalidEmail"))
      return
    }

    try {
      console.log("📧 Probando envío de email de reporte...", testEmail)
      
      const response = await fetch('/api/test-reports-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail
        })
      })

      const result = await response.json()
      console.log("📧 Respuesta del test de email:", result)

      if (response.ok) {
        toast.success(t("admin.testEmailSentSuccessfully"))
      } else {
        toast.error(`Error: ${result.error}`)
        console.error("❌ Error en test de email:", result)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error de conexión en test:", error)
    }
  }

  const debugEmailConfig = async () => {
    try {
      console.log("🔍 Diagnosticando configuración de email...")
      
      const response = await fetch('/api/debug-email-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      console.log("🔍 Resultado del diagnóstico:", result)

      if (response.ok) {
        // Mostrar información en una alerta
        const info = `
Configuración de Email:
- API Key configurada: ${result.config.apiKeyLength > 0 ? 'Sí' : 'No'}
- Email remitente: ${result.config.fromEmail}
- Test Resend: ${result.resendTest.success ? 'Exitoso' : 'Falló'}
- Error: ${result.resendTest.error || 'Ninguno'}
        `
        alert(info)
        toast.success(t("admin.diagnosisCompleted"))
      } else {
        toast.error(`Error en diagnóstico: ${result.error}`)
        console.error("❌ Error en diagnóstico:", result)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error de conexión en diagnóstico:", error)
    }
  }

  const testEmailService = async () => {
    const testEmail = prompt(t("admin.enterEmailToTestEmailService"))
    if (!testEmail || !testEmail.includes("@")) {
      toast.error(t("admin.invalidEmail"))
      return
    }

    try {
      console.log("📧 Probando emailService directamente...", testEmail)
      
      const response = await fetch('/api/test-email-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail
        })
      })

      const result = await response.json()
      console.log("📧 Resultado del test de emailService:", result)

      if (response.ok) {
        toast.success(`EmailService test completado - Success: ${result.emailServiceResult.success}`)
      } else {
        toast.error(`Error: ${result.error}`)
        console.error("❌ Error en test de emailService:", result)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error de conexión en test:", error)
    }
  }

  const testRealtimeDb = async () => {
    try {
      console.log("🔥 Probando conexión a Realtime DB...")
      
      const response = await fetch('/api/test-realtime-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barId
        })
      })

      const result = await response.json()
      console.log("🔥 ===== RESULTADO TEST REALTIME DB =====")
      console.log("🔥 Resultado completo:", result)
      
      if (result.success) {
        if (result.exists) {
          alert(`✅ REALTIME DB FUNCIONA!\n\nEncontrados: ${result.count} pedidos\n\nPrimer pedido ID: ${result.allOrderIds?.[0]}\n\nVer consola para detalles completos`)
        } else {
          const msg = result.availableBarIds 
            ? `❌ NO HAY PEDIDOS PARA ESTE BAR\n\nBar solicitado: ${result.requestedBarId}\n\nBars disponibles:\n${result.availableBarIds.join('\n')}\n\n¿El barId es correcto?`
            : `❌ NO HAY DATOS EN REALTIME DB\n\n${result.message}`
          alert(msg)
        }
        toast.success(t("admin.testCompletedCheckConsole"))
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error probando Realtime DB:", error)
    }
  }

  const debugReportData = async () => {
    try {
      console.log("🔍 Obteniendo datos de debug...")
      
      const response = await fetch('/api/debug-report-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barId
        })
      })

      const result = await response.json()
      console.log("🔍 ===== DATOS DE DEBUG =====")
      console.log("🔍 Resultado completo:", result)
      
           if (result.success && result.data) {
             const data = result.data
             console.log("📊 REVIEWS:", data.reviews.total, "total")
             console.log("📊 ORDERS (Realtime DB):", data.orders.total, "total")
             console.log("📊 ORDERS (Firestore):", data.ordersFirestore?.total || 0, "total")
             console.log("📊 ORDERS (en período):", data.ordersInPeriod, "| Revenue:", data.totalRevenueInPeriod)
             console.log("📊 RESERVATIONS:", data.reservations.total, "total")
             console.log("📊 INVENTORY ITEMS:", data.inventory.total, "total")
             console.log("📊 INVENTORY MOVEMENTS:", data.movements.total, "total (últimos 10)")
             console.log("📊 PERÍODO:", data.period.label, "desde", data.period.start)
             
             alert(`🔍 DATOS DE DEBUG\n\n` +
               `Reviews: ${data.reviews.total}\n` +
               `Orders (Realtime DB): ${data.orders.total}\n` +
               `Orders (Firestore): ${data.ordersFirestore?.total || 0}\n` +
               `Orders (en período): ${data.ordersInPeriod}\n` +
               `Revenue (en período): $${data.totalRevenueInPeriod}\n` +
               `Reservations: ${data.reservations.total}\n` +
               `Inventory Items: ${data.inventory.total}\n` +
               `Inventory Movements: ${data.movements.total}\n\n` +
               `Ver consola para detalles completos`)
      }

      if (response.ok) {
        toast.success(t("admin.debugDataObtainedCheckConsole"))
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
      console.error("❌ Error obteniendo debug data:", error)
    }
  }

  const addRecipient = () => {
    const email = prompt(t("reports.recipients") + ":")
    if (email && email.includes("@")) {
      setFormData(prev => ({
        ...prev,
        recipients: [...(prev.recipients || []), email]
      }))
    }
  }

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients?.filter((_, i) => i !== index) || []
    }))
  }

  const toggleReportType = (type: ReportType['type']) => {
    setFormData(prev => {
      const currentTypes = prev.reportTypes || []
      const isSelected = currentTypes.some(rt => rt.type === type)
      
      if (isSelected) {
        return {
          ...prev,
          reportTypes: currentTypes.filter(rt => rt.type !== type)
        }
      } else {
        return {
          ...prev,
          reportTypes: [...currentTypes, { type, includeCharts: true, includeRawData: true }]
        }
      }
    })
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return t("reports.daily")
      case "weekly": return t("reports.weekly")
      case "monthly": return t("reports.monthly")
      default: return frequency
    }
  }

  const getStatusBadge = (schedule: ReportSchedule) => {
    if (!schedule.isActive) {
      return <Badge variant="secondary">{t("admin.inactive")}</Badge>
    }
    
    const now = new Date()
    const nextScheduled = schedule.nextScheduled ? new Date(schedule.nextScheduled) : null
    
    if (nextScheduled && nextScheduled > now) {
      return <Badge variant="default">{t("admin.scheduled")}</Badge>
    }
    
    return <Badge variant="outline">{t("admin.pending")}</Badge>
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
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-serif flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("admin.scheduledReports")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("admin.configureAutomaticEmailReports")}
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
{t("admin.newReport")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de reportes programados */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{schedule.name}</h3>
                    {getStatusBadge(schedule)}
                  </div>
                  
                  {schedule.description && (
                    <p className="text-sm text-muted-foreground mb-3">{schedule.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getFrequencyLabel(schedule.frequency)} a las {schedule.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{t("admin.data")}: {schedule.dataPeriod === 'day' ? t("admin.fromDay") : schedule.dataPeriod === 'week' ? t("admin.fromWeek") : t("admin.fromMonth")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.recipients.length} {t("admin.recipients")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {schedule.nextScheduled 
                          ? `${t("admin.next")}: ${new Date(schedule.nextScheduled).toLocaleDateString('es-ES')}`
                          : t("admin.notScheduled")
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {schedule.reportTypes.map((rt, index) => (
                        <Badge key={index} variant="outline">
                          {rt.type === 'reviews' ? t("admin.reviews") :
                           rt.type === 'orders' ? t("admin.orders") :
                           rt.type === 'reservations' ? t("admin.reservations") :
                           t("admin.consolidated")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(schedule.id, !schedule.isActive)}
                  >
                    {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendReportNow(schedule.id)}
                    className="text-green-600 hover:text-green-700"
                    title={t("reports.sendNow")}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {schedules.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("admin.noScheduledReports")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("admin.createFirstReportDescription")}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.createFirstReport")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de creación/edición */}
      {isCreating && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>
              {editingId ? t("reports.scheduleReport") : t("reports.scheduleReport")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("admin.reportName")} *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t("reports.scheduleReport")}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">{t("admin.frequency")} *</Label>
                  <Select
                    value={formData.frequency || "daily"}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("admin.daily")}</SelectItem>
                      <SelectItem value="weekly">{t("admin.weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("admin.monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataPeriod">{t("admin.dataPeriod")} *</Label>
                  <Select
                    value={formData.dataPeriod || "day"}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, dataPeriod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">{t("admin.fromDay")}</SelectItem>
                      <SelectItem value="week">{t("admin.fromWeek")}</SelectItem>
                      <SelectItem value="month">{t("admin.fromMonth")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                  <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t("common.description")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">{t("admin.sendTimeUTC")} *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time || "09:00"}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
                
                {formData.frequency === "weekly" && (
                  <div>
                    <Label htmlFor="dayOfWeek">{t("admin.dayOfWeek")}</Label>
                    <Select
                      value={formData.dayOfWeek?.toString() || "0"}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t("admin.sunday")}</SelectItem>
                        <SelectItem value="1">{t("admin.monday")}</SelectItem>
                        <SelectItem value="2">{t("admin.tuesday")}</SelectItem>
                        <SelectItem value="3">{t("admin.wednesday")}</SelectItem>
                        <SelectItem value="4">{t("admin.thursday")}</SelectItem>
                        <SelectItem value="5">{t("admin.friday")}</SelectItem>
                        <SelectItem value="6">{t("admin.saturday")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label>{t("admin.recipients")} *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("admin.emailPlaceholder")}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addRecipient()
                        }
                      }}
                    />
                    <Button type="button" onClick={addRecipient} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.recipients?.map((email, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>{t("admin.reportType")} *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    { type: 'reviews', label: t("admin.reviews") },
                    { type: 'orders', label: t("admin.orders") },
                    { type: 'reservations', label: t("admin.reservations") },
                    { type: 'consolidated', label: t("admin.consolidated") }
                  ].map(({ type, label }) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.reportTypes?.some(rt => rt.type === type) || false}
                        onCheckedChange={() => toggleReportType(type as ReportType['type'])}
                      />
                      <Label htmlFor={type}>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
{t("admin.cancel")}
                </Button>
                <Button type="submit">
                  {editingId ? t("common.save") : t("reports.generateReport")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
