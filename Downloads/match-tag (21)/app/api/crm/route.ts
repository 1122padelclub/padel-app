import { NextResponse } from "next/server"
import { adb } from "@/lib/admin"

export const runtime = "nodejs" // asegurar Node runtime

function mapOrderToCRM(order: any) {
  return {
    name: order?.customer?.name ?? "Cliente Match Tag",
    phone: order?.customer?.phone ?? "",
    email: order?.customer?.email ?? "",
    barId: order?.barId,
    tableId: order?.tableId,
    total: order?.total ?? 0,
    items: (order?.items ?? []).map((i: any) => ({ name: i.name, qty: i.qty, price: i.price })),
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, payload } = body

    console.log("[v0] CRM API called with orderId:", orderId)

    // Obtener pedido si solo envían orderId
    const order = payload ?? (await adb.doc(`orders/${orderId}`).get()).data()
    if (!order) {
      console.log("[v0] Order not found:", orderId)
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
    }

    const idemp = orderId ?? order?.id
    const crmPayload = mapOrderToCRM(order)

    console.log("[v0] Mapped CRM payload:", crmPayload)

    // Simular llamada al CRM (reemplazar con CRM real)
    const mockCRMResponse = {
      ok: true,
      status: 200,
      text: JSON.stringify({ id: `crm_${Date.now()}`, success: true }),
    }

    // Si hay CRM_BASE_URL configurado, hacer llamada real
    let res = mockCRMResponse
    if (process.env.CRM_BASE_URL && process.env.CRM_API_KEY) {
      try {
        const realRes = await fetch(`${process.env.CRM_BASE_URL}/contacts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CRM_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idemp ?? "",
          },
          body: JSON.stringify(crmPayload),
        })
        const text = await realRes.text()
        res = { ok: realRes.ok, status: realRes.status, text }
      } catch (error) {
        console.error("[v0] CRM API call failed:", error)
        res = { ok: false, status: 500, text: "CRM API call failed" }
      }
    }

    // Log en Firestore
    const logRef = adb.collection("integration_logs").doc()
    await logRef.set({
      type: "crm_sync",
      orderId: orderId ?? null,
      status: res.status,
      ok: res.ok,
      request: crmPayload,
      response: res.text?.slice(0, 5000),
      at: new Date().toISOString(),
    })

    // Marcar estado en el pedido (si tenemos id)
    if (orderId) {
      await adb.doc(`orders/${orderId}`).set(
        {
          crmStatus: res.ok ? "synced" : "error",
          crmError: res.ok ? null : res.text,
          crmAt: Date.now(),
        },
        { merge: true },
      )
    }

    console.log("[v0] CRM sync completed:", { ok: res.ok, status: res.status })

    if (!res.ok) return NextResponse.json({ ok: false, error: res.text }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] CRM API error:", e)
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 })
  }
}
