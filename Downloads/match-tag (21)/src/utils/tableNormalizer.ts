// Utilidad para normalizar datos de mesas
export interface NormalizedTable {
  id: string
  number: number
  barId: string
  isActive: boolean
  capacity?: number
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export function normalizeTableData(tableData: any, barId: string): NormalizedTable {
  console.log("🔍 Normalizando mesa:", tableData, "para bar:", barId)
  
  // Si ya está normalizada, devolverla
  if (tableData && typeof tableData === 'object' && tableData.id && typeof tableData.id === 'string' && tableData.number) {
    const normalized = {
      id: String(tableData.id), // Asegurar que es string
      number: Number(tableData.number) || 1,
      barId: String(tableData.barId || barId),
      isActive: tableData.isActive !== false,
      capacity: Number(tableData.capacity) || 4,
      status: String(tableData.status || 'available'),
      createdAt: tableData.createdAt,
      updatedAt: tableData.updatedAt
    }
    console.log("✅ Mesa ya normalizada:", normalized)
    return normalized
  }

  // Si es un objeto con datos de Firestore
  if (tableData && typeof tableData === 'object') {
    const normalized = {
      id: String(tableData.id || `table-${Date.now()}`), // Asegurar que es string
      number: Number(tableData.number || parseInt(String(tableData.id || '').slice(-2)) || 1),
      barId: String(barId),
      isActive: tableData.isActive !== false,
      capacity: Number(tableData.capacity) || 4,
      status: String(tableData.status || 'available'),
      createdAt: tableData.createdAt,
      updatedAt: tableData.updatedAt
    }
    console.log("✅ Mesa normalizada desde Firestore:", normalized)
    return normalized
  }

  // Si es solo un ID
  if (typeof tableData === 'string') {
    const normalized = {
      id: String(tableData),
      number: parseInt(tableData.slice(-2)) || 1,
      barId: String(barId),
      isActive: true,
      capacity: 4,
      status: 'available'
    }
    console.log("✅ Mesa normalizada desde string:", normalized)
    return normalized
  }

  // Fallback por defecto
  const normalized = {
    id: `table-${Date.now()}`,
    number: 1,
    barId: String(barId),
    isActive: true,
    capacity: 4,
    status: 'available'
  }
  console.log("✅ Mesa normalizada fallback:", normalized)
  return normalized
}

export function normalizeTableList(tables: any[], barId: string): NormalizedTable[] {
  if (!Array.isArray(tables)) {
    return []
  }

  return tables.map(table => normalizeTableData(table, barId))
}

// Función para crear datos de mesa por defecto si no existen
export function createDefaultTableData(tableId: string, barId: string): NormalizedTable {
  return {
    id: tableId,
    number: parseInt(tableId.slice(-2)) || 1,
    barId: barId,
    isActive: true,
    capacity: 4,
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}
