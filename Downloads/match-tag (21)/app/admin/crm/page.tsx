"use client"
import { useEffect, useState } from "react"

export default function CRMPage() {
  const [barId, setBarId] = useState("4svN1VAEPQa8ukZpd2bz") // Default bar ID
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRows = async () => {
    if (!barId) return
    setLoading(true)
    const qs = new URLSearchParams({ barId, ...(from ? { from } : {}), ...(to ? { to } : {}), limit: "200" })
    const res = await fetch(`/api/contacts/list?${qs.toString()}`)
    const j = await res.json()
    setRows(j.ok ? j.rows : [])
    setLoading(false)
  }

  useEffect(() => {
    if (barId) fetchRows()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">CRM (agnóstico)</h1>
      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="border p-2 rounded"
          placeholder="barId"
          value={barId}
          onChange={(e) => setBarId(e.target.value)}
        />
        <input className="border p-2 rounded" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="border p-2 rounded" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={fetchRows} className="border px-3 py-2 rounded bg-blue-500 text-white">
            Buscar
          </button>
          <a
            href={`/api/contacts/export?barId=${barId}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}
            className={`border px-3 py-2 rounded bg-green-500 text-white ${!barId ? "pointer-events-none opacity-50" : ""}`}
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {loading && <p>Cargando…</p>}

      <div className="overflow-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="text-left border-b bg-gray-50">
              {["Nombre", "Email", "Teléfono", "Pedidos", "LTV", "Último pedido"].map((h) => (
                <th key={h} className="py-2 px-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{r.name}</td>
                <td className="py-2 px-4">{r.email}</td>
                <td className="py-2 px-4">{r.phone}</td>
                <td className="py-2 px-4">{r.ordersCount ?? 0}</td>
                <td className="py-2 px-4">${r.lifetimeValue ?? 0}</td>
                <td className="py-2 px-4">{r.lastOrderAt?.toDate?.()?.toLocaleString?.() ?? ""}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-gray-500 text-center">
                  Sin datos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
