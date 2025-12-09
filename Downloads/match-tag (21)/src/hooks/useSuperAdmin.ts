"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  setDoc,
} from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/src/services/firebaseExtras"
import type { Bar, User } from "@/src/types"

export function useSuperAdmin() {
  const [bars, setBars] = useState<Bar[]>([])
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bars
        const barsRef = collection(db, "bars")
        const barsSnapshot = await getDocs(barsRef)
        const fetchedBars: Bar[] = []
        barsSnapshot.forEach((doc) => {
          fetchedBars.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Bar)
        })

        // Fetch bar admins
        const usersRef = collection(db, "users")
        const adminsQuery = query(usersRef, where("role", "==", "bar_admin"))
        const adminsSnapshot = await getDocs(adminsQuery)
        const fetchedAdmins: User[] = []
        adminsSnapshot.forEach((doc) => {
          fetchedAdmins.push({
            uid: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as User)
        })

        setBars(fetchedBars)
        setAdmins(fetchedAdmins)
      } catch (error) {
        console.error("Error fetching super admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const createBar = async (name: string, address: string) => {
    try {
      const barsRef = collection(db, "bars")
      const newBar = {
        name,
        address,
        adminIds: [],
        isActive: true,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(barsRef, newBar)
      const barId = docRef.id
      
      // Crear mesa de prueba automáticamente
      try {
        const tablesRef = collection(db, "bars", barId, "tables")
        await addDoc(tablesRef, {
          barId,
          number: "PRUEBA",
          qrCode: `table-${barId}-PRUEBA`,
          isActive: true,
          isTestTable: true, // Marcar como mesa de prueba
          createdAt: serverTimestamp(),
        })
        console.log("✅ Mesa de prueba creada para el bar:", barId)
      } catch (tableError) {
        console.error("⚠️ Error creando mesa de prueba:", tableError)
        // No fallar la creación del bar si no se puede crear la mesa de prueba
      }

      const createdBar: Bar = {
        id: barId,
        name,
        address,
        adminIds: [],
        isActive: true,
        createdAt: new Date(),
      }

      setBars([...bars, createdBar])
      return { success: true, barId }
    } catch (error) {
      console.error("Error creating bar:", error)
      return { success: false, error: "Error al crear el bar" }
    }
  }

  const updateBar = async (barId: string, updates: Partial<Bar>) => {
    try {
      const barRef = doc(db, "bars", barId)
      await updateDoc(barRef, updates)

      setBars(bars.map((bar) => (bar.id === barId ? { ...bar, ...updates } : bar)))
      return { success: true }
    } catch (error) {
      console.error("Error updating bar:", error)
      return { success: false, error: "Error al actualizar el bar" }
    }
  }

  const deleteBar = async (barId: string) => {
    try {
      await deleteDoc(doc(db, "bars", barId))
      setBars(bars.filter((bar) => bar.id !== barId))
      return { success: true }
    } catch (error) {
      console.error("Error deleting bar:", error)
      return { success: false, error: "Error al eliminar el bar" }
    }
  }

  const createBarAdmin = async (email: string, password: string, barId?: string) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user document in Firestore
      const userData: User = {
        uid: user.uid,
        email: user.email || undefined,
        role: "bar_admin",
        barId,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", user.uid), userData)

      // If barId is provided, add admin to bar
      if (barId) {
        const bar = bars.find((b) => b.id === barId)
        if (bar) {
          const updatedAdminIds = [...bar.adminIds, user.uid]
          await updateBar(barId, { adminIds: updatedAdminIds })
        }
      }

      setAdmins([...admins, userData])
      return { success: true, adminId: user.uid }
    } catch (error: any) {
      console.error("Error creating bar admin:", error)

      let errorMessage = "Error al crear administrador"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado. Usa un email diferente."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del email no es válido."
      } else if (error.code === "permission-denied") {
        errorMessage = "No tienes permisos para crear administradores."
      }

      return { success: false, error: errorMessage }
    }
  }

  const assignAdminToBar = async (adminId: string, barId: string) => {
    try {
      // Update user's barId
      const userRef = doc(db, "users", adminId)
      await updateDoc(userRef, { barId })

      // Update bar's adminIds
      const bar = bars.find((b) => b.id === barId)
      if (bar && !bar.adminIds.includes(adminId)) {
        const updatedAdminIds = [...bar.adminIds, adminId]
        await updateBar(barId, { adminIds: updatedAdminIds })
      }

      // Update local state
      setAdmins(admins.map((admin) => (admin.uid === adminId ? { ...admin, barId } : admin)))

      return { success: true }
    } catch (error) {
      console.error("Error assigning admin to bar:", error)
      return { success: false, error: "Error al asignar administrador" }
    }
  }

  const removeAdminFromBar = async (adminId: string, barId: string) => {
    try {
      // Update user's barId
      const userRef = doc(db, "users", adminId)
      await updateDoc(userRef, { barId: null })

      // Update bar's adminIds
      const bar = bars.find((b) => b.id === barId)
      if (bar) {
        const updatedAdminIds = bar.adminIds.filter((id) => id !== adminId)
        await updateBar(barId, { adminIds: updatedAdminIds })
      }

      // Update local state
      setAdmins(admins.map((admin) => (admin.uid === adminId ? { ...admin, barId: null } : admin)))

      return { success: true }
    } catch (error) {
      console.error("Error removing admin from bar:", error)
      return { success: false, error: "Error al remover administrador" }
    }
  }

  return {
    bars,
    admins,
    loading,
    createBar,
    updateBar,
    deleteBar,
    createBarAdmin,
    assignAdminToBar,
    removeAdminFromBar,
  }
}
