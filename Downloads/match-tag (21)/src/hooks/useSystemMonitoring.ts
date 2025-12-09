"use client"

import { useState, useEffect } from "react"

interface SystemMetrics {
  timestamp: number
  activeTenants: number
  totalUsers: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
  memoryUsage: number
  cpuUsage: number
}

interface TenantMetrics {
  tenantId: string
  activeUsers: number
  requestsPerMinute: number
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
  lastActivity: number
}

class SystemMonitor {
  private metrics: SystemMetrics[] = []
  private tenantMetrics: { [tenantId: string]: TenantMetrics } = {}
  private maxMetricsHistory = 1000 // Mantener últimos 1000 puntos de métricas

  recordSystemMetric(metric: Partial<SystemMetrics>) {
    const fullMetric: SystemMetrics = {
      timestamp: Date.now(),
      activeTenants: 0,
      totalUsers: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      ...metric
    }

    this.metrics.push(fullMetric)

    // Mantener solo los últimos N métricas
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }
  }

  recordTenantMetric(tenantId: string, metric: Partial<TenantMetrics>) {
    const existing = this.tenantMetrics[tenantId] || {
      tenantId,
      activeUsers: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      lastActivity: Date.now()
    }

    this.tenantMetrics[tenantId] = {
      ...existing,
      ...metric,
      lastActivity: Date.now()
    }
  }

  getSystemMetrics(): SystemMetrics[] {
    return [...this.metrics]
  }

  getTenantMetrics(tenantId: string): TenantMetrics | null {
    return this.tenantMetrics[tenantId] || null
  }

  getAllTenantMetrics(): TenantMetrics[] {
    return Object.values(this.tenantMetrics)
  }

  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
  } {
    const latest = this.metrics[this.metrics.length - 1]
    if (!latest) {
      return {
        status: 'healthy',
        issues: [],
        recommendations: []
      }
    }

    const issues: string[] = []
    const recommendations: string[] = []

    // Verificar métricas críticas
    if (latest.errorRate > 0.1) { // 10% error rate
      issues.push(`High error rate: ${(latest.errorRate * 100).toFixed(1)}%`)
      recommendations.push('Investigate error sources and implement better error handling')
    }

    if (latest.averageResponseTime > 2000) { // 2 segundos
      issues.push(`Slow response time: ${latest.averageResponseTime}ms`)
      recommendations.push('Optimize database queries and implement caching')
    }

    if (latest.cacheHitRate < 0.7) { // 70% cache hit rate
      issues.push(`Low cache hit rate: ${(latest.cacheHitRate * 100).toFixed(1)}%`)
      recommendations.push('Improve caching strategy and increase cache TTL')
    }

    if (latest.memoryUsage > 0.8) { // 80% memory usage
      issues.push(`High memory usage: ${(latest.memoryUsage * 100).toFixed(1)}%`)
      recommendations.push('Implement memory cleanup and optimize data structures')
    }

    if (latest.requestsPerSecond > 100) { // 100 RPS
      issues.push(`High request rate: ${latest.requestsPerSecond} RPS`)
      recommendations.push('Consider implementing rate limiting and request queuing')
    }

    const status = issues.length === 0 ? 'healthy' : 
                  issues.length <= 2 ? 'warning' : 'critical'

    return {
      status,
      issues,
      recommendations
    }
  }

  getTenantHealth(tenantId: string): {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
  } {
    const tenant = this.tenantMetrics[tenantId]
    if (!tenant) {
      return {
        status: 'healthy',
        issues: []
      }
    }

    const issues: string[] = []

    if (tenant.errorRate > 0.05) { // 5% error rate
      issues.push(`High error rate: ${(tenant.errorRate * 100).toFixed(1)}%`)
    }

    if (tenant.averageResponseTime > 1000) { // 1 segundo
      issues.push(`Slow response time: ${tenant.averageResponseTime}ms`)
    }

    if (tenant.cacheHitRate < 0.8) { // 80% cache hit rate
      issues.push(`Low cache hit rate: ${(tenant.cacheHitRate * 100).toFixed(1)}%`)
    }

    if (Date.now() - tenant.lastActivity > 30 * 60 * 1000) { // 30 minutos inactivo
      issues.push('Tenant appears inactive')
    }

    const status = issues.length === 0 ? 'healthy' : 
                  issues.length <= 2 ? 'warning' : 'critical'

    return {
      status,
      issues
    }
  }

  // Limpiar métricas antiguas (más de 24 horas)
  cleanupOldMetrics() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000)
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    Object.keys(this.tenantMetrics).forEach(tenantId => {
      const tenant = this.tenantMetrics[tenantId]
      if (tenant.lastActivity < cutoff) {
        delete this.tenantMetrics[tenantId]
      }
    })
  }
}

// Instancia global del monitor
const systemMonitor = new SystemMonitor()

export function useSystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([])
  const [health, setHealth] = useState(systemMonitor.getSystemHealth())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(systemMonitor.getSystemMetrics())
      setHealth(systemMonitor.getSystemHealth())
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  const recordMetric = (metric: Partial<SystemMetrics>) => {
    systemMonitor.recordSystemMetric(metric)
    setMetrics(systemMonitor.getSystemMetrics())
    setHealth(systemMonitor.getSystemHealth())
  }

  const recordTenantMetric = (tenantId: string, metric: Partial<TenantMetrics>) => {
    systemMonitor.recordTenantMetric(tenantId, metric)
  }

  const getTenantHealth = (tenantId: string) => {
    return systemMonitor.getTenantHealth(tenantId)
  }

  const getAllTenantMetrics = () => {
    return systemMonitor.getAllTenantMetrics()
  }

  return {
    metrics,
    health,
    recordMetric,
    recordTenantMetric,
    getTenantHealth,
    getAllTenantMetrics
  }
}

// Hook específico para monitoreo de tenant
export function useTenantMonitoring(tenantId: string) {
  const [tenantMetrics, setTenantMetrics] = useState<TenantMetrics | null>(null)
  const [health, setHealth] = useState(systemMonitor.getTenantHealth(tenantId))

  useEffect(() => {
    const interval = setInterval(() => {
      setTenantMetrics(systemMonitor.getTenantMetrics(tenantId))
      setHealth(systemMonitor.getTenantHealth(tenantId))
    }, 10000) // Actualizar cada 10 segundos

    return () => clearInterval(interval)
  }, [tenantId])

  const recordMetric = (metric: Partial<TenantMetrics>) => {
    systemMonitor.recordTenantMetric(tenantId, metric)
    setTenantMetrics(systemMonitor.getTenantMetrics(tenantId))
    setHealth(systemMonitor.getTenantHealth(tenantId))
  }

  return {
    metrics: tenantMetrics,
    health,
    recordMetric
  }
}
