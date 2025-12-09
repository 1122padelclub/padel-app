"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminTables } from "@/src/hooks/useAdminTables"
import { normalizeTableData } from "@/src/utils/tableNormalizer"

function DebugAdminTablesContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId") || "0ArbQBMQTLVAM4WT6xfA"
  
  const { tables: adminTables, loading, error, createTable } = useAdminTables(barId)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testTableNumber, setTestTableNumber] = useState("3")

  useEffect(() => {
    const info = {
      barId,
      adminTablesCount: adminTables?.length || 0,
      adminTables: adminTables,
      loading,
      error,
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(info)
    console.log("🔍 Debug info:", info)
  }, [barId, adminTables, loading, error])

  const testNormalization = (table: any) => {
    const normalized = normalizeTableData(table, barId)
    console.log("🔍 Original table:", table)
    console.log("✅ Normalized table:", normalized)
    return normalized
  }

  const testCreateTable = async () => {
    const number = parseInt(testTableNumber)
    if (isNaN(number)) {
      alert("Número inválido")
      return
    }
    
    console.log("🧪 Creando mesa de prueba:", { number, barId })
    const success = await createTable(number, "test123")
    console.log("Resultado:", success ? "✅ Éxito" : "❌ Falló")
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Mesas del Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información General */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            <div className="space-y-2">
              <p><strong>Bar ID:</strong> {barId}</p>
              <p><strong>Loading:</strong> {loading ? "Sí" : "No"}</p>
              <p><strong>Error:</strong> {error || "Ninguno"}</p>
              <p><strong>Mesas encontradas:</strong> {adminTables?.length || 0}</p>
            </div>
          </div>

          {/* Crear Mesa de Prueba */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Crear Mesa de Prueba</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número de Mesa</label>
                <input
                  type="number"
                  value={testTableNumber}
                  onChange={(e) => setTestTableNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
              <button
                onClick={testCreateTable}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Crear Mesa de Prueba
              </button>
            </div>
          </div>

          {/* Mesas del Admin */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Mesas del Admin</h2>
            {loading ? (
              <p>Cargando mesas...</p>
            ) : adminTables && adminTables.length > 0 ? (
              <div className="space-y-4">
                {adminTables.map((table, index) => (
                  <div key={table.id} className="border p-4 rounded">
                    <h3 className="font-medium">Mesa {index + 1}</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>ID:</strong> {table.id} (tipo: {typeof table.id})</p>
                      <p><strong>Número:</strong> {table.number} (tipo: {typeof table.number})</p>
                      <p><strong>Bar ID:</strong> {table.barId}</p>
                      <p><strong>Activa:</strong> {table.isActive ? "Sí" : "No"}</p>
                      <p><strong>Capacidad:</strong> {table.capacity}</p>
                      <p><strong>Estado:</strong> {table.status}</p>
                    </div>
                    <button
                      onClick={() => testNormalization(table)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Probar Normalización
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se encontraron mesas del admin</p>
            )}
          </div>

          {/* Datos Raw */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Datos Raw (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DebugAdminTablesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Cargando...</p>
      </div>
    </div>}>
      <DebugAdminTablesContent />
    </Suspense>
  )
}











