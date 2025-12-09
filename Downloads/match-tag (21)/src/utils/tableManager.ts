// Sistema de gestión de mesas persistente
// Almacena datos de mesas en localStorage para persistencia

interface TableData {
  id: string
  barId: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  password?: string
  createdAt: string
  updatedAt: string
}

interface BarData {
  id: string
  name: string
  logoUrl?: string
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    textColor?: string
    bgImage?: string
  }
  createdAt: string
  updatedAt: string
}

const TABLES_KEY = 'match-tag-tables'
const BARS_KEY = 'match-tag-bars'

export class TableManager {
  // Obtener todas las mesas
  static getTables(): TableData[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(TABLES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading tables from localStorage:', error)
      return []
    }
  }

  // Obtener una mesa específica
  static getTable(tableId: string): TableData | null {
    const tables = this.getTables()
    return tables.find(table => table.id === tableId) || null
  }

  // Crear o actualizar una mesa
  static saveTable(tableData: Omit<TableData, 'createdAt' | 'updatedAt'>): TableData {
    const tables = this.getTables()
    const existingIndex = tables.findIndex(table => table.id === tableData.id)
    
    const now = new Date().toISOString()
    const table: TableData = {
      ...tableData,
      createdAt: existingIndex >= 0 ? tables[existingIndex].createdAt : now,
      updatedAt: now,
    }

    if (existingIndex >= 0) {
      tables[existingIndex] = table
    } else {
      tables.push(table)
    }

    localStorage.setItem(TABLES_KEY, JSON.stringify(tables))
    return table
  }

  // Obtener todas las barras
  static getBars(): BarData[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(BARS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading bars from localStorage:', error)
      return []
    }
  }

  // Obtener una barra específica
  static getBar(barId: string): BarData | null {
    const bars = this.getBars()
    return bars.find(bar => bar.id === barId) || null
  }

  // Crear o actualizar una barra
  static saveBar(barData: Omit<BarData, 'createdAt' | 'updatedAt'>): BarData {
    const bars = this.getBars()
    const existingIndex = bars.findIndex(bar => bar.id === barData.id)
    
    const now = new Date().toISOString()
    const bar: BarData = {
      ...barData,
      createdAt: existingIndex >= 0 ? bars[existingIndex].createdAt : now,
      updatedAt: now,
    }

    if (existingIndex >= 0) {
      bars[existingIndex] = bar
    } else {
      bars.push(bar)
    }

    localStorage.setItem(BARS_KEY, JSON.stringify(bars))
    return bar
  }

  // Inicializar datos por defecto
  static initializeDefaults(barId: string, tableId: string) {
    // Crear barra por defecto si no existe
    if (!this.getBar(barId)) {
      this.saveBar({
        id: barId,
        name: "Match Tag Bar",
        logoUrl: null,
        theme: {
          primaryColor: "#0ea5e9",
          secondaryColor: "#1f2937",
          textColor: "#ffffff",
          bgImage: null,
        }
      })
    }

    // Crear mesa por defecto si no existe
    if (!this.getTable(tableId)) {
      this.saveTable({
        id: tableId,
        barId: barId,
        number: parseInt(tableId.slice(-2)) || 1,
        capacity: 4,
        status: 'available',
        // No incluir password por defecto
      })
    }
  }
}

