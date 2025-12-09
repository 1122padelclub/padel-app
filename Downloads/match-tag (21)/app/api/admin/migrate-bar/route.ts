import { type NextRequest, NextResponse } from "next/server"
import { migrateBarWithAdminSDK, checkMigrationStatus } from "@/lib/barMigrationsServer"

export async function POST(request: NextRequest) {
  try {
    const { barId, force = false } = await request.json()

    if (!barId) {
      return NextResponse.json({ error: "barId is required" }, { status: 400 })
    }

    console.log(`[API] Starting migration for bar: ${barId}`)

    const result = await migrateBarWithAdminSDK(barId, force)

    if (result.success) {
      console.log(`[API] Migration completed for bar: ${barId}`)
      return NextResponse.json({
        success: true,
        message: `Bar ${barId} migrated successfully`,
        details: result,
      })
    } else {
      console.error(`[API] Migration failed for bar: ${barId}`, result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: `Migration failed for bar ${barId}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[API] Migration endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Internal server error during migration",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barId = searchParams.get("barId")

    if (!barId) {
      return NextResponse.json({ error: "barId parameter is required" }, { status: 400 })
    }

    const status = await checkMigrationStatus(barId)

    return NextResponse.json({
      barId,
      migrationStatus: status,
    })
  } catch (error) {
    console.error("[API] Migration status check error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Error checking migration status",
      },
      { status: 500 },
    )
  }
}
