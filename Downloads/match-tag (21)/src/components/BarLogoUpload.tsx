"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Check } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"

interface BarLogoUploadProps {
  barId: string
  currentLogo?: string
}

export function BarLogoUpload({ barId, currentLogo }: BarLogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(currentLogo || "")
  const [previewUrl, setPreviewUrl] = useState(currentLogo || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 5MB.")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("barId", barId)

      const response = await fetch("/api/upload-bar-logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      const newLogoUrl = data.url

      // Actualizar en Firestore
      await updateDoc(doc(db, "bars", barId), {
        logoUrl: newLogoUrl,
        updatedAt: new Date(),
      })

      setLogoUrl(newLogoUrl)
      setPreviewUrl(newLogoUrl)

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      alert("Error al subir el logo. Inténtalo de nuevo.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      await updateDoc(doc(db, "bars", barId), {
        logoUrl: "",
        updatedAt: new Date(),
      })

      setLogoUrl("")
      setPreviewUrl("")
    } catch (error) {
      console.error("Error removing logo:", error)
      alert("Error al eliminar el logo.")
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Logo del Bar
        </CardTitle>
        <CardDescription>Sube el logo de tu bar para personalizar la experiencia de las mesas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Logo del bar"
              className="w-32 h-32 object-contain rounded-lg border bg-white mx-auto"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveLogo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="logo-upload">Seleccionar Logo</Label>
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            ref={fileInputRef}
            className="rounded-xl"
          />
        </div>

        {uploading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Subiendo logo...</span>
          </div>
        )}

        {logoUrl && !uploading && (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">Logo guardado correctamente</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB.</p>
      </CardContent>
    </Card>
  )
}
