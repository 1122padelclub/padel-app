"use client"

import { useEffect, useState } from "react"
import { testFirebaseConnection, createTestData } from "@/src/utils/firebaseTest"

export default function TestFirebaseRealtimePage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}
    
    try {
      // Test 1: Conexión básica
      console.log("Probando conexión a Firebase Realtime Database...")
      results.connection = await testFirebaseConnection()
      
      // Test 2: Crear datos de prueba
      if (results.connection) {
        console.log("Creando datos de prueba...")
        results.testData = await createTestData("test-bar", "test-table")
      }
      
      setTestResults(results)
    } catch (error) {
      console.error("Error en tests:", error)
      results.error = error.message
      setTestResults(results)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Firebase Realtime Database</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests de Conexión</h2>
          <button 
            onClick={runTests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            {loading ? "Ejecutando..." : "Ejecutar Tests"}
          </button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Resultados:</h3>
              <ul className="space-y-2">
                {Object.entries(testResults).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className={value === true ? "text-green-600" : value === false ? "text-red-600" : "text-gray-600"}>
                      {typeof value === 'boolean' ? (value ? "✅ Exitoso" : "❌ Falló") : value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Si los tests fallan:</h3>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
            <li>Selecciona el proyecto: <strong>match-tag-v0</strong></li>
            <li>Ve a <strong>Realtime Database</strong> → <strong>Rules</strong></li>
            <li>Reemplaza las reglas con:</li>
          </ol>
          <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-sm overflow-x-auto">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
          </pre>
          <p className="mt-2">5. Haz clic en <strong>"Publish"</strong></p>
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











