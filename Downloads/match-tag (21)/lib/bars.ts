import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { Bar } from "@/src/types"

/**
 * Obtiene todos los bares asociados a un usuario
 */
export async function getUserBars(userId: string): Promise<Bar[]> {
  try {
    if (!userId) {
      return []
    }

    // Query bars where the user is an admin
    const barsRef = collection(db, "bars")
    const q = query(barsRef, where("adminIds", "array-contains", userId))
    const snapshot = await getDocs(q)

    const bars: Bar[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      bars.push({
        id: doc.id,
        name: data.name,
        address: data.address,
        adminIds: data.adminIds || [],
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
      })
    })

    // Sort bars by name for consistent ordering
    return bars.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("Error fetching user bars:", error)
    throw new Error("Error al obtener los bares del usuario")
  }
}

/**
 * Verifica si un usuario es administrador de un bar específico
 */
export async function isUserBarAdmin(userId: string, barId: string): Promise<boolean> {
  try {
    const userBars = await getUserBars(userId)
    return userBars.some((bar) => bar.id === barId)
  } catch (error) {
    console.error("Error checking bar admin status:", error)
    return false
  }
}

/**
 * Obtiene un bar específico si el usuario es administrador
 */
export async function getUserBar(userId: string, barId: string): Promise<Bar | null> {
  try {
    const userBars = await getUserBars(userId)
    return userBars.find((bar) => bar.id === barId) || null
  } catch (error) {
    console.error("Error fetching user bar:", error)
    return null
  }
}
