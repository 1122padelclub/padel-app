"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DisplayMenuCustomizationPanel } from "./DisplayMenuCustomizationPanel"
import { useDisplayMenuConfig } from "@/src/hooks/useDisplayMenuConfig"
import { ExternalLink, Eye, Copy, Share2, QrCode, Settings, Palette } from "lucide-react"
import { toast } from "sonner"
import { useT } from "@/src/hooks/useTranslation"

interface DisplayMenuAdminPanelProps {
  barId: string
}

export function DisplayMenuAdminPanel({ barId }: DisplayMenuAdminPanelProps) {
  const { config, loading, error, updateConfig, resetToDefault } = useDisplayMenuConfig(barId)
  const [showCustomization, setShowCustomization] = useState(false)
  const t = useT()

  const menuUrl = `${window.location.origin}/menu/${barId}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      toast.success(t("displayMenu.urlCopied"))
    } catch (err) {
      toast.error(t("displayMenu.copyError"))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: config?.title || t("displayMenu.defaultTitle"),
          text: t("displayMenu.shareText"),
          url: menuUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      handleCopyUrl()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">{t("common.error")}</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("displayMenu.noConfiguration")}</h3>
        <p className="text-gray-600">{t("displayMenu.noConfigurationDescription")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con información del menú */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("displayMenu.title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("displayMenu.subtitle")}
            </p>
            
            {/* Estado del menú */}
            <div className="flex items-center space-x-4">
              <Badge 
                variant={config.isActive ? "default" : "secondary"}
                className={config.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {config.isActive ? t("displayMenu.active") : t("displayMenu.inactive")}
              </Badge>
              <span className="text-sm text-gray-600">
                {t("displayMenu.titleLabel")} {config.title}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center space-x-2"
            >
              <Palette className="h-4 w-4" />
              <span>{showCustomization ? t("displayMenu.hide") : t("displayMenu.customize")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Panel de personalización */}
      {showCustomization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>{t("displayMenu.menuCustomization")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DisplayMenuCustomizationPanel
              barId={barId}
              config={config}
              onConfigChange={updateConfig}
              onReset={resetToDefault}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}


      {/* Acciones y enlaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{t("displayMenu.preview")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("displayMenu.previewDescription")}
            </p>
            <Button
              onClick={() => window.open(menuUrl, "_blank")}
              className="w-full"
              disabled={!config.isActive}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("displayMenu.viewPublicMenu")}
            </Button>
            {!config.isActive && (
              <p className="text-xs text-amber-600">
                {t("displayMenu.menuInactive")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Compartir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>{t("displayMenu.share")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("displayMenu.shareDescription")}
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
                disabled={!config.isActive}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t("displayMenu.share")}
              </Button>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full"
                disabled={!config.isActive}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t("displayMenu.copyUrl")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Código QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>{t("displayMenu.qrCode")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("displayMenu.qrCodeDescription")}
            </p>
            <div className="text-center">
              <img
                src={qrCodeUrl}
                alt={t("displayMenu.qrCodeAlt")}
                className="mx-auto border rounded-lg"
                style={{ maxWidth: "120px" }}
              />
              <p className="text-xs text-gray-500 mt-2">
                {t("displayMenu.scanToAccess")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>{t("displayMenu.menuInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t("displayMenu.menuUrl")}</h4>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-gray-100 text-gray-900 rounded text-sm font-mono">
                  {menuUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t("displayMenu.currentConfiguration")}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• {t("displayMenu.layout")}: {config.layout}</p>
                <p>• {t("displayMenu.images")}: {config.showImages ? t("displayMenu.enabled") : t("displayMenu.disabled")}</p>
                <p>• {t("displayMenu.prices")}: {config.showPrices ? t("displayMenu.shown") : t("displayMenu.hidden")}</p>
                <p>• {t("displayMenu.descriptions")}: {config.showDescriptions ? t("displayMenu.shown") : t("displayMenu.hidden")}</p>
                <p>• {t("displayMenu.badges")}: {config.showBadges ? t("displayMenu.shown") : t("displayMenu.hidden")}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{t("displayMenu.socialMediaTips")}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t("displayMenu.shareInstagram")}</li>
              <li>{t("displayMenu.includeQR")}</li>
              <li>{t("displayMenu.useFacebook")}</li>
              <li>{t("displayMenu.shareWhatsApp")}</li>
              <li>{t("displayMenu.customizeColors")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
