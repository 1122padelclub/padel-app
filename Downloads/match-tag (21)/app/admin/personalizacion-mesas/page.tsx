"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { TableCustomizationEditor } from "@/src/components/TableCustomizationEditor"
import { TableCustomizationiPhoneMockup } from "@/src/components/TableCustomizationiPhoneMockup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useT } from "@/src/hooks/useTranslation"

function PersonalizacionMesasContent() {
  const t = useT()
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId")
  const [previewMode, setPreviewMode] = useState(false)

  console.log("Personalización - barId recibido:", barId)

  if (!barId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-600 mb-4">{t("tableCustomization.noBarIdProvided")}</p>
            <p className="text-sm text-gray-600 mb-4">
              {t("tableCustomization.currentUrl")}: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </p>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("tableCustomization.backToAdmin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/admin?barId=${barId}`}>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("tableCustomization.goBack")}
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">{t("tableCustomization.tableCustomization")}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? t("tableCustomization.edit") : t("tableCustomization.preview")}
              </Button>
            </div>
          </div>
          <p className="text-gray-300">
            {t("tableCustomization.customizeTableAppearance")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableCustomizationEditor 
              barId={barId}
              onSave={(customization) => {
                console.log("Personalización guardada:", customization)
                // Aquí podrías mostrar una notificación de éxito
              }}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tableCustomization.information")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Bar ID</h4>
                  <p className="text-sm text-gray-600 font-mono">{barId}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t("tableCustomization.status")}</h4>
                  <p className="text-sm text-green-600">{t("tableCustomization.active")}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t("tableCustomization.lastUpdate")}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <TableCustomizationiPhoneMockup barId={barId} />

            <Card>
              <CardHeader>
                <CardTitle>{t("tableCustomization.help")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <h4 className="font-medium mb-1">{t("tableCustomization.colors")}</h4>
                  <p className="text-gray-600">
                    {t("tableCustomization.customizeMainColors")}
                  </p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-1">{t("tableCustomization.typography")}</h4>
                  <p className="text-gray-600">
                    {t("tableCustomization.changeFontAndSize")}
                  </p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-1">{t("tableCustomization.images")}</h4>
                  <p className="text-gray-600">
                    {t("tableCustomization.uploadLogoAndBackground")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PersonalizacionMesasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando personalización...</p>
        </div>
      </div>
    }>
      <PersonalizacionMesasContent />
    </Suspense>
  )
}