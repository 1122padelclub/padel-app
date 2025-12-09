"use client"

import { useEffect, useState } from "react"
import { 
  getFirebaseAuth, 
  isFirebaseReady, 
  reinitializeFirebase,
  app,
  db,
  auth,
  realtimeDb 
} from "@/lib/firebase"

export default function TestFirebasePage() {
  const [config, setConfig] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    const checkConfig = () => {
      try {
        const authInstance = getFirebaseAuth()
        setConfig({
          hasAuth: !!authInstance,
          hasApp: !!app,
          hasDB: !!db,
          hasRealtimeDB: !!realtimeDb,
          isReady: isFirebaseReady(),
          firebaseConfig: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Configurado" : "❌ Faltante",
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Configurado" : "❌ Faltante",
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Configurado" : "❌ Faltante",
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Configurado" : "❌ Faltante",
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ Configurado" : "❌ Faltante",
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Configurado" : "❌ Faltante",
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "✅ Configurado" : "❌ Faltante",
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "✅ Configurado" : "❌ Faltante",
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      }
    }

    checkConfig()
  }, [])

  const runTests = async () => {
    const results: any = {}
    
    try {
      // Test 1: Auth instance
      results.authTest = !!auth
      
      // Test 2: Firestore
      if (db) {
        results.firestoreTest = "✅ Disponible"
      } else {
        results.firestoreTest = "❌ No disponible"
      }
      
      // Test 3: Realtime DB
      if (realtimeDb) {
        results.realtimeTest = "✅ Disponible"
      } else {
        results.realtimeTest = "❌ No disponible"
      }
      
      // Test 4: App
      if (app) {
        results.appTest = "✅ Disponible"
      } else {
        results.appTest = "❌ No disponible"
      }
      
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en tests")
    }
  }

  const handleReinitialize = () => {
    try {
      const success = reinitializeFirebase()
      if (success) {
        setError(null)
        window.location.reload()
      } else {
        setError("Error al reinicializar Firebase")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reinicializar")
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Configuración Firebase</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {config && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Estado de la Configuración</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><strong>Auth Instance:</strong> {config.hasAuth ? "✅ Disponible" : "❌ No disponible"}</div>
              <div><strong>App:</strong> {config.hasApp ? "✅ Disponible" : "❌ No disponible"}</div>
              <div><strong>Firestore:</strong> {config.hasDB ? "✅ Disponible" : "❌ No disponible"}</div>
              <div><strong>Realtime DB:</strong> {config.hasRealtimeDB ? "✅ Disponible" : "❌ No disponible"}</div>
              <div><strong>Firebase Ready:</strong> {config.isReady ? "✅ Listo" : "❌ No listo"}</div>
            </div>

            <h3 className="text-lg font-medium mb-2">Variables de Entorno:</h3>
            <ul className="space-y-2">
              {Object.entries(config.firebaseConfig).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="font-mono">{key}:</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests de Firebase</h2>
          <div className="space-y-4">
            <button 
              onClick={runTests}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Ejecutar Tests
            </button>
            <button 
              onClick={handleReinitialize}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Reinicializar Firebase
            </button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Resultados de Tests:</h3>
              <ul className="space-y-2">
                {Object.entries(testResults).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
