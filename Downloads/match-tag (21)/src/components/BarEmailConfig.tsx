"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBarEmailConfig } from "@/src/hooks/useBarEmailConfig"
import { useT } from "@/src/hooks/useTranslation"
import { toast } from "@/hooks/use-toast"
import { Save, Mail, Phone, MapPin, Clock, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BarEmailConfigProps {
  barId: string
}

export function BarEmailConfig({ barId }: BarEmailConfigProps) {
  const t = useT()
  const { bar, loading, updateEmailConfig } = useBarEmailConfig(barId)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    contactPhone: "",
    contactEmail: "",
    businessHours: "",
    policies: "",
    emailLanguage: "es" // Nuevo campo para idioma del email
  })

  // Cargar datos cuando el bar se carga
  React.useEffect(() => {
    if (bar?.emailConfig) {
      setFormData({
        businessName: bar.emailConfig.businessName || bar.name || "",
        businessAddress: bar.emailConfig.businessAddress || bar.address || "",
        contactPhone: bar.emailConfig.contactPhone || "",
        contactEmail: bar.emailConfig.contactEmail || "",
        businessHours: bar.emailConfig.businessHours || "",
        policies: bar.emailConfig.policies || "",
        emailLanguage: bar.emailConfig.emailLanguage || "es"
      })
    } else if (bar) {
      // Si no hay configuración, usar datos básicos del bar
      setFormData({
        businessName: bar.name || "",
        businessAddress: bar.address || "",
        contactPhone: "",
        contactEmail: "",
        businessHours: "",
        policies: "",
        emailLanguage: "es"
      })
    }
  }, [bar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateEmailConfig(formData)
      toast({
        title: t("success.settingsSaved"),
        description: t("emailConfig.emailConfigurationSavedSuccessfully")
      })
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("emailConfig.errorSavingConfiguration")
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">{t("common.loading")}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t("emailConfig.reservationEmailConfiguration")}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {t("emailConfig.configureInformationForReservationEmails")}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del Negocio */}
          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("emailConfig.restaurantBarName")} *
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              placeholder={t("emailConfig.restaurantBarNamePlaceholder")}
              required
            />
            <p className="text-xs text-gray-500">
              {t("emailConfig.businessNameWillAppearInEmails")}
            </p>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="businessAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("emailConfig.address")} *
            </Label>
            <Textarea
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange("businessAddress", e.target.value)}
              placeholder={t("emailConfig.addressPlaceholder")}
              required
              rows={2}
            />
          </div>

          {/* Teléfono de Contacto */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t("emailConfig.contactPhone")} *
            </Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              placeholder={t("emailConfig.contactPhonePlaceholder")}
              required
            />
            <p className="text-xs text-gray-500">
              {t("emailConfig.contactPhoneDescription")}
            </p>
          </div>

          {/* Email de Contacto */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("emailConfig.contactEmail")}
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              placeholder={t("emailConfig.contactEmailPlaceholder")}
            />
          </div>

          {/* Horarios de Atención */}
          <div className="space-y-2">
            <Label htmlFor="businessHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("emailConfig.businessHours")}
            </Label>
            <Input
              id="businessHours"
              value={formData.businessHours}
              onChange={(e) => handleInputChange("businessHours", e.target.value)}
              placeholder={t("emailConfig.businessHoursPlaceholder")}
            />
          </div>

          {/* Idioma del Email */}
          <div className="space-y-2">
            <Label htmlFor="emailLanguage" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("emailConfig.emailLanguage")}
            </Label>
            <Select value={formData.emailLanguage} onValueChange={(value) => handleInputChange("emailLanguage", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("emailConfig.selectEmailLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t("emailConfig.spanish")}</SelectItem>
                <SelectItem value="en">{t("emailConfig.english")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t("emailConfig.emailLanguageDescription")}
            </p>
          </div>

          {/* Políticas */}
          <div className="space-y-2">
            <Label htmlFor="policies">{t("emailConfig.policiesAndTerms")}</Label>
            <Textarea
              id="policies"
              value={formData.policies}
              onChange={(e) => handleInputChange("policies", e.target.value)}
              placeholder={t("emailConfig.policiesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? t("common.loading") : t("emailConfig.saveConfiguration")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
