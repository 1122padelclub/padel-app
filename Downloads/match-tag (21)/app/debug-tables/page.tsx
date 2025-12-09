"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAdminTables } from "@/src/hooks/useAdminTables"
import { normalizeTableData } from "@/src/utils/tableNormalizer"

function DebugTablesContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId") || "eaZ5EqywbJYAjiZVLmjV"
  const tableId = searchParams.get("tableId") || "test-table"
  
  const { tables: adminTables, loading, error } = useAdminTables(barId)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      barId,
      tableId,
      adminTablesCount: adminTables?.length || 0,
      adminTables: adminTables,
      loading,
      error,
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(info)
    console.log("Debug info:", info)
  }, [barId, tableId, adminTables, loading, error])

  const testNormalization = (table: any) => {
    const normalized = normalizeTableData(table, barId)
    console.log("Original table:", table)
    console.log("Normalized table:", normalized)
    return normalized
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
              <p><strong>Table ID:</strong> {tableId}</p>
              <p><strong>Loading:</strong> {loading ? "Sí" : "No"}</p>
              <p><strong>Error:</strong> {error || "Ninguno"}</p>
              <p><strong>Mesas encontradas:</strong> {adminTables?.length || 0}</p>
            </div>
          </div>

          {/* Mesas del Admin */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mesas del Admin</h2>
            {loading ? (
              <p>Cargando mesas...</p>
            ) : adminTables && adminTables.length > 0 ? (
              <div className="space-y-4">
                {adminTables.map((table, index) => (
                  <div key={table.id} className="border p-4 rounded">
                    <h3 className="font-medium">Mesa {index + 1}</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>ID:</strong> {table.id}</p>
                      <p><strong>Número:</strong> {table.number}</p>
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

          {/* Instrucciones */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded md:col-span-2">
            <h3 className="font-bold">Instrucciones:</h3>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Verifica que el Bar ID sea correcto</li>
              <li>Revisa si hay mesas en la base de datos</li>
              <li>Prueba la normalización de cada mesa</li>
              <li>Verifica la consola del navegador para más detalles</li>
            </ol>
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

export default function DebugTablesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Cargando...</p>
      </div>
    </div>}>
      <DebugTablesContent />
    </Suspense>
  )
}
