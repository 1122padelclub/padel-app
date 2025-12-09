import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { barId: string } }) {
  try {
    const { barId } = params

    console.log("[v0] API: Reading theme for bar:", barId)

    // Por ahora, devolver configuración por defecto
    // En el futuro, esto se puede conectar a una base de datos real
    const defaultTheme = {
      colors: {
        background: "#0b234a",
        surface: "rgba(0,0,0,0.35)",
        text: "#e5e7eb",
        primary: "#0d1b2a",
        secondary: "#1f2937",
        menuText: "#ffffff",
        success: "#22c55e",
        danger: "#ef4444",
        customBackground: null,
      },
      menuCustomization: {
        borderRadius: 12,
      },
      branding: {
        restaurantName: "Match Tag",
        tagline: "Conecta con otras mesas",
        showPoweredBy: true,
      },
      mode: "dark",
      layoutPreset: "default",
      typography: {
        scale: "medium",
      },
      assets: {
        logoUrl: null,
        backgroundImageUrl: null,
      },
    }

    console.log("[v0] API: Returning default theme")

    return NextResponse.json({
      success: true,
      data: defaultTheme,
      message: "Theme read successfully",
    })
  } catch (error) {
    console.error("[v0] API: Unexpected error reading theme:", error)
    return NextResponse.json(
      {
        error: "Failed to read theme",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { barId: string } }) {
  try {
    const { barId } = params
    const themeData = await request.json()

    console.log("[v0] API: Saving theme for bar:", barId)
    console.log("[v0] API: Theme data:", themeData)

    // Por ahora, simular guardado exitoso
    // En el futuro, esto se puede conectar a una base de datos real
    console.log("[v0] API: Theme saved successfully (simulated)")

    return NextResponse.json({
      success: true,
      message: "Theme saved successfully",
    })
  } catch (error) {
    console.error("[v0] API: Unexpected error saving theme:", error)
    return NextResponse.json(
      {
        error: "Failed to save theme",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
