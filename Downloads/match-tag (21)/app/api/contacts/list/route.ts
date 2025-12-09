import { adb } from "@/lib/admin"
import { NextResponse } from "next/server"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barId = searchParams.get("barId") || ""
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const limit = Number(searchParams.get("limit") || 100)

  if (!barId) return NextResponse.json({ ok: false, error: "barId required" }, { status: 400 })

  let col = adb.collection(`bars/${barId}/crm_contacts`)
  if (from) col = col.where("lastOrderAt", ">=", new Date(from))
  if (to) col = col.where("lastOrderAt", "<=", new Date(to))

  const snap = await col.limit(limit).get()
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return NextResponse.json({ ok: true, rows })
}
