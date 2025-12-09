"use client"

import { useState, useEffect } from "react"

interface CDNResource {
  url: string
  type: 'image' | 'data' | 'config'
  tenantId: string
  ttl: number
  lastModified: number
}

interface CDNStats {
  totalResources: number
  cacheHits: number
  cacheMisses: number
  bandwidthSaved: number
}

class CDNCacheManager {
  private cache: { [key: string]: CDNResource } = {}
  private stats: CDNStats = {
    totalResources: 0,
    cacheHits: 0,
    cacheMisses: 0,
    bandwidthSaved: 0
  }
  
  private maxCacheSize = 1000 // Máximo 1000 recursos en caché
  private cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.match-tag.com'

  async getResource(
    tenantId: string,
    resourcePath: string,
    type: 'image' | 'data' | 'config' = 'data'
  ): Promise<string | null> {
    const cacheKey = `${tenantId}_${resourcePath}`
    
    // Verificar caché local
    const cached = this.cache[cacheKey]
    if (cached && this.isValid(cached)) {
      this.stats.cacheHits++
      return cached.url
    }

    // Caché miss - obtener del CDN
    this.stats.cacheMisses++
    const cdnUrl = await this.fetchFromCDN(tenantId, resourcePath, type)
    
    if (cdnUrl) {
      this.cacheResource(cacheKey, {
        url: cdnUrl,
        type,
        tenantId,
        ttl: this.getTTL(type),
        lastModified: Date.now()
      })
    }

    return cdnUrl
  }

  private async fetchFromCDN(
    tenantId: string,
    resourcePath: string,
    type: 'image' | 'data' | 'config'
  ): Promise<string | null> {
    try {
      const cdnUrl = `${this.cdnBaseUrl}/${tenantId}/${resourcePath}`
      
      // Simular fetch del CDN
      const response = await fetch(cdnUrl, {
        method: 'HEAD', // Solo verificar si existe
        cache: 'force-cache'
      })

      if (response.ok) {
        return cdnUrl
      }
    } catch (error) {
      console.error(`[CDNCache] Error fetching from CDN:`, error)
    }

    return null
  }

  private cacheResource(key: string, resource: CDNResource) {
    // Limpiar caché si está lleno
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      this.cleanupCache()
    }

    this.cache[key] = resource
    this.stats.totalResources++
  }

  private isValid(resource: CDNResource): boolean {
    return Date.now() - resource.lastModified < resource.ttl
  }

  private getTTL(type: 'image' | 'data' | 'config'): number {
    switch (type) {
      case 'image':
        return 24 * 60 * 60 * 1000 // 24 horas
      case 'data':
        return 5 * 60 * 1000 // 5 minutos
      case 'config':
        return 60 * 60 * 1000 // 1 hora
      default:
        return 5 * 60 * 1000 // 5 minutos
    }
  }

  private cleanupCache() {
    const entries = Object.entries(this.cache)
    entries.sort(([,a], [,b]) => a.lastModified - b.lastModified)

    // Eliminar el 20% más antiguo
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      delete this.cache[entries[i][0]]
    }
  }

  getStats(): CDNStats {
    return { ...this.stats }
  }

  clearCache(tenantId?: string) {
    if (tenantId) {
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith(`${tenantId}_`)) {
          delete this.cache[key]
        }
      })
    } else {
      this.cache = {}
    }
  }
}

// Instancia global del caché CDN
const cdnCache = new CDNCacheManager()

export function useCDNCache(tenantId: string) {
  const [stats, setStats] = useState(cdnCache.getStats())

  const getResource = async (
    resourcePath: string,
    type: 'image' | 'data' | 'config' = 'data'
  ): Promise<string | null> => {
    const result = await cdnCache.getResource(tenantId, resourcePath, type)
    setStats(cdnCache.getStats())
    return result
  }

  const clearCache = (tenantId?: string) => {
    cdnCache.clearCache(tenantId)
    setStats(cdnCache.getStats())
  }

  // Limpiar caché expirado cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(cdnCache['cache']).forEach(key => {
        const resource = cdnCache['cache'][key]
        if (!cdnCache['isValid'](resource)) {
          delete cdnCache['cache'][key]
        }
      })
      setStats(cdnCache.getStats())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tenantId])

  return {
    getResource,
    clearCache,
    stats
  }
}

// Hook específico para recursos de restaurante
export function useRestaurantCDN(barId: string) {
  const cdnCache = useCDNCache(barId)

  const getBarLogo = async (): Promise<string | null> => {
    return cdnCache.getResource('logo.png', 'image')
  }

  const getBarTheme = async (): Promise<string | null> => {
    return cdnCache.getResource('theme.json', 'config')
  }

  const getMenuData = async (): Promise<string | null> => {
    return cdnCache.getResource('menu.json', 'data')
  }

  const getTableConfig = async (tableId: string): Promise<string | null> => {
    return cdnCache.getResource(`tables/${tableId}.json`, 'config')
  }

  return {
    getBarLogo,
    getBarTheme,
    getMenuData,
    getTableConfig,
    clearCache: cdnCache.clearCache,
    stats: cdnCache.stats
  }
}
