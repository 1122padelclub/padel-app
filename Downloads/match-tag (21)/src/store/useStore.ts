import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface User {
  uid: string
  email?: string
  role: "super_admin" | "bar_admin" | "guest"
  barId?: string
}

interface Bar {
  id: string
  name: string
  address: string
  adminIds: string[]
}

interface Table {
  id: string
  barId: string
  number: number
  isActive: boolean
}

interface AppState {
  user: User | null
  currentBar: Bar | null
  currentTable: Table | null
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setCurrentBar: (bar: Bar | null) => void
  setCurrentTable: (table: Table | null) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      user: null,
      currentBar: null,
      currentTable: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setCurrentBar: (bar) => set({ currentBar: bar }),
      setCurrentTable: (table) => set({ currentTable: table }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "match-tag-store",
    },
  ),
)
