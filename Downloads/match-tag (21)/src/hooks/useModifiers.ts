"use client"

import { useState, useEffect } from "react"
import { collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/src/services/firebaseConfig"
import type { ModifierGroup, Modifier } from "@/src/types/menu"

export function useModifiers(barId?: string) {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barId) {
      setIsLoading(false)
      return
    }

    const modifierGroupsQuery = query(collection(db, `bars/${barId}/modifierGroups`), orderBy("name", "asc"))

    const unsubscribe = onSnapshot(
      modifierGroupsQuery,
      (snapshot) => {
        const groupsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ModifierGroup[]

        setModifierGroups(groupsList)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Error loading modifier groups:", err)
        setError(err.message)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [barId])

  const createModifierGroup = async (groupData: Omit<ModifierGroup, "id" | "barId" | "createdAt" | "updatedAt">) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const newGroup = {
        ...groupData,
        barId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, `bars/${barId}/modifierGroups`), newGroup)
      return docRef.id
    } catch (err) {
      console.error("Error creating modifier group:", err)
      throw err
    }
  }

  const updateModifierGroup = async (groupId: string, updates: Partial<ModifierGroup>) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      const groupRef = doc(db, `bars/${barId}/modifierGroups/${groupId}`)
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error updating modifier group:", err)
      throw err
    }
  }

  const deleteModifierGroup = async (groupId: string) => {
    if (!barId) throw new Error("Bar ID is required")

    try {
      await deleteDoc(doc(db, `bars/${barId}/modifierGroups/${groupId}`))
    } catch (err) {
      console.error("Error deleting modifier group:", err)
      throw err
    }
  }

  const addModifierToGroup = async (groupId: string, modifier: Omit<Modifier, "id" | "createdAt" | "updatedAt">) => {
    const group = modifierGroups.find((g) => g.id === groupId)
    if (!group) throw new Error("Modifier group not found")

    const newModifier: Modifier = {
      ...modifier,
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedModifiers = [...group.modifiers, newModifier]
    await updateModifierGroup(groupId, { modifiers: updatedModifiers })
  }

  const updateModifierInGroup = async (groupId: string, modifierId: string, updates: Partial<Modifier>) => {
    const group = modifierGroups.find((g) => g.id === groupId)
    if (!group) throw new Error("Modifier group not found")

    const updatedModifiers = group.modifiers.map((mod) =>
      mod.id === modifierId ? { ...mod, ...updates, updatedAt: new Date().toISOString() } : mod,
    )

    await updateModifierGroup(groupId, { modifiers: updatedModifiers })
  }

  const removeModifierFromGroup = async (groupId: string, modifierId: string) => {
    const group = modifierGroups.find((g) => g.id === groupId)
    if (!group) throw new Error("Modifier group not found")

    const updatedModifiers = group.modifiers.filter((mod) => mod.id !== modifierId)
    await updateModifierGroup(groupId, { modifiers: updatedModifiers })
  }

  const getModifierGroupsByIds = (groupIds: string[]) => {
    return modifierGroups.filter((group) => groupIds.includes(group.id))
  }

  return {
    modifierGroups,
    isLoading,
    error,
    createModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
    addModifierToGroup,
    updateModifierInGroup,
    removeModifierFromGroup,
    getModifierGroupsByIds,
  }
}
