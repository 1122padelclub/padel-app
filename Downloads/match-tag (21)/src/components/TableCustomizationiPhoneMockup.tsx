"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, RefreshCw } from "lucide-react"
import { useT } from "@/src/hooks/useTranslation"
import { Button } from "@/components/ui/button"
import { useTables } from "@/src/hooks/useTables"
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface TableCustomizationiPhoneMockupProps {
  barId: string
  themeConfig?: any
}

export function TableCustomizationiPhoneMockup({ barId, themeConfig }: TableCustomizationiPhoneMockupProps) {
  const t = useT()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [testTableCreated, setTestTableCreated] = useState(false)
  
  const { tables } = useTables(barId)
  const previewUrl = `/table-preview/${barId}?theme=${refreshKey}`

  // Crear mesa de prueba si no existe
  useEffect(() => {
    const createTestTable = async () => {
      if (!barId || testTableCreated) return
      
      try {
        const tablesRef = collection(db, "bars", barId, "tables")
        const testTableQuery = query(tablesRef, where("isTestTable", "==", true))
        const testTableSnapshot = await getDocs(testTableQuery)
        
        if (testTableSnapshot.empty) {
          await addDoc(tablesRef, {
            barId,
            number: "PRUEBA",
            qrCode: `table-${barId}-PRUEBA`,
            isActive: true,
            isTestTable: true,
            createdAt: serverTimestamp(),
          })
        }
        setTestTableCreated(true)
      } catch (error) {
        console.error("Error creando mesa de prueba:", error)
      }
    }

    createTestTable()
  }, [barId, testTableCreated])

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t("tableCustomization.realTimePreview")}
          </CardTitle>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* iPhone Frame */}
          <div className="mx-auto w-80 h-[600px] bg-gray-800 rounded-[3rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
              
              {/* Screen */}
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                      <p className="text-white text-sm">Cargando vista previa...</p>
                    </div>
                  </div>
                )}
                
                <iframe
                  key={refreshKey}
                  src={previewUrl}
                  className="w-full h-full border-0 rounded-[2.5rem]"
                  onLoad={handleIframeLoad}
                  title="Vista previa de mesa"
                />
              </div>
              
              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Esta es una vista previa de cómo se verá la mesa de prueba con la personalización actual.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Los cambios se aplican automáticamente al guardar.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
