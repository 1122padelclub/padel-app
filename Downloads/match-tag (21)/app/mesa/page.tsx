"use client"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useThemeConfig } from "@/src/hooks/useThemeConfig"
import { MesaPageClient } from "@/src/components/MesaPageClient"

export const dynamic = "force-dynamic"

export default function MesaPage() {
  const sp = useSearchParams()
  const barId = sp.get("barId") ?? ""
  const tableId = sp.get("tableId") ?? ""
  const { themeConfig, loading, error } = useThemeConfig(barId)

  if (!barId) return <p className="p-6">Falta barId en la URL</p>
  if (loading) return <div className="p-6">Cargando mesa…</div>
  // No mostrar error de branding, usar valores por defecto
  // if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  // Usar configuración del tema del admin
  const primary = themeConfig?.branding?.primaryColor ?? "#0ea5e9"
  const secondary = themeConfig?.branding?.secondaryColor ?? "#1f2937"
  const textColor = themeConfig?.branding?.textColor ?? "#ffffff"
  const backgroundImage = themeConfig?.assets?.backgroundImageUrl
  const logoUrl = themeConfig?.assets?.logoUrl
  const restaurantName = themeConfig?.branding?.restaurantName ?? "Match Tag"

  return (
    <main
      style={{
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${primary}, ${secondary})`,
        minHeight: "100vh",
        fontFamily: themeConfig?.branding?.fontFamily || "system-ui, sans-serif",
      }}
    >

      <div style={{ color: textColor }}>
        <MesaPageClient />
      </div>
    </main>
  )
}
