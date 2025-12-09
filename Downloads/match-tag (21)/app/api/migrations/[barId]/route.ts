import { type NextRequest, NextResponse } from "next/server"
import { migrateBarWithAdminSDK, checkMigrationStatus } from "@/lib/barMigrationsServer"

export async function GET(request: NextRequest, { params }: { params: { barId: string } }) {
  try {
    const { barId } = params

    if (!barId) {
      return NextResponse.json({ error: "Bar ID is required" }, { status: 400 })
    }

    const status = await checkMigrationStatus(barId)
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking migration status:", error)
    return NextResponse.json({ error: "Failed to check migration status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { barId: string } }) {
  try {
    const { barId } = params
    const { force = false } = await request.json()

    if (!barId) {
      return NextResponse.json({ error: "Bar ID is required" }, { status: 400 })
    }

    const result = await migrateBarWithAdminSDK(barId, force)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error migrating bar:", error)
    return NextResponse.json({ error: "Failed to migrate bar" }, { status: 500 })
  }
}
