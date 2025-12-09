"use client"

import { useParams, useSearchParams } from "next/navigation"
import { DisplayMenuPage } from "@/src/components/DisplayMenuPage"
import { useDisplayMenuConfig } from "@/src/hooks/useDisplayMenuConfig"
import { useDisplayMenuData } from "@/src/hooks/useDisplayMenuData"
import { useAnnouncementDisplay } from "@/src/hooks/useAnnouncementDisplay"
import { AnnouncementModal } from "@/src/components/AnnouncementModal"
import { Loader2 } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"

export default function MenuPage() {
  const t = useT()
  const params = useParams()
  const searchParams = useSearchParams()
  const barId = params.barId as string
  const isPreview = searchParams.get('preview') === 'true'

  const { config, loading: configLoading, error: configError } = useDisplayMenuConfig(barId)
  const { categories, items, loading: dataLoading, error: dataError } = useDisplayMenuData(barId)
  
  // Hook para mostrar anuncios en menú
  const { 
    announcements, 
    showAnnouncement, 
    handleCloseAnnouncement 
  } = useAnnouncementDisplay({ 
    barId, 
    showOnMenu: true, 
    showOnTable: false 
  })

  if (configLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (configError || dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">
            {configError || dataError || "No se pudo cargar el menú"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!config || (!config.isActive && !isPreview)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Menú no disponible</h1>
          <p className="text-gray-600">
            Este menú no está disponible en este momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DisplayMenuPage 
        config={config}
        categories={categories}
        items={items}
      />
      
      {/* Modal de Anuncios */}
      <AnnouncementModal
        announcements={announcements}
        isOpen={showAnnouncement}
        onClose={handleCloseAnnouncement}
      />
    </>
  )
}
