"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "@/src/components/ThemeProvider"
import { ThemeProvider } from "@/src/components/ThemeProvider"
import type { ThemeColors, ThemeMode, LayoutPreset, MenuCustomization } from "@/src/types/theme"
import { FontSelector } from "./FontSelector"
import { useGoogleFonts } from "@/src/hooks/useGoogleFonts"
import { TableCustomizationiPhoneMockup } from "./TableCustomizationiPhoneMockup"
import { Palette, Type, ImageIcon, Settings, Eye, Building2, Upload, X } from "lucide-react"
import { put } from "@vercel/blob"
import { useT } from "@/src/hooks/useTranslation"

interface TableCustomizationPanelProps {
  barId: string
}

function TableCustomizationContent({ barId }: TableCustomizationPanelProps) {
  const t = useT()
  const { theme, setTheme, resetTheme, saveTheme } = useTheme()
  const [previewMode, setPreviewMode] = useState<"table" | "menu">("table")
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar fuentes de Google cuando cambien las fuentes seleccionadas
  const selectedFonts = [
    theme.typography?.headerFont,
    theme.typography?.bodyFont,
    theme.typography?.buttonFont
  ].filter(Boolean) as string[]
  
  useGoogleFonts(selectedFonts)

  const handleFileUpload = async (file: File, assetType: string) => {
    if (!file) return

    setUploadingAsset(assetType)

    try {
      const blob = await put(`${barId}/${assetType}-${Date.now()}.${file.name.split(".").pop()}`, file, {
        access: "public",
      })

      const assetKey =
        assetType === "logo"
          ? "logoUrl"
          : assetType === "background"
            ? "backgroundImageUrl"
            : assetType === "menuBackground"
              ? "menuBackgroundUrl"
              : assetType === "headerBackground"
                ? "headerBackgroundUrl"
                : "logoUrl"

      setTheme({
        assets: { ...theme.assets, [assetKey]: blob.url },
      })
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploadingAsset(null)
    }
  }

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(value)) return

    setTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    })
  }

  const handleTypographyChange = (key: keyof typeof theme.typography, value: string) => {
    setTheme({
      typography: {
        ...theme.typography,
        [key]: value,
      },
    })
  }

  const handleMenuCustomizationChange = (key: keyof MenuCustomization, value: any) => {
    setTheme({
      menuCustomization: {
        ...theme.menuCustomization,
        [key]: value,
      },
    })
  }

  const handleBrandingChange = (key: keyof typeof theme.branding, value: string | boolean) => {
    setTheme({
      branding: {
        ...theme.branding,
        [key]: value,
      },
    })
  }

  const handleModeChange = (mode: ThemeMode) => {
    setTheme({ mode })
  }

  const handleLayoutChange = (layoutPreset: LayoutPreset) => {
    setTheme({ layoutPreset })
  }

  const removeAsset = (assetKey: keyof typeof theme.assets) => {
    setTheme({
      assets: { ...theme.assets, [assetKey]: undefined },
    })
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await saveTheme()
      alert("Cambios guardados exitosamente. Todas las mesas han sido actualizadas.")
    } catch (error) {
      console.error("Error saving theme:", error)
      alert("Error al guardar los cambios. Por favor intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("admin.tableCustomization")}</h1>
          <p className="text-muted-foreground">
            {t("admin.customizeTableVisualAspect")}
          </p>
        </div>

        <div className="space-y-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("admin.tableDesignConfiguration")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="branding">
                    <Building2 className="w-4 h-4 mr-1" />
                    {t("admin.brand")}
                  </TabsTrigger>
                  <TabsTrigger value="colors">
                    <Palette className="w-4 h-4 mr-1" />
                    {t("admin.colors")}
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <Type className="w-4 h-4 mr-1" />
                    {t("admin.typography")}
                  </TabsTrigger>
                  <TabsTrigger value="assets">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    {t("admin.assets")}
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <Settings className="w-4 h-4 mr-1" />
                    {t("admin.layout")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("admin.restaurantName")}</Label>
                      <Input
                        type="text"
                        value={theme.branding?.restaurantName || "Mi Restaurante"}
                        onChange={(e) => handleBrandingChange("restaurantName", e.target.value)}
                        placeholder={t("admin.restaurantNamePlaceholder")}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Este nombre aparecerá en todas las interfaces de mesa y menú
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("admin.tagline")} (Opcional)</Label>
                      <Input
                        type="text"
                        value={theme.branding?.tagline || ""}
                        onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                        placeholder={t("admin.taglinePlaceholder")}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Texto descriptivo que aparece debajo del nombre</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t("admin.showPoweredBy")}</Label>
                        <p className="text-xs text-muted-foreground">Muestra la marca Gibra en la parte inferior</p>
                      </div>
                      <Switch
                        checked={theme.branding?.showPoweredBy ?? true}
                        onCheckedChange={(checked) => handleBrandingChange("showPoweredBy", checked)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Colores principales */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Colores Principales</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("admin.backgroundColor")}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={theme.colors.background}
                              onChange={(e) => handleColorChange("background", e.target.value)}
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              type="text"
                              value={theme.colors.background}
                              onChange={(e) => handleColorChange("background", e.target.value)}
                              className="flex-1"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("admin.textColor")}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={theme.colors.menuText}
                              onChange={(e) => handleColorChange("menuText", e.target.value)}
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              type="text"
                              value={theme.colors.menuText}
                              onChange={(e) => handleColorChange("menuText", e.target.value)}
                              className="flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("admin.primaryColor")}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={theme.colors.primary}
                              onChange={(e) => handleColorChange("primary", e.target.value)}
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              type="text"
                              value={theme.colors.primary}
                              onChange={(e) => handleColorChange("primary", e.target.value)}
                              className="flex-1"
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Color Secundario</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={theme.colors.secondary}
                              onChange={(e) => handleColorChange("secondary", e.target.value)}
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              type="text"
                              value={theme.colors.secondary}
                              onChange={(e) => handleColorChange("secondary", e.target.value)}
                              className="flex-1"
                              placeholder="#64748b"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Modo de Tema</Label>
                      <Select value={theme.mode} onValueChange={handleModeChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Oscuro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Escala de Fuente</Label>
                      <Select
                        value={theme.typography.scale}
                        onValueChange={(scale: "small" | "medium" | "large") =>
                          setTheme({ typography: { ...theme.typography, scale } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeña</SelectItem>
                          <SelectItem value="medium">Mediana</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Tipografías Específicas</h4>

                      <div className="space-y-6">
                        <FontSelector
                          value={theme.typography.headerFont || "Inter"}
                          onChange={(value) => handleTypographyChange("headerFont", value)}
                          label="Fuente del Header"
                          placeholder="Selecciona una fuente para el encabezado..."
                        />

                        <FontSelector
                          value={theme.typography.bodyFont || "Inter"}
                          onChange={(value) => handleTypographyChange("bodyFont", value)}
                          label="Fuente del Cuerpo"
                          placeholder="Selecciona una fuente para el texto principal..."
                        />

                        <FontSelector
                          value={theme.typography.buttonFont || "Inter"}
                          onChange={(value) => handleTypographyChange("buttonFont", value)}
                          label="Fuente de Botones"
                          placeholder="Selecciona una fuente para los botones..."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assets" className="space-y-4 mt-6">
                  <div className="space-y-6">
                    {/* Logo del Restaurante */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Logo del Restaurante</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <div className="flex flex-col items-center gap-3">
                          {theme.assets.logoUrl ? (
                            <div className="relative">
                              <img
                                src={theme.assets.logoUrl || "/placeholder.svg"}
                                alt="Logo preview"
                                className="w-20 h-20 object-contain border rounded"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => removeAsset("logoUrl")}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}

                          <div className="text-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, "logo")
                              }}
                              className="hidden"
                              id="logo-upload"
                              disabled={uploadingAsset === "logo"}
                            />
                            <Label
                              htmlFor="logo-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                            >
                              <Upload className="w-4 h-4" />
                              {uploadingAsset === "logo" ? "Subiendo..." : "Subir Logo"}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Imagen de Fondo */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Imagen de Fondo para Mesas</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <div className="flex flex-col items-center gap-3">
                          {theme.assets.backgroundImageUrl ? (
                            <div className="relative">
                              <img
                                src={theme.assets.backgroundImageUrl || "/placeholder.svg"}
                                alt="Background preview"
                                className="w-full h-24 object-cover border rounded"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => removeAsset("backgroundImageUrl")}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}

                          <div className="text-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, "background")
                              }}
                              className="hidden"
                              id="background-upload"
                              disabled={uploadingAsset === "background"}
                            />
                            <Label
                              htmlFor="background-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                            >
                              <Upload className="w-4 h-4" />
                              {uploadingAsset === "background" ? "Subiendo..." : "Subir Fondo"}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Imagen de Fondo del Menú */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Imagen de Fondo del Menú</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <div className="flex flex-col items-center gap-3">
                          {theme.assets.menuBackgroundUrl ? (
                            <div className="relative">
                              <img
                                src={theme.assets.menuBackgroundUrl || "/placeholder.svg"}
                                alt="Menu background preview"
                                className="w-full h-24 object-cover border rounded"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => removeAsset("menuBackgroundUrl")}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}

                          <div className="text-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, "menuBackground")
                              }}
                              className="hidden"
                              id="menu-background-upload"
                              disabled={uploadingAsset === "menuBackground"}
                            />
                            <Label
                              htmlFor="menu-background-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                            >
                              <Upload className="w-4 h-4" />
                              {uploadingAsset === "menuBackground" ? "Subiendo..." : "Subir Fondo Menú"}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="menu" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Estilo de Categorías</h4>

                    <div className="space-y-2">
                      <Label>Forma de las Categorías</Label>
                      <Select
                        value={theme.menuCustomization.categoryStyle}
                        onValueChange={(value: "rounded" | "oval" | "square" | "custom") =>
                          handleMenuCustomizationChange("categoryStyle", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oval">Ovaladas</SelectItem>
                          <SelectItem value="rounded">Redondeadas</SelectItem>
                          <SelectItem value="square">Cuadradas</SelectItem>
                          <SelectItem value="custom">Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Radio de Bordes: {theme.menuCustomization.borderRadius}px</Label>
                      <Slider
                        value={[theme.menuCustomization.borderRadius]}
                        onValueChange={([value]) => handleMenuCustomizationChange("borderRadius", value)}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Opacidad del Fondo: {theme.menuCustomization.backgroundOpacity}%</Label>
                      <Slider
                        value={[theme.menuCustomization.backgroundOpacity]}
                        onValueChange={([value]) => handleMenuCustomizationChange("backgroundOpacity", value)}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Estilo de Mesa</Label>
                      <Select value={theme.layoutPreset} onValueChange={handleLayoutChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Clásico</SelectItem>
                          <SelectItem value="glass">Cristal Moderno</SelectItem>
                          <SelectItem value="high-contrast">Alto Contraste</SelectItem>
                          <SelectItem value="event-skin">Evento Especial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={theme.soundPack.enabled}
                        onCheckedChange={(enabled) => setTheme({ soundPack: { ...theme.soundPack, enabled } })}
                      />
                      <Label>Sonidos de Notificación</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={theme.haptics.enabled}
                        onCheckedChange={(enabled) => setTheme({ haptics: { ...theme.haptics, enabled } })}
                      />
                      <Label>Vibración en Dispositivos Móviles</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6 pt-6 border-t">
                <Button onClick={handleSaveChanges} className="flex-1" disabled={isSaving}>
                  {isSaving ? t("admin.saving") : t("admin.saveChanges")}
                </Button>
                <Button onClick={resetTheme} variant="outline" className="flex-1 bg-transparent">
                  {t("admin.resetTheme")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mockup de iPhone */}
          <div className="bg-red-500 p-4 text-white">
            <h2 className="text-xl font-bold">🔍 TEST: Componente se está renderizando</h2>
            <p>BarId: {barId}</p>
            <p>Theme: {JSON.stringify(theme, null, 2)}</p>
          </div>
          <TableCustomizationiPhoneMockup barId={barId} themeConfig={theme} />
        </div>
      </div>
    </div>
  )
}

function TableInterfacePreview() {
  const { theme } = useTheme()
  const t = useT()

  const getPreviewContainerStyle = () => ({
    backgroundColor: theme.colors.background,
    backgroundImage: theme.assets.backgroundImageUrl ? `url(${theme.assets.backgroundImageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "600px",
    position: "relative" as const,
    overflow: "hidden" as const,
  })

  const getTextStyle = () => ({
    color: theme.colors.menuText,
    fontFamily: theme.typography.headerFont,
  })

  const getSecondaryTextStyle = () => {
    const color = theme.colors.menuText
    if (color.startsWith("#")) {
      const r = Number.parseInt(color.slice(1, 3), 16)
      const g = Number.parseInt(color.slice(3, 5), 16)
      const b = Number.parseInt(color.slice(5, 7), 16)
      return { color: `rgba(${r}, ${g}, ${b}, 0.7)` }
    }
    return { color: theme.colors.menuText }
  }

  const getPrimaryButtonStyle = () => ({
    backgroundColor: theme.colors.primary,
    borderRadius: `${theme.menuCustomization.borderRadius}px`,
    color: "white",
  })

  const getSecondaryButtonStyle = () => ({
    backgroundColor: theme.colors.secondary,
    borderRadius: `${theme.menuCustomization.borderRadius}px`,
    color: "white",
  })

  const getSurfaceStyle = () => ({
    backgroundColor: `${theme.colors.primary}15`,
    border: `1px solid ${theme.colors.primary}30`,
    borderRadius: `${theme.menuCustomization.borderRadius}px`,
  })

  return (
    <div className="h-full flex flex-col justify-between p-6" style={getPreviewContainerStyle()}>
      {/* Header */}
      <div className="text-center space-y-4">
        {theme.assets.logoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={theme.assets.logoUrl || "/placeholder.svg"}
              alt="Logo"
              className="w-16 h-16 rounded-lg object-contain"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2" style={getTextStyle()}>
          {theme.branding?.restaurantName || "Match Tag"}
        </h1>

        {theme.branding?.tagline && (
          <p className="text-base mb-6" style={getSecondaryTextStyle()}>
            {theme.branding.tagline}
          </p>
        )}

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            backgroundColor: `${theme.colors.primary}20`,
            border: `2px solid ${theme.colors.primary}`,
          }}
        >
          <span className="font-semibold text-lg" style={{ color: theme.colors.primary }}>
            Tu mesa: 5
          </span>
        </div>
      </div>

      {/* Conversaciones Activas */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="rounded-2xl p-4 mb-6" style={getSurfaceStyle()}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
            <h3 className="text-base font-semibold" style={getTextStyle()}>
              {t("admin.activeConversations")}
            </h3>
          </div>

          <div className="text-center py-6">
            <p className="text-sm" style={getSecondaryTextStyle()}>
              {t("admin.noActiveConversations")}
            </p>
            <p className="text-xs mt-1" style={getSecondaryTextStyle()}>
              {t("admin.discoverTablesAndMatch")}
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 text-sm font-semibold rounded-2xl transition-colors" style={getPrimaryButtonStyle()}>
            {t("admin.viewChats")}
          </button>
          <button
            className="py-3 text-sm font-semibold rounded-2xl transition-colors"
            style={getSecondaryButtonStyle()}
          >
            {t("admin.discover")}
          </button>
        </div>

        <button
          className="w-full py-3 text-sm font-semibold rounded-2xl transition-colors"
          style={{
            backgroundColor: "#f59e0b",
            borderRadius: `${theme.menuCustomization.borderRadius}px`,
            color: "white",
          }}
        >
          {t("admin.callWaiter")}
        </button>

        <button
          className="w-full py-3 text-sm font-semibold rounded-2xl transition-colors"
          style={{
            backgroundColor: "#10b981",
            borderRadius: `${theme.menuCustomization.borderRadius}px`,
            color: "white",
          }}
        >
          {t("admin.makeOrderForMyTable")}
        </button>
      </div>

      {/* Footer */}
      {theme.branding?.showPoweredBy && (
        <div
          className="text-center pt-4 mt-4 border-t border-opacity-20"
          style={{ borderColor: theme.colors.menuText }}
        >
          <p className="text-xs" style={getSecondaryTextStyle()}>
            {t("admin.poweredByMatchTag")}
          </p>
        </div>
      )}
    </div>
  )
}

export function TableCustomizationPanel({ barId }: TableCustomizationPanelProps) {
  return (
    <ThemeProvider barId={barId}>
      <TableCustomizationContent barId={barId} />
    </ThemeProvider>
  )
}
