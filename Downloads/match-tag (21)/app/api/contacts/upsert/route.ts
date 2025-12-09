import { NextResponse } from "next/server"
import { adb } from "@/lib/admin"
import { FieldValue } from "firebase-admin/firestore"
import crypto from "crypto"

export const runtime = "nodejs"

const cleanEmail = (s?: string) => (s ?? "").trim().toLowerCase()
function cleanPhone(s?: string) {
  if (!s) return ""
  const digits = s.replace(/\D/g, "")
  const withCc = digits.startsWith("57") ? digits : `57${digits}` // ajusta si necesitas otro país
  return `+${withCc}`
}
function contactId(barId: string, email?: string, phone?: string) {
  const key = `${barId}|${cleanEmail(email)}|${cleanPhone(phone)}`
  return crypto.createHash("sha1").update(key).digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, payload } = body

    // Cargar pedido si solo llega orderId
    let order = payload
    if (!order && orderId) {
      const direct = await adb.doc(`orders/${orderId}`).get()
      if (direct.exists) order = direct.data()
      if (!order) {
        const q = await adb.collectionGroup("orders").where("id", "==", orderId).limit(1).get()
        if (!q.empty) order = q.docs[0].data()
      }
    }
    if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })

    const barId = order.barId
    const email = cleanEmail(order?.customer?.email)
    const phone = cleanPhone(order?.customer?.phone)
    const name = order?.customer?.name ?? "Cliente"

    if (!barId) return NextResponse.json({ ok: false, error: "barId required" }, { status: 400 })
    if (!email && !phone) return NextResponse.json({ ok: false, error: "email or phone required" }, { status: 400 })

    const id = contactId(barId, email, phone)
    const ref = adb.doc(`bars/${barId}/crm_contacts/${id}`)
    const total = Number(order?.total ?? 0)

    await adb.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (!snap.exists) {
        tx.set(ref, {
          name,
          email,
          phone,
          barId,
          tableId: order?.tableId ?? null,
          source: "order",
          ordersCount: 1,
          lifetimeValue: total,
          firstSeenAt: FieldValue.serverTimestamp(),
          lastOrderAt: FieldValue.serverTimestamp(),
        })
      } else {
        tx.update(ref, {
          name,
          email,
          phone,
          tableId: order?.tableId ?? null,
          ordersCount: FieldValue.increment(1),
          lifetimeValue: FieldValue.increment(total),
          lastOrderAt: FieldValue.serverTimestamp(),
        })
      }
    })

    if (orderId) {
      const ordRef = adb.doc(`orders/${orderId}`)
      const ord = await ordRef.get()
      if (ord.exists) await ordRef.set({ crmStatus: "stored", crmAt: Date.now() }, { merge: true })
    }

    return NextResponse.json({ ok: true, contactId: id })
  } catch (e: any) {
    console.log("[v0] Error in contacts/upsert:", e.message)
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 })
  }
}
