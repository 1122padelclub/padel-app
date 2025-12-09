"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/src/components/ImageUpload"
import { FontSelector } from "@/src/components/FontSelector"
import { FeaturedItemsConfig } from "@/src/components/FeaturedItemsConfig"
import { iPhoneMockup } from "@/src/components/iPhoneMockup"
import { useGoogleFonts } from "@/src/hooks/useGoogleFonts"
import { useDisplayMenuData } from "@/src/hooks/useDisplayMenuData"
import { useT } from "@/src/hooks/useTranslation"
import { Palette, Type, Image, Layout, Sparkles, Share2, RotateCcw, Star, Smartphone, ExternalLink } from "lucide-react"
import type { DisplayMenuConfig } from "@/src/types"

interface DisplayMenuCustomizationPanelProps {
  barId: string
  config: DisplayMenuConfig | null
  onConfigChange: (updates: Partial<DisplayMenuConfig>) => void
  onReset: () => void
  loading: boolean
}

export function DisplayMenuCustomizationPanel({
  barId,
  config,
  onConfigChange,
  onReset,
  loading
}: DisplayMenuCustomizationPanelProps) {
  const t = useT()
  const [activeTab, setActiveTab] = useState("general")
  const { categories, items } = useDisplayMenuData(barId)
  const [pendingChanges, setPendingChanges] = useState<Partial<DisplayMenuConfig>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  if (!config) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    )
  }

  // Combinar config actual con cambios pendientes para la vista previa
  const previewConfig = { 
    ...config, 
    ...pendingChanges,
    // Asegurar que headerButtons existe con valores por defecto
    headerButtons: {
      leftButton: {
        text: "Contáctanos",
        url: "https://wa.me/1234567890",
        isVisible: true
      },
      rightButton: {
        text: "Recomendados",
        url: "#recomendados",
        isVisible: true
      },
      ...config?.headerButtons,
      ...pendingChanges?.headerButtons
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setPendingChanges(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [parent]: {
        ...config[parent as keyof DisplayMenuConfig],
        ...prev[parent as keyof DisplayMenuConfig],
        [field]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSaveChanges = () => {
    if (Object.keys(pendingChanges).length > 0) {
      onConfigChange(pendingChanges)
      setPendingChanges({})
      setHasUnsavedChanges(false)
    }
  }

  const handleResetChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      {/* Panel de personalización - Lado izquierdo */}
      <div className="flex-1 space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("admin.menuDisplayCustomization")}</h2>
            <p className="text-gray-600 mt-1">
              {t("admin.customizeMenuAppearanceForSocialMedia")}
            </p>
            {hasUnsavedChanges && (
              <p className="text-amber-600 text-sm mt-1">
                {t("admin.youHaveUnsavedChanges")}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {hasUnsavedChanges && (
              <Button
                variant="outline"
                onClick={handleResetChanges}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("admin.discardChanges")}
              </Button>
            )}
            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Palette className="h-4 w-4 mr-2" />
              {t("admin.saveChanges")}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={loading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("admin.resetAll")}
            </Button>
          </div>
        </div>

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>{t("admin.general")}</span>
            </TabsTrigger>
            <TabsTrigger value="header" className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>{t("admin.header")}</span>
            </TabsTrigger>
            <TabsTrigger value="modal" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>{t("admin.modal")}</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>{t("admin.typography")}</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>{t("admin.images")}</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span>{t("admin.design")}</span>
            </TabsTrigger>
            <TabsTrigger value="decorations" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>{t("admin.decorations")}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>{t("admin.networks")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t("admin.generalConfiguration")}
                </CardTitle>
                <CardDescription>
                  {t("admin.configureBasicElementsOfYourDisplayMenu")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="title">{t("admin.menuTitle")}</Label>
                            <Input
                              id="title"
                              value={previewConfig.title}
                              onChange={(e) => handleInputChange("title", e.target.value)}
                              placeholder="Mi Bar - Menú"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subtitle">{t("admin.subtitleOptional")}</Label>
                            <Input
                              id="subtitle"
                              value={previewConfig.subtitle || ""}
                              onChange={(e) => handleInputChange("subtitle", e.target.value)}
                              placeholder="Especialidades de la casa"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="backgroundColor">{t("admin.backgroundColor")}</Label>
                            <Input
                              id="backgroundColor"
                              type="color"
                              value={previewConfig.backgroundColor}
                              onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="textColor">{t("admin.textColor")}</Label>
                            <Input
                              id="textColor"
                              type="color"
                              value={previewConfig.textColor}
                              onChange={(e) => handleInputChange("textColor", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accentColor">{t("admin.accentColor")}</Label>
                          <Input
                            id="accentColor"
                            type="color"
                            value={previewConfig.accentColor}
                            onChange={(e) => handleInputChange("accentColor", e.target.value)}
                          />
                        </div>

                        {/* Colores del Título Principal */}
                        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <h4 className="text-lg font-semibold text-gray-900">{t("admin.mainTitleColors")}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="titleColor" className="text-gray-900">{t("admin.titleColor")}</Label>
                              <Input
                                id="titleColor"
                                type="color"
                                value={previewConfig.titleStyle?.titleColor || "#FFFFFF"}
                                onChange={(e) => handleNestedChange("titleStyle", "titleColor", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subtitleColor" className="text-gray-900">{t("admin.subtitleColor")}</Label>
                              <Input
                                id="subtitleColor"
                                type="color"
                                value={previewConfig.titleStyle?.subtitleColor || "#FFFFFF"}
                                onChange={(e) => handleNestedChange("titleStyle", "subtitleColor", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="titleBackgroundColor" className="text-gray-900">{t("admin.titleBackgroundColor")}</Label>
                            <Input
                              id="titleBackgroundColor"
                              type="color"
                              value={previewConfig.titleStyle?.backgroundColor || "#1F2937"}
                              onChange={(e) => handleNestedChange("titleStyle", "backgroundColor", e.target.value)}
                            />
                          </div>
                        </div>


                {/* Configuración de Imagen Hero */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showHeroImage"
                      checked={previewConfig.showHeroImage}
                      onCheckedChange={(checked) => handleInputChange("showHeroImage", checked)}
                    />
                    <Label htmlFor="showHeroImage" className="text-base font-semibold text-gray-900">
                      {t("admin.showCustomHeroImage")}
                    </Label>
                  </div>
                  
                  {previewConfig.showHeroImage && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-900">{t("admin.heroImage")}</Label>
                        <ImageUpload
                          value={previewConfig.heroImage || ""}
                          onChange={(value) => handleInputChange("heroImage", value)}
                          placeholder={t("admin.uploadHeroImageForYourMenu")}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="heroTitle" className="text-gray-900">{t("admin.heroTitle")}</Label>
                          <Input
                            id="heroTitle"
                            value={previewConfig.heroTitle || ""}
                            onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                            placeholder="Bienvenidos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heroSubtitle" className="text-gray-900">{t("admin.heroSubtitle")}</Label>
                          <Input
                            id="heroSubtitle"
                            value={previewConfig.heroSubtitle || ""}
                            onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                            placeholder="Disfruta de nuestros deliciosos platos"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Header */}
          <TabsContent value="header" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  {t("admin.headerButtons")}
                </CardTitle>
                <CardDescription>
                  {t("admin.configureButtonsThatAppearAtTopOfMenu")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Botón Izquierdo */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900">{t("admin.leftButton")}</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="leftButtonVisible"
                      checked={previewConfig.headerButtons.leftButton.isVisible}
                      onCheckedChange={(checked) => handleNestedChange("headerButtons", "leftButton", {
                        ...previewConfig.headerButtons.leftButton,
                        isVisible: checked
                      })}
                    />
                    <Label htmlFor="leftButtonVisible" className="text-base font-semibold text-gray-900">
                      {t("admin.showLeftButton")}
                    </Label>
                  </div>
                  
                  {previewConfig.headerButtons.leftButton.isVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leftButtonText" className="text-gray-900">{t("admin.buttonText")}</Label>
                        <Input
                          id="leftButtonText"
                          value={previewConfig.headerButtons.leftButton.text}
                          onChange={(e) => handleNestedChange("headerButtons", "leftButton", {
                            ...previewConfig.headerButtons.leftButton,
                            text: e.target.value
                          })}
                          placeholder="Contáctanos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leftButtonUrl" className="text-gray-900">{t("admin.buttonLink")}</Label>
                        <Input
                          id="leftButtonUrl"
                          value={previewConfig.headerButtons.leftButton.url}
                          onChange={(e) => handleNestedChange("headerButtons", "leftButton", {
                            ...previewConfig.headerButtons.leftButton,
                            url: e.target.value
                          })}
                          placeholder="https://wa.me/1234567890"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Derecho */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900">{t("admin.rightButton")}</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rightButtonVisible"
                      checked={previewConfig.headerButtons.rightButton.isVisible}
                      onCheckedChange={(checked) => handleNestedChange("headerButtons", "rightButton", {
                        ...previewConfig.headerButtons.rightButton,
                        isVisible: checked
                      })}
                    />
                    <Label htmlFor="rightButtonVisible" className="text-base font-semibold text-gray-900">
                      {t("admin.showRightButton")}
                    </Label>
                  </div>
                  
                  {previewConfig.headerButtons.rightButton.isVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rightButtonText" className="text-gray-900">{t("admin.buttonText")}</Label>
                        <Input
                          id="rightButtonText"
                          value={previewConfig.headerButtons.rightButton.text}
                          onChange={(e) => handleNestedChange("headerButtons", "rightButton", {
                            ...previewConfig.headerButtons.rightButton,
                            text: e.target.value
                          })}
                          placeholder="Recomendados"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rightButtonUrl" className="text-gray-900">{t("admin.buttonLink")}</Label>
                        <Input
                          id="rightButtonUrl"
                          value={previewConfig.headerButtons.rightButton.url}
                          onChange={(e) => handleNestedChange("headerButtons", "rightButton", {
                            ...previewConfig.headerButtons.rightButton,
                            url: e.target.value
                          })}
                          placeholder="#recomendados"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Ejemplos de enlaces */}
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800">{t("admin.linkExamples")}</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <code>https://wa.me/1234567890</code> - WhatsApp</li>
                    <li>• <code>tel:+1234567890</code> - Llamar</li>
                    <li>• <code>mailto:contacto@ejemplo.com</code> - Email</li>
                    <li>• <code>#recomendados</code> - Scroll interno</li>
                    <li>• <code>https://ejemplo.com</code> - Sitio web</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Modal */}
          <TabsContent value="modal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t("admin.modalColors")}
                </CardTitle>
                <CardDescription>
                  {t("admin.customizeModalColorsThatAppearWhenClickingMenuItem")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="modalTitleColor" className="text-gray-900">{t("admin.modalTitleColor")}</Label>
                    <Input
                      id="modalTitleColor"
                      type="color"
                      value={previewConfig.modalStyle?.titleColor || "#8B0000"}
                      onChange={(e) => handleNestedChange("modalStyle", "titleColor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalTextColor" className="text-gray-900">{t("admin.modalTextColor")}</Label>
                    <Input
                      id="modalTextColor"
                      type="color"
                      value={previewConfig.modalStyle?.textColor || "#333333"}
                      onChange={(e) => handleNestedChange("modalStyle", "textColor", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="modalPriceColor" className="text-gray-900">{t("admin.modalPriceColor")}</Label>
                    <Input
                      id="modalPriceColor"
                      type="color"
                      value={previewConfig.modalStyle?.priceColor || "#8B0000"}
                      onChange={(e) => handleNestedChange("modalStyle", "priceColor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalDescriptionColor" className="text-gray-900">{t("admin.modalDescriptionColor")}</Label>
                    <Input
                      id="modalDescriptionColor"
                      type="color"
                      value={previewConfig.modalStyle?.descriptionColor || "#666666"}
                      onChange={(e) => handleNestedChange("modalStyle", "descriptionColor", e.target.value)}
                    />
                  </div>
                </div>


                {/* Vista previa del modal */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900">{t("admin.modalPreview")}</h4>
                  <div className="p-4 rounded-lg border backdrop-blur-md" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 className="text-xl font-bold mb-2" style={{ color: previewConfig.modalStyle?.titleColor || "#8B0000" }}>
                      {t("admin.exampleItem")}
                    </h3>
                    <div className="text-lg font-bold mb-2" style={{ color: previewConfig.modalStyle?.priceColor || "#8B0000" }}>
                      $15.000
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold" style={{ color: previewConfig.modalStyle?.textColor || "#333333" }}>
                        {t("admin.description")}
                      </h4>
                      <p className="text-sm" style={{ color: previewConfig.modalStyle?.descriptionColor || "#666666" }}>
                        {t("admin.menuItemDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Tipografía */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  {t("admin.typographyConfiguration")}
                </CardTitle>
                <CardDescription>
                  {t("admin.customizeYourMenuFonts")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t("admin.mainFont")}</Label>
                    <FontSelector
                      value={previewConfig.fontFamily}
                      onChange={(value) => handleInputChange("fontFamily", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.titleFont")}</Label>
                    <FontSelector
                      value={previewConfig.titleFont}
                      onChange={(value) => handleInputChange("titleFont", value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t("admin.headerFont")}</Label>
                    <FontSelector
                      value={previewConfig.headerFont}
                      onChange={(value) => handleInputChange("headerFont", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.bodyFont")}</Label>
                    <FontSelector
                      value={previewConfig.bodyFont}
                      onChange={(value) => handleInputChange("bodyFont", value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Imágenes */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  {t("admin.imageConfiguration")}
                </CardTitle>
                <CardDescription>
                  {t("admin.customizeYourMenuImages")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("admin.backgroundImage")}</Label>
                  <ImageUpload
                    value={previewConfig.backgroundImage || ""}
                    onChange={(value) => handleInputChange("backgroundImage", value)}
                    placeholder={t("admin.uploadBackgroundImage")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="imageSize">{t("admin.imageSize")}</Label>
                    <Select value={previewConfig.imageSize} onValueChange={(value) => handleInputChange("imageSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.selectSize")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t("admin.small")}</SelectItem>
                        <SelectItem value="medium">{t("admin.medium")}</SelectItem>
                        <SelectItem value="large">{t("admin.large")}</SelectItem>
                        <SelectItem value="hero">{t("admin.hero")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageStyle">{t("admin.imageStyle")}</Label>
                    <Select value={previewConfig.imageStyle} onValueChange={(value) => handleInputChange("imageStyle", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.selectStyle")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">{t("admin.rounded")}</SelectItem>
                        <SelectItem value="square">{t("admin.square")}</SelectItem>
                        <SelectItem value="circle">{t("admin.circle")}</SelectItem>
                        <SelectItem value="none">{t("admin.none")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showImages"
                    checked={previewConfig.showImages}
                    onCheckedChange={(checked) => handleInputChange("showImages", checked)}
                  />
                  <Label htmlFor="showImages">{t("admin.showDishImages")}</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Diseño */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  {t("admin.designConfiguration")}
                </CardTitle>
                <CardDescription>
                  {t("admin.customizeMenuDesignAndLayout")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showPrices"
                      checked={previewConfig.showPrices}
                      onCheckedChange={(checked) => handleInputChange("showPrices", checked)}
                    />
                    <Label htmlFor="showPrices">{t("admin.showPrices")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDescriptions"
                      checked={previewConfig.showDescriptions}
                      onCheckedChange={(checked) => handleInputChange("showDescriptions", checked)}
                    />
                    <Label htmlFor="showDescriptions">{t("admin.showDescriptions")}</Label>
                  </div>
                </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="showBadges"
                              checked={previewConfig.showBadges}
                              onCheckedChange={(checked) => handleInputChange("showBadges", checked)}
                            />
                            <Label htmlFor="showBadges">{t("admin.showBadges")}</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="badgeColor" className="text-gray-900">{t("admin.badgeColor")}</Label>
                            <Input
                              id="badgeColor"
                              type="color"
                              value={previewConfig.badgeColor || "#3B82F6"}
                              onChange={(e) => handleInputChange("badgeColor", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Colores de categorías */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900">{t("admin.categoryColors")}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="categoryTextColor" className="text-gray-900">{t("admin.categoryTextColor")}</Label>
                              <Input
                                id="categoryTextColor"
                                type="color"
                                value={previewConfig.categoryStyle?.textColor || config.accentColor}
                                onChange={(e) => handleNestedChange("categoryStyle", "textColor", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="categoryBgColor" className="text-gray-900">{t("admin.categoryBackgroundColor")}</Label>
                              <Input
                                id="categoryBgColor"
                                type="color"
                                value={previewConfig.categoryStyle?.backgroundColor || "transparent"}
                                onChange={(e) => handleNestedChange("categoryStyle", "backgroundColor", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoryBorderColor" className="text-gray-900">{t("admin.categoryBorderColor")}</Label>
                            <Input
                              id="categoryBorderColor"
                              type="color"
                              value={previewConfig.categoryStyle?.borderColor || config.accentColor}
                              onChange={(e) => handleNestedChange("categoryStyle", "borderColor", e.target.value)}
                            />
                          </div>
                        </div>

                {/* Colores de items */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">{t("admin.itemColors")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemNameColor">{t("admin.itemNameColor")}</Label>
                      <Input
                        id="itemNameColor"
                        type="color"
                        value={previewConfig.itemStyle?.nameColor || config.textColor}
                        onChange={(e) => handleNestedChange("itemStyle", "nameColor", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemPriceColor">{t("admin.itemPriceColor")}</Label>
                      <Input
                        id="itemPriceColor"
                        type="color"
                        value={previewConfig.itemStyle?.priceColor || config.accentColor}
                        onChange={(e) => handleNestedChange("itemStyle", "priceColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Decoraciones */}
          <TabsContent value="decorations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t("admin.decorationsAndEffects")}
                </CardTitle>
                <CardDescription>
                  {t("admin.addVisualEffectsToYourMenu")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDivider"
                      checked={previewConfig.decorations.showDivider}
                      onCheckedChange={(checked) => handleNestedChange("decorations", "showDivider", checked)}
                    />
                    <Label htmlFor="showDivider">{t("admin.showDividers")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showShadows"
                      checked={previewConfig.decorations.showShadows}
                      onCheckedChange={(checked) => handleNestedChange("decorations", "showShadows", checked)}
                    />
                    <Label htmlFor="showShadows">{t("admin.showShadows")}</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showGradients"
                    checked={previewConfig.decorations.showGradients}
                    onCheckedChange={(checked) => handleNestedChange("decorations", "showGradients", checked)}
                  />
                  <Label htmlFor="showGradients">{t("admin.showGradients")}</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dividerStyle">{t("admin.dividerStyle")}</Label>
                    <Select 
                      value={previewConfig.decorations.dividerStyle} 
                      onValueChange={(value) => handleNestedChange("decorations", "dividerStyle", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.selectStyle")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">{t("admin.line")}</SelectItem>
                        <SelectItem value="dots">{t("admin.dots")}</SelectItem>
                        <SelectItem value="dashes">{t("admin.dashes")}</SelectItem>
                        <SelectItem value="none">{t("admin.none")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dividerColor">{t("admin.dividerColor")}</Label>
                    <Input
                      id="dividerColor"
                      type="color"
                      value={previewConfig.decorations.dividerColor}
                      onChange={(e) => handleNestedChange("decorations", "dividerColor", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Redes Sociales */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {t("admin.socialMediaAndContact")}
                </CardTitle>
                <CardDescription>
                  {t("admin.configureSocialMediaAndContactLinks")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showSocialLinks"
                    checked={previewConfig.socialLinks.showSocialLinks}
                    onCheckedChange={(checked) => handleNestedChange("socialLinks", "showSocialLinks", checked)}
                  />
                  <Label htmlFor="showSocialLinks">{t("admin.showSocialMediaLinks")}</Label>
                </div>

                {previewConfig.socialLinks.showSocialLinks && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">{t("admin.facebook")}</Label>
                      <Input
                        id="facebook"
                        value={previewConfig.socialLinks.facebook || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "facebook", e.target.value)}
                        placeholder="https://facebook.com/tu-bar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">{t("admin.instagram")}</Label>
                      <Input
                        id="instagram"
                        value={previewConfig.socialLinks.instagram || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "instagram", e.target.value)}
                        placeholder="https://instagram.com/tu-bar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">{t("admin.whatsapp")}</Label>
                      <Input
                        id="whatsapp"
                        value={previewConfig.socialLinks.whatsapp || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "whatsapp", e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">{t("admin.website")}</Label>
                      <Input
                        id="website"
                        value={previewConfig.socialLinks.website || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "website", e.target.value)}
                        placeholder="https://tu-bar.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("admin.phone")}</Label>
                      <Input
                        id="phone"
                        value={previewConfig.socialLinks.phone || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "phone", e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("admin.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={previewConfig.socialLinks.email || ""}
                        onChange={(e) => handleNestedChange("socialLinks", "email", e.target.value)}
                        placeholder="contacto@ejemplo.com"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Items Destacados - Siempre visible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t("admin.featuredItemsByCategory")}
            </CardTitle>
            <CardDescription>
              {t("admin.selectFeaturedItemForEachCategory")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeaturedItemsConfig
              config={config}
              categories={categories}
              items={items}
              onConfigChange={onConfigChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mockup del iPhone - Lado derecho, siempre visible */}
      <div className="w-full xl:w-96 flex-shrink-0">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {t("admin.realTimePreview")}
            </CardTitle>
            <CardDescription>
              {t("admin.seeHowYourMenuLooksOniPhone")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {/* iPhone Frame */}
              <div className="relative w-80 h-[640px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl border-4 border-gray-700">
                {/* Screen */}
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                  
                  {/* Status Bar */}
                  <div className="absolute top-2 left-4 right-4 z-20 flex justify-between items-center text-white text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 border border-white rounded-sm">
                        <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
                      </div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
                  
                  {/* Screen Content - Iframe con la página real */}
                  <div className="w-full h-full overflow-hidden pt-8">
                    <iframe
                      src={`/menu/${barId}?preview=true`}
                      className="w-full h-full border-0"
                      style={{
                        transform: 'scale(0.6)',
                        transformOrigin: 'top left',
                        width: '166.67%',
                        height: '166.67%'
                      }}
                      title="Vista previa del menú"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}