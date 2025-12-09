"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useTableCustomization, type TableCustomization } from "@/src/hooks/useTableCustomization"
import { Upload, Save, RefreshCw, Palette, Type, Image, Settings } from "lucide-react"
import { ImageUpload } from "./ImageUpload"
import { FontSelector } from "./FontSelector"
import { useGoogleFonts } from "@/src/hooks/useGoogleFonts"
import { useT } from "@/src/hooks/useTranslation"

interface TableCustomizationEditorProps {
  barId: string
  onSave?: (customization: TableCustomization) => void
}

export function TableCustomizationEditor({ barId, onSave }: TableCustomizationEditorProps) {
  const t = useT()
  const { customization, loading, error, saving, saveCustomization } = useTableCustomization(barId)
  const [localCustomization, setLocalCustomization] = useState<TableCustomization | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Cargar fuentes de Google cuando cambien las fuentes seleccionadas
  const selectedFonts = localCustomization ? [
    localCustomization.fontFamily,
    localCustomization.headerFont,
    localCustomization.bodyFont,
    localCustomization.buttonFont
  ].filter(Boolean) as string[] : []
  
  useGoogleFonts(selectedFonts)

  useEffect(() => {
    if (customization) {
      setLocalCustomization(customization)
    }
  }, [customization])

  const handleSave = async () => {
    if (!localCustomization) return

    const success = await saveCustomization(localCustomization)
    if (success && onSave) {
      onSave(localCustomization)
    }
  }

  const handleColorChange = (field: keyof TableCustomization, value: string) => {
    if (!localCustomization) return
    setLocalCustomization({
      ...localCustomization,
      [field]: value
    })
  }

  const handleNumberChange = (field: keyof TableCustomization, value: number) => {
    if (!localCustomization) return
    setLocalCustomization({
      ...localCustomization,
      [field]: value
    })
  }

  const handleBooleanChange = (field: keyof TableCustomization, value: boolean) => {
    if (!localCustomization) return
    setLocalCustomization({
      ...localCustomization,
      [field]: value
    })
  }

  const handleStringChange = (field: keyof TableCustomization, value: string) => {
    if (!localCustomization) return
    setLocalCustomization({
      ...localCustomization,
      [field]: value
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t("tableCustomization.loadingCustomization")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!localCustomization) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">{t("tableCustomization.couldNotLoadCustomization")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("tableCustomization.tableCustomization")}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? t("tableCustomization.edit") : t("tableCustomization.preview")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("tableCustomization.save")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("tableCustomization.colors")}
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            {t("tableCustomization.typography")}
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t("tableCustomization.images")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t("tableCustomization.configuration")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tableCustomization.themeColors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">{t("tableCustomization.primaryColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={localCustomization.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localCustomization.primaryColor}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">{t("tableCustomization.secondaryColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={localCustomization.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localCustomization.secondaryColor}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">{t("tableCustomization.textColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={localCustomization.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localCustomization.textColor}
                      onChange={(e) => handleColorChange("textColor", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="backgroundColor">{t("tableCustomization.backgroundColor")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={localCustomization.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localCustomization.backgroundColor}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      placeholder="#f8fafc"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tableCustomization.typographyConfiguration")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FontSelector
                value={localCustomization.fontFamily}
                onChange={(value) => handleStringChange("fontFamily", value)}
                label={t("tableCustomization.mainFont")}
                placeholder={t("tableCustomization.selectMainFont")}
              />
              
              <div>
                <Label htmlFor="fontSize">{t("tableCustomization.fontSize")}</Label>
                <Input
                  id="fontSize"
                  value={localCustomization.fontSize}
                  onChange={(e) => handleStringChange("fontSize", e.target.value)}
                  placeholder="16px"
                />
              </div>

              {localCustomization.headerFont && (
                <FontSelector
                  value={localCustomization.headerFont}
                  onChange={(value) => handleStringChange("headerFont", value)}
                  label={t("tableCustomization.headerFont")}
                  placeholder={t("tableCustomization.selectHeaderFont")}
                />
              )}

              {localCustomization.bodyFont && (
                <FontSelector
                  value={localCustomization.bodyFont}
                  onChange={(value) => handleStringChange("bodyFont", value)}
                  label={t("tableCustomization.bodyFont")}
                  placeholder={t("tableCustomization.selectBodyFont")}
                />
              )}

              {localCustomization.buttonFont && (
                <FontSelector
                  value={localCustomization.buttonFont}
                  onChange={(value) => handleStringChange("buttonFont", value)}
                  label={t("tableCustomization.buttonFont")}
                  placeholder={t("tableCustomization.selectButtonFont")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tableCustomization.imagesAndAssets")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label={t("tableCustomization.backgroundImage")}
                description={t("tableCustomization.uploadBackgroundImageForTables")}
                value={localCustomization.backgroundImageUrl || ""}
                onChange={(url) => handleStringChange("backgroundImageUrl", url)}
                maxSize={10}
              />
              
              <ImageUpload
                label={t("tableCustomization.restaurantLogo")}
                description={t("tableCustomization.uploadRestaurantLogo")}
                value={localCustomization.logoUrl || ""}
                onChange={(url) => handleStringChange("logoUrl", url)}
                maxSize={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tableCustomization.generalConfiguration")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="restaurantName">{t("tableCustomization.restaurantName")}</Label>
                <Input
                  id="restaurantName"
                  value={localCustomization.restaurantName}
                  onChange={(e) => handleStringChange("restaurantName", e.target.value)}
                  placeholder="Match Tag"
                />
              </div>
              <div>
                <Label htmlFor="tagline">{t("tableCustomization.tagline")}</Label>
                <Input
                  id="tagline"
                  value={localCustomization.tagline}
                  onChange={(e) => handleStringChange("tagline", e.target.value)}
                  placeholder="Conecta con otras mesas en tu bar o discoteca"
                />
              </div>
              <div>
                <Label htmlFor="tableName">{t("tableCustomization.tableName")}</Label>
                <Input
                  id="tableName"
                  value={localCustomization.tableName}
                  onChange={(e) => handleStringChange("tableName", e.target.value)}
                  placeholder="Mesa"
                />
              </div>
              <div>
                <Label htmlFor="welcomeMessage">{t("tableCustomization.welcomeMessage")}</Label>
                <Textarea
                  id="welcomeMessage"
                  value={localCustomization.welcomeMessage}
                  onChange={(e) => handleStringChange("welcomeMessage", e.target.value)}
                  placeholder="¡Bienvenido a tu mesa!"
                />
              </div>
              <div>
                <Label htmlFor="logoSize">{t("tableCustomization.logoSize")}</Label>
                <div className="space-y-2">
                  <Slider
                    value={[localCustomization.logoSize || 40]}
                    onValueChange={([value]) => handleNumberChange("logoSize", value)}
                    min={20}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">
                    {localCustomization.logoSize || 40}px
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="borderRadius">{t("tableCustomization.borderRadius")}</Label>
                <div className="space-y-2">
                  <Slider
                    value={[localCustomization.borderRadius]}
                    onValueChange={([value]) => handleNumberChange("borderRadius", value)}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">
                    {localCustomization.borderRadius}px
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPoweredBy"
                  checked={localCustomization.showPoweredBy}
                  onCheckedChange={(checked) => handleBooleanChange("showPoweredBy", checked)}
                />
                <Label htmlFor="showPoweredBy">{t("tableCustomization.showPoweredBy")}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: localCustomization.backgroundColor,
                color: localCustomization.textColor,
                fontFamily: localCustomization.fontFamily,
                fontSize: localCustomization.fontSize,
                borderRadius: `${localCustomization.borderRadius}px`,
                backgroundImage: localCustomization.backgroundImageUrl 
                  ? `url(${localCustomization.backgroundImageUrl})` 
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="text-center">
                {localCustomization.logoUrl && (
                  <img
                    src={localCustomization.logoUrl}
                    alt="Logo"
                    className="h-16 w-auto mx-auto mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold mb-2">{localCustomization.restaurantName}</h1>
                <p className="text-sm opacity-70 mb-4">{localCustomization.tagline}</p>
                <div
                  className="inline-block px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: localCustomization.primaryColor,
                    color: localCustomization.textColor,
                    borderRadius: `${localCustomization.borderRadius}px`,
                  }}
                >
                  {localCustomization.tableName} 1
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

