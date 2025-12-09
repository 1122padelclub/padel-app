"use client"

import { useState, useEffect, useRef } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface TableCache {
  [key: string]: CacheEntry<any>
}

const CACHE_TTL = {
  TABLE_DATA: 5 * 60 * 1000, // 5 minutos
  BAR_DATA: 10 * 60 * 1000, // 10 minutos
  AUTH_STATE: 2 * 60 * 1000, // 2 minutos
  THEME_CONFIG: 15 * 60 * 1000, // 15 minutos
}

class TableCacheManager {
  private cache: TableCache = {}
  private maxSize = 100 // Máximo 100 entradas en caché

  set<T>(key: string, data: T, ttl: number = CACHE_TTL.TABLE_DATA): void {
    // Limpiar caché si está lleno
    if (Object.keys(this.cache).length >= this.maxSize) {
      this.cleanup()
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache[key]
    
    if (!entry) return null
    
    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[key]
      return null
    }
    
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache[key]
    return entry ? Date.now() - entry.timestamp <= entry.ttl : false
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      Object.keys(this.cache).forEach(key => {
        if (key.includes(pattern)) {
          delete this.cache[key]
        }
      })
    } else {
      this.cache = {}
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const entries = Object.entries(this.cache)
    
    // Ordenar por timestamp (más antiguos primero)
    entries.sort(([,a], [,b]) => a.timestamp - b.timestamp)
    
    // Eliminar el 20% más antiguo
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      delete this.cache[entries[i][0]]
    }
  }

  getStats() {
    const now = Date.now()
    const validEntries = Object.values(this.cache).filter(
      entry => now - entry.timestamp <= entry.ttl
    )
    
    return {
      totalEntries: Object.keys(this.cache).length,
      validEntries: validEntries.length,
      expiredEntries: Object.keys(this.cache).length - validEntries.length
    }
  }
}

// Instancia global del caché
const cacheManager = new TableCacheManager()

export function useTableCache() {
  const [stats, setStats] = useState(cacheManager.getStats())

  const setCache = <T>(key: string, data: T, ttl?: number) => {
    cacheManager.set(key, data, ttl)
    setStats(cacheManager.getStats())
  }

  const getCache = <T>(key: string): T | null => {
    return cacheManager.get<T>(key)
  }

  const hasCache = (key: string): boolean => {
    return cacheManager.has(key)
  }

  const invalidateCache = (pattern?: string) => {
    cacheManager.invalidate(pattern)
    setStats(cacheManager.getStats())
  }

  // Limpiar caché expirado cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      cacheManager.invalidate()
      setStats(cacheManager.getStats())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    setCache,
    getCache,
    hasCache,
    invalidateCache,
    stats
  }
}

export { CACHE_TTL }
