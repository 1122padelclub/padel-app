import { adb } from "@/lib/admin"
import { NextResponse } from "next/server"
export const runtime = "nodejs"

const esc = (v: any) => {
  const s = v == null ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barId = searchParams.get("barId") || ""
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  if (!barId) return NextResponse.json({ ok: false, error: "barId required" }, { status: 400 })

  let col = adb.collection(`bars/${barId}/crm_contacts`)
  if (from) col = col.where("lastOrderAt", ">=", new Date(from))
  if (to) col = col.where("lastOrderAt", "<=", new Date(to))

  const snap = await col.get()
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "barId",
    "tableId",
    "ordersCount",
    "lifetimeValue",
    "firstSeenAt",
    "lastOrderAt",
    "tags",
    "notes",
  ]
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.name,
        r.email,
        r.phone,
        r.barId,
        r.tableId ?? "",
        r.ordersCount ?? 0,
        r.lifetimeValue ?? 0,
        r.firstSeenAt?.toDate?.()?.toISOString?.() ?? "",
        r.lastOrderAt?.toDate?.()?.toISOString?.() ?? "",
        Array.isArray(r.tags) ? r.tags.join("|") : "",
        r.notes ?? "",
      ]
        .map(esc)
        .join(","),
    ),
  ]
  const csv = lines.join("\n")

  const filename = `crm_contacts_${barId}_${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
