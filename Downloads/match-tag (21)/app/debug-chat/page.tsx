"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useHybridChat } from "@/src/hooks/useHybridChat"
import { useRobustTables } from "@/src/hooks/useRobustTables"

function DebugChatContent() {
  const searchParams = useSearchParams()
  const barId = searchParams.get("barId") || "0ArbQBMQTLVAM4WT6xfA"
  const tableId = searchParams.get("tableId") || "test-table-1"

  const { 
    availableTables, 
    activeChats, 
    startChatWithTable, 
    isUsingLocal, 
    firebaseError,
    debugInfo 
  } = useHybridChat(tableId, barId)

  const { tables: robustTables, loading: robustLoading } = useRobustTables(barId)

  const testConnect = async (targetTable: any) => {
    console.log("🧪 Probando conexión con mesa:", targetTable)
    try {
      const result = await startChatWithTable(targetTable)
      console.log("🧪 Resultado de conexión:", result)
      if (result) {
        alert(`✅ Chat iniciado exitosamente con ID: ${result}`)
      } else {
        alert("❌ No se pudo iniciar el chat")
      }
    } catch (error) {
      console.error("🧪 Error en prueba de conexión:", error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Debug de Chat</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Bar ID</h4>
                <p className="text-sm text-gray-600">{barId}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Table ID</h4>
                <p className="text-sm text-gray-600">{tableId}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Modo</h4>
                <p className="text-sm text-gray-600">
                  {isUsingLocal ? "🏠 Local" : "🔥 Firebase"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Error Firebase</h4>
                <p className="text-sm text-gray-600">{firebaseError || "Ninguno"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesas Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Total: {availableTables?.length || 0}</h4>
                {availableTables && availableTables.length > 0 ? (
                  <div className="space-y-2">
                    {availableTables.map((table, index) => (
                      <div key={table.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        <div>
                          <p className="text-sm font-medium">Mesa {table.number}</p>
                          <p className="text-xs text-gray-500">ID: {table.id}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => testConnect(table)}
                        >
                          Probar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay mesas disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chats Activos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Total: {activeChats?.length || 0}</h4>
                {activeChats && activeChats.length > 0 ? (
                  <div className="space-y-2">
                    {activeChats.map((chat, index) => (
                      <div key={chat.id} className="p-2 bg-gray-100 rounded">
                        <p className="text-sm font-medium">Chat {index + 1}</p>
                        <p className="text-xs text-gray-500">ID: {chat.id}</p>
                        <p className="text-xs text-gray-500">Mesas: {chat.tableNumbers?.join(", ") || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay chats activos</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesas Robustas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Loading: {robustLoading ? "Sí" : "No"}</h4>
                <h4 className="font-medium mb-2">Total: {robustTables?.length || 0}</h4>
                {robustTables && robustTables.length > 0 ? (
                  <div className="space-y-2">
                    {robustTables.map((table, index) => (
                      <div key={table.id} className="p-2 bg-gray-100 rounded">
                        <p className="text-sm font-medium">Mesa {table.number}</p>
                        <p className="text-xs text-gray-500">ID: {table.id}</p>
                        <p className="text-xs text-gray-500">Bar: {table.barId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay mesas robustas</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DebugChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando debug de chat...</p>
        </div>
      </div>
    }>
      <DebugChatContent />
    </Suspense>
  )
}







