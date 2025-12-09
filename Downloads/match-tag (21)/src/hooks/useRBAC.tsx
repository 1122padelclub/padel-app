"use client"

import { useState, useEffect, useContext, createContext, type ReactNode } from "react"
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
  orderBy,
} from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { Role, User, Permission, SecurityLog, UserSession } from "@/src/types/rbac"

interface RBACContextType {
  currentUser: User | null
  userRole: Role | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  isLoading: boolean
}

const RBACContext = createContext<RBACContextType | null>(null)

export function RBACProvider({
  children,
  userId,
  barId,
}: {
  children: ReactNode
  userId: string
  barId: string
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId || !barId) {
      setIsLoading(false)
      return
    }

    // Escuchar cambios en el usuario
    const userQuery = query(collection(db, `bars/${barId}/users`), where("id", "==", userId))

    const unsubscribeUser = onSnapshot(userQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data() as User
        setCurrentUser(userData)

        // Obtener el rol del usuario
        if (userData.roleId) {
          const roleDoc = await getDocs(
            query(collection(db, `bars/${barId}/roles`), where("id", "==", userData.roleId)),
          )
          if (!roleDoc.empty) {
            setUserRole(roleDoc.docs[0].data() as Role)
          }
        }
      }
      setIsLoading(false)
    })

    return () => unsubscribeUser()
  }, [userId, barId])

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false
    return userRole.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole) return false
    return permissions.some((permission) => userRole.permissions.includes(permission))
  }

  return (
    <RBACContext.Provider
      value={{
        currentUser,
        userRole,
        hasPermission,
        hasAnyPermission,
        isLoading,
      }}
    >
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error("useRBAC must be used within RBACProvider")
  }
  return context
}

export function useUserManagement(barId: string) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!barId) return

    // Escuchar usuarios
    const usersQuery = query(collection(db, `bars/${barId}/users`), orderBy("createdAt", "desc"))
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[]
      setUsers(usersList)
    })

    // Escuchar roles
    const rolesQuery = query(collection(db, `bars/${barId}/roles`), orderBy("name"))
    const unsubscribeRoles = onSnapshot(rolesQuery, (snapshot) => {
      const rolesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Role[]
      setRoles(rolesList)
    })

    // Escuchar sesiones activas
    const sessionsQuery = query(
      collection(db, `bars/${barId}/sessions`),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    )
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserSession[]
      setSessions(sessionsList)
    })

    // Escuchar logs de seguridad (últimos 100)
    const logsQuery = query(collection(db, `bars/${barId}/security_logs`), orderBy("timestamp", "desc"))
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsList = snapshot.docs.slice(0, 100).map((doc) => ({ id: doc.id, ...doc.data() })) as SecurityLog[]
      setSecurityLogs(logsList)
      setIsLoading(false)
    })

    return () => {
      unsubscribeUsers()
      unsubscribeRoles()
      unsubscribeSessions()
      unsubscribeLogs()
    }
  }, [barId])

  const createUser = async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addDoc(collection(db, `bars/${barId}/users`), newUser)

      // Log de seguridad
      await logSecurityEvent({
        action: "admin_action",
        resource: "user",
        details: { action: "create_user", targetUser: userData.email },
        severity: "medium",
      })

      return true
    } catch (error) {
      console.error("Error creating user:", error)
      return false
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const userRef = doc(db, `bars/${barId}/users/${userId}`)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      // Log de seguridad
      await logSecurityEvent({
        action: "admin_action",
        resource: "user",
        details: { action: "update_user", targetUserId: userId, changes: Object.keys(updates) },
        severity: "medium",
      })

      return true
    } catch (error) {
      console.error("Error updating user:", error)
      return false
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `bars/${barId}/users/${userId}`))

      // Log de seguridad
      await logSecurityEvent({
        action: "admin_action",
        resource: "user",
        details: { action: "delete_user", targetUserId: userId },
        severity: "high",
      })

      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  const createRole = async (roleData: Omit<Role, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newRole = {
        ...roleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addDoc(collection(db, `bars/${barId}/roles`), newRole)
      return true
    } catch (error) {
      console.error("Error creating role:", error)
      return false
    }
  }

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      const roleRef = doc(db, `bars/${barId}/roles/${roleId}`)
      await updateDoc(roleRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      // Log de seguridad
      await logSecurityEvent({
        action: "permission_grant",
        resource: "role",
        details: { action: "update_role", roleId, changes: Object.keys(updates) },
        severity: "high",
      })

      return true
    } catch (error) {
      console.error("Error updating role:", error)
      return false
    }
  }

  const revokeUserSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, `bars/${barId}/sessions/${sessionId}`)
      await updateDoc(sessionRef, {
        isActive: false,
        revokedAt: new Date().toISOString(),
      })

      // Log de seguridad
      await logSecurityEvent({
        action: "admin_action",
        resource: "session",
        details: { action: "revoke_session", sessionId },
        severity: "medium",
      })

      return true
    } catch (error) {
      console.error("Error revoking session:", error)
      return false
    }
  }

  const logSecurityEvent = async (eventData: Omit<SecurityLog, "id" | "timestamp" | "ipAddress" | "userAgent">) => {
    try {
      const securityLog = {
        ...eventData,
        timestamp: new Date().toISOString(),
        ipAddress: "unknown", // En producción se obtendría del request
        userAgent: navigator.userAgent,
      }

      await addDoc(collection(db, `bars/${barId}/security_logs`), securityLog)
    } catch (error) {
      console.error("Error logging security event:", error)
    }
  }

  return {
    users,
    roles,
    sessions,
    securityLogs,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    revokeUserSession,
    logSecurityEvent,
  }
}
