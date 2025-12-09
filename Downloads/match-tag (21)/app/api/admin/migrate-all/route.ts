import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { force = false, batchSize = 10 } = await request.json()

    console.log("[API] Starting mass migration with batchSize:", batchSize)

    const { migrateAllBarsToNewStructure } = await import("@/lib/barMigrations")
    const result = await migrateAllBarsToNewStructure(force, batchSize)

    if (result.success) {
      console.log("[API] Mass migration completed successfully")
      return NextResponse.json({
        success: true,
        message: "Mass migration completed successfully",
        details: result,
      })
    } else {
      console.error("[API] Mass migration failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "Mass migration failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[API] Mass migration endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Internal server error during mass migration",
      },
      { status: 500 },
    )
  }
}
