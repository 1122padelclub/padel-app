"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseExtras"
import type { Table } from "@/src/types"

export function useTables(barId: string) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setLoading(false)
      return
    }

    console.log("🪑 Cargando mesas para barId:", barId)
    setLoading(true)

    const tablesRef = collection(db, "tables")
    const q = query(tablesRef, where("barId", "==", barId), orderBy("number", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tablesData: Table[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        tablesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Table)
      })
      
      console.log("🪑 Mesas cargadas:", tablesData.length)
      setTables(tablesData)
      setLoading(false)
      setError(null)
    }, (err) => {
      console.error("❌ Error cargando mesas:", err)
      setError(err.message || "Error desconocido al cargar mesas")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [barId])

  return { tables, loading, error }
}
