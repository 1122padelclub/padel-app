"use client"

// Mock Firebase services for development
export const mockData = {
  bars: {
    test: {
      id: "test",
      name: "Bar de Prueba",
      logo: null,
      customBackgroundColor: null,
      chatsEnabled: true,
    },
  },
  categories: [
    { id: "bebidas", name: "Bebidas", barId: "test", order: 1 },
    { id: "alimentos", name: "Alimentos", barId: "test", order: 2 },
  ],
  items: [
    {
      id: "cerveza-1",
      name: "Cerveza Artesanal",
      description: "Cerveza local premium",
      price: 8500,
      categoryId: "bebidas",
      category: "bebidas",
      barId: "test",
      available: true,
      imageUrl: "/artesanal-beer.png",
      hasPromotion: false,
    },
    {
      id: "hamburguesa-1",
      name: "Hamburguesa Clásica",
      description: "Hamburguesa con carne, lechuga, tomate y queso",
      price: 12000,
      categoryId: "alimentos",
      category: "alimentos",
      barId: "test",
      available: true,
      imageUrl: "/classic-hamburger.png",
      hasPromotion: true,
      promotionDescription: "20% de descuento",
      promotionPrice: 9600,
    },
  ],
  tables: [
    { id: "table1", number: 1, barId: "test", isActive: true, createdAt: new Date() },
    { id: "table2", number: 2, barId: "test", isActive: true, createdAt: new Date() },
    { id: "table3", number: 3, barId: "test", isActive: true, createdAt: new Date() },
  ],
  orders: {},
  chats: {},
  messages: {},
  users: {
    "mock-user-id": {
      uid: "mock-user-id",
      email: "admin@test.com",
      role: "bar_admin",
      barId: "test",
      createdAt: new Date(),
    },
    "mock-anonymous-id": {
      uid: "mock-anonymous-id",
      role: "guest",
      createdAt: new Date(),
    },
  },
}

const mockListeners: { [key: string]: Function[] } = {}

export const mockFirestore = {
  collection: (path: string) => ({
    where: (field: string, operator: string, value: any) => ({
      onSnapshot: (callback: Function) => {
        setTimeout(() => {
          if (path.includes("menuCategories")) {
            const data = mockData.categories.filter((cat) => cat.barId === value)
            callback({ docs: data.map((item) => ({ id: item.id, data: () => item })) })
          } else if (path.includes("menuItems")) {
            const data = mockData.items.filter((item) => item.barId === value)
            callback({ docs: data.map((item) => ({ id: item.id, data: () => item })) })
          } else if (path === "tables") {
            const data = mockData.tables.filter((table) => table.barId === value)
            callback({ docs: data.map((item) => ({ id: item.id, data: () => item })) })
          }
        }, 100)
        return () => {} // unsubscribe function
      },
      getDocs: () => {
        if (path === "tables") {
          const data = mockData.tables.filter((table) => table.barId === value)
          return Promise.resolve({ docs: data.map((item) => ({ id: item.id, data: () => item })) })
        }
        return Promise.resolve({ docs: [] })
      },
    }),
    orderBy: (field: string, direction?: string) => ({
      onSnapshot: (callback: Function) => {
        setTimeout(() => {
          if (path.includes("menuCategories")) {
            callback({ docs: mockData.categories.map((item) => ({ id: item.id, data: () => item })) })
          } else if (path.includes("menuItems")) {
            callback({ docs: mockData.items.map((item) => ({ id: item.id, data: () => item })) })
          }
        }, 100)
        return () => {}
      },
    }),
    doc: (id: string) => ({
      get: () => {
        if (path === "users") {
          return Promise.resolve({
            exists: () => !!mockData.users[id],
            data: () => mockData.users[id] || null,
          })
        }
        return Promise.resolve({
          exists: () => true,
          data: () => mockData.bars[id] || {},
        })
      },
      set: (data: any) => {
        if (path === "users") {
          mockData.users[id] = { ...data, uid: id }
        }
        return Promise.resolve()
      },
      update: (data: any) => {
        if (path === "users" && mockData.users[id]) {
          mockData.users[id] = { ...mockData.users[id], ...data }
        }
        return Promise.resolve()
      },
    }),
    addDoc: (data: any) => {
      const id = `mock-doc-${Date.now()}`
      return Promise.resolve({ id })
    },
  }),
  doc: (collection: string, id: string) => ({
    get: () => {
      if (collection === "users") {
        return Promise.resolve({
          exists: () => !!mockData.users[id],
          data: () => mockData.users[id] || null,
        })
      } else if (collection === "bars") {
        return Promise.resolve({
          exists: () => !!mockData.bars[id],
          data: () => mockData.bars[id] || null,
        })
      }
      return Promise.resolve({
        exists: () => false,
        data: () => null,
      })
    },
    set: (data: any) => {
      if (collection === "users") {
        mockData.users[id] = { ...data, uid: id }
      } else if (collection === "bars") {
        mockData.bars[id] = { ...data, id }
      }
      return Promise.resolve()
    },
    update: (data: any) => {
      if (collection === "users" && mockData.users[id]) {
        mockData.users[id] = { ...mockData.users[id], ...data }
      } else if (collection === "bars" && mockData.bars[id]) {
        mockData.bars[id] = { ...mockData.bars[id], ...data }
      }
      return Promise.resolve()
    },
  }),
  query: () => ({}),
  where: () => ({}),
  orderBy: () => ({}),
  getDocs: () => Promise.resolve({ docs: [] }),
  addDoc: () => Promise.resolve({ id: "mock-doc-id" }),
  serverTimestamp: () => new Date(),
  updateDoc: (docRef: any, data: any) => Promise.resolve(),
  deleteDoc: (docRef: any) => Promise.resolve(),
}

