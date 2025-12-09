"use client"

import { useState, useEffect } from "react"

interface TenantCache {
  [tenantId: string]: {
    [key: string]: {
      data: any
      timestamp: number
      ttl: number
    }
  }
}

interface TenantStats {
  tenantId: string
  cacheHits: number
  cacheMisses: number
  lastAccess: number
  memoryUsage: number
}

class MultiTenantCacheManager {
  private cache: TenantCache = {}
  private stats: { [tenantId: string]: TenantStats } = {}
  private maxTenants = 200 // Soporte para 200 restaurantes
  private maxCachePerTenant = 50 // 50 entradas por restaurante

  set(tenantId: string, key: string, data: any, ttl: number = 5 * 60 * 1000) {
    if (!this.cache[tenantId]) {
      this.cache[tenantId] = {}
    }

    // Limpiar caché del tenant si está lleno
    if (Object.keys(this.cache[tenantId]).length >= this.maxCachePerTenant) {
      this.cleanupTenant(tenantId)
    }

    this.cache[tenantId][key] = {
      data,
      timestamp: Date.now(),
      ttl
    }

    this.updateStats(tenantId, 'hit')
  }

  get(tenantId: string, key: string): any | null {
    const tenantCache = this.cache[tenantId]
    if (!tenantCache) return null

    const entry = tenantCache[key]
    if (!entry) {
      this.updateStats(tenantId, 'miss')
      return null
    }

    // Verificar TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete tenantCache[key]
      this.updateStats(tenantId, 'miss')
      return null
    }

    this.updateStats(tenantId, 'hit')
    return entry.data
  }

  has(tenantId: string, key: string): boolean {
    const tenantCache = this.cache[tenantId]
    if (!tenantCache) return false

    const entry = tenantCache[key]
    if (!entry) return false

    return Date.now() - entry.timestamp <= entry.ttl
  }

  invalidateTenant(tenantId: string) {
    delete this.cache[tenantId]
    delete this.stats[tenantId]
  }

  invalidatePattern(tenantId: string, pattern: string) {
    const tenantCache = this.cache[tenantId]
    if (!tenantCache) return

    Object.keys(tenantCache).forEach(key => {
      if (key.includes(pattern)) {
        delete tenantCache[key]
      }
    })
  }

  private cleanupTenant(tenantId: string) {
    const tenantCache = this.cache[tenantId]
    if (!tenantCache) return

    const entries = Object.entries(tenantCache)
    entries.sort(([,a], [,b]) => a.timestamp - b.timestamp)

    // Eliminar el 20% más antiguo
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      delete tenantCache[entries[i][0]]
    }
  }

  private updateStats(tenantId: string, type: 'hit' | 'miss') {
    if (!this.stats[tenantId]) {
      this.stats[tenantId] = {
        tenantId,
        cacheHits: 0,
        cacheMisses: 0,
        lastAccess: Date.now(),
        memoryUsage: 0
      }
    }

    if (type === 'hit') {
      this.stats[tenantId].cacheHits++
    } else {
      this.stats[tenantId].cacheMisses++
    }

    this.stats[tenantId].lastAccess = Date.now()
    this.stats[tenantId].memoryUsage = Object.keys(this.cache[tenantId] || {}).length
  }

  getTenantStats(tenantId: string): TenantStats | null {
    return this.stats[tenantId] || null
  }

  getAllStats(): TenantStats[] {
    return Object.values(this.stats)
  }

  // Limpiar tenants inactivos (más de 1 hora sin acceso)
  cleanupInactiveTenants() {
    const now = Date.now()
    const inactiveThreshold = 60 * 60 * 1000 // 1 hora

    Object.keys(this.cache).forEach(tenantId => {
      const stats = this.stats[tenantId]
      if (stats && (now - stats.lastAccess) > inactiveThreshold) {
        this.invalidateTenant(tenantId)
      }
    })
  }
}

// Instancia global del caché multi-tenant
const multiTenantCache = new MultiTenantCacheManager()

export function useMultiTenantCache(tenantId: string) {
  const [stats, setStats] = useState(multiTenantCache.getTenantStats(tenantId))

  const setCache = (key: string, data: any, ttl?: number) => {
    multiTenantCache.set(tenantId, key, data, ttl)
    setStats(multiTenantCache.getTenantStats(tenantId))
  }

  const getCache = (key: string) => {
    return multiTenantCache.get(tenantId, key)
  }

  const hasCache = (key: string) => {
    return multiTenantCache.has(tenantId, key)
  }

  const invalidateCache = (pattern?: string) => {
    if (pattern) {
      multiTenantCache.invalidatePattern(tenantId, pattern)
    } else {
      multiTenantCache.invalidateTenant(tenantId)
    }
    setStats(multiTenantCache.getTenantStats(tenantId))
  }

  // Limpiar tenants inactivos cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      multiTenantCache.cleanupInactiveTenants()
      setStats(multiTenantCache.getTenantStats(tenantId))
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tenantId])

  return {
    setCache,
    getCache,
    hasCache,
    invalidateCache,
    stats
  }
}

export { multiTenantCache }
