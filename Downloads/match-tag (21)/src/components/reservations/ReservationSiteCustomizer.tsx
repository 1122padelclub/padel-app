"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { ReservationSiteConfig } from "@/src/types/reservation"
import { Globe, Copy, Check, ExternalLink, Palette, ImageIcon, Type } from "lucide-react"
import { useAutoMigration } from "@/src/hooks/useAutoMigration"

interface ReservationSiteCustomizerProps {
  barId: string
}

export function ReservationSiteCustomizer({ barId }: ReservationSiteCustomizerProps) {
  const [config, setConfig] = useState<ReservationSiteConfig>({
    heroTitle: "Reserva tu Mesa",
    heroSubtitle: "Disfruta de una experiencia gastronómica única",
    colorPrimary: "#3b82f6",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = `${window.location.origin}/reservar/${barId}`

  const migration = useAutoMigration(barId)

  useEffect(() => {
    if (migration.isReady) {
      loadConfig()
    }
  }, [barId, migration.isReady]) // Esperar a que migración esté lista

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/bars/${barId}/reservation-config`)
      if (response.ok) {
        const configData = await response.json()
        if (configData) {
          setConfig({ ...config, ...configData })
        }
      } else {
        console.error("Error loading reservation config:", response.statusText)
      }
    } catch (error) {
      console.error("Error loading reservation site config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      await setDoc(doc(db, "bars", barId, "reservationSite", "config"), {
        ...config,
        updatedAt: new Date().toISOString(),
      })
      alert("Configuración guardada correctamente")
    } catch (error) {
      console.error("Error saving config:", error)
      alert("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying URL:", error)
    }
  }

  if (migration.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm">
              {migration.isChecking ? "Verificando configuración..." : "Actualizando sistema..."}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (migration.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error de migración: {migration.error}</div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando configuración...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Public URL Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sitio Público de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">URL Pública</Label>
            <div className="flex gap-2 mt-1">
              <Input value={publicUrl} readOnly className="flex-1" />
              <Button variant="outline" size="sm" onClick={copyUrl} className="flex items-center gap-2 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Abrir
                </a>
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Comparte esta URL con tus clientes para que puedan hacer reservas online. La página se personaliza
              automáticamente con la configuración de abajo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Contenido y Textos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Título Principal</Label>
              <Input
                id="heroTitle"
                value={config.heroTitle || ""}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                placeholder="Reserva tu Mesa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtítulo</Label>
              <Input
                id="heroSubtitle"
                value={config.heroSubtitle || ""}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                placeholder="Disfruta de una experiencia gastronómica única"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policies">Políticas de Reserva (opcional)</Label>
              <Textarea
                id="policies"
                value={config.policies || ""}
                onChange={(e) => setConfig({ ...config, policies: e.target.value })}
                placeholder="• Las reservas se confirman automáticamente&#10;• Cancelaciones hasta 2 horas antes&#10;• Mesa reservada por 2 horas máximo"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personalización Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="colorPrimary">Color Principal</Label>
              <div className="flex gap-2">
                <Input
                  id="colorPrimary"
                  type="color"
                  value={config.colorPrimary || "#3b82f6"}
                  onChange={(e) => setConfig({ ...config, colorPrimary: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={config.colorPrimary || "#3b82f6"}
                  onChange={(e) => setConfig({ ...config, colorPrimary: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
              <Input
                id="logoUrl"
                value={config.logoUrl || ""}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Sube tu logo a un servicio como Imgur o usa una URL directa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundUrl">URL de Imagen de Fondo (opcional)</Label>
              <Input
                id="backgroundUrl"
                value={config.backgroundUrl || ""}
                onChange={(e) => setConfig({ ...config, backgroundUrl: e.target.value })}
                placeholder="https://ejemplo.com/fondo.jpg"
              />
              <p className="text-xs text-muted-foreground">Imagen de fondo para la sección hero de la página</p>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Vista Previa</Label>
              <div
                className="border rounded-lg p-4 text-center text-white relative overflow-hidden"
                style={{
                  backgroundColor: config.colorPrimary || "#3b82f6",
                  backgroundImage: config.backgroundUrl ? `url(${config.backgroundUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {config.backgroundUrl && <div className="absolute inset-0 bg-black/40"></div>}
                <div className="relative z-10">
                  {config.logoUrl && (
                    <ImageIcon src={config.logoUrl || "/placeholder.svg"} alt="Logo" className="h-8 mx-auto mb-2" />
                  )}
                  <h3 className="font-bold">{config.heroTitle || "Reserva tu Mesa"}</h3>
                  <p className="text-sm opacity-90">
                    {config.heroSubtitle || "Disfruta de una experiencia gastronómica única"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={config.contactInfo?.address || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    contactInfo: { ...config.contactInfo, address: e.target.value },
                  })
                }
                placeholder="Calle Principal 123, Madrid"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono</Label>
              <Input
                id="contactPhone"
                value={config.contactInfo?.phone || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    contactInfo: { ...config.contactInfo, phone: e.target.value },
                  })
                }
                placeholder="+34 91 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={config.contactInfo?.email || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    contactInfo: { ...config.contactInfo, email: e.target.value },
                  })
                }
                placeholder="reservas@restaurante.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isSaving} className="flex items-center gap-2">
          {isSaving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  )
}