// Mock Realtime Database functions
export const mockDatabase = {
  ref: (path: string) => ({
    on: (event: string, callback: Function) => {
      if (!mockListeners[path]) mockListeners[path] = []
      mockListeners[path].push(callback)

      // Simulate data based on path
      setTimeout(() => {
        if (path.includes("/orders/")) {
          callback({ val: () => mockData.orders })
        } else if (path.includes("/chats/")) {
          callback({ val: () => mockData.chats })
        } else if (path.includes("/messages/")) {
          callback({ val: () => mockData.messages })
        } else {
          callback({ val: () => null })
        }
      }, 100)
    },
    off: (event?: string, callback?: Function) => {
      if (callback && mockListeners[path]) {
        mockListeners[path] = mockListeners[path].filter((cb) => cb !== callback)
      }
    },
    push: (data: any) => {
      const key = `mock-key-${Date.now()}`
      return Promise.resolve({ key })
    },
    set: (data: any) => Promise.resolve(),
    update: (data: any) => Promise.resolve(),
    remove: () => Promise.resolve(),
  }),
  serverTimestamp: () => new Date().toISOString(),
}

export const mockAuth = {
  currentUser: { uid: "mock-user-id", email: "admin@test.com" },
  onAuthStateChanged: (callback: Function) => {
    setTimeout(() => {
      callback({ uid: "mock-user-id", email: "admin@test.com" })
    }, 100)
    return () => {}
  },
  signInWithEmailAndPassword: (email: string, password: string) => {
    // Simular validación básica
    if (email === "admin@test.com" && password === "admin123") {
      return Promise.resolve({ user: { uid: "mock-user-id", email } })
    }
    return Promise.reject(new Error("Invalid credentials"))
  },
  signInAnonymously: () => Promise.resolve({ user: { uid: "mock-anonymous-id" } }),
  signOut: () => {
    mockAuth.currentUser = null
    return Promise.resolve()
  },
  createUserWithEmailAndPassword: (email: string, password: string) => {
    const uid = `mock-user-${Date.now()}`
    return Promise.resolve({ user: { uid, email } })
  },
}

export const onAuthStateChanged = mockAuth.onAuthStateChanged
export const signInWithEmailAndPassword = mockAuth.signInWithEmailAndPassword
export const signInAnonymously = mockAuth.signInAnonymously
export const signOut = mockAuth.signOut
export const createUserWithEmailAndPassword = mockAuth.createUserWithEmailAndPassword
export const collection = mockFirestore.collection
export const doc = mockFirestore.doc
export const getDoc = (docRef: any) => docRef.get()
export const setDoc = (docRef: any, data: any) => docRef.set(data)
export const updateDoc = mockFirestore.updateDoc
export const deleteDoc = mockFirestore.deleteDoc
export const addDoc = mockFirestore.addDoc
export const query = mockFirestore.query
export const where = mockFirestore.where
export const orderBy = mockFirestore.orderBy
export const getDocs = mockFirestore.getDocs
export const onSnapshot = (query: any, callback: Function) => query.onSnapshot(callback)
export const serverTimestamp = mockFirestore.serverTimestamp
export const ref = mockDatabase.ref
export const onValue = (ref: any, callback: Function) => ref.on("value", callback)
export const off = (ref: any, event?: string, callback?: Function) => ref.off(event, callback)
export const push = (ref: any, data?: any) => ref.push(data)
export const set = (ref: any, data: any) => ref.set(data)
export const update = (ref: any, data: any) => ref.update(data)
export const remove = (ref: any) => ref.remove()

// Export mock services
export const db = mockFirestore
export const database = mockDatabase
export const realtimeDb = mockDatabase
export const auth = mockAuth
export const app = { name: "mock-app" }
