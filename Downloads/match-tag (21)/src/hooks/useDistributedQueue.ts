"use client"

import { useState, useEffect, useRef } from "react"

interface QueueItem {
  id: string
  tenantId: string
  operation: string
  data: any
  priority: number
  timestamp: number
  retries: number
  maxRetries: number
}

interface QueueStats {
  totalItems: number
  processingItems: number
  completedItems: number
  failedItems: number
  averageProcessingTime: number
}

class DistributedQueueManager {
  private queues: { [tenantId: string]: QueueItem[] } = {}
  private processing: { [tenantId: string]: Set<string> } = {}
  private completed: { [tenantId: string]: QueueItem[] } = {}
  private failed: { [tenantId: string]: QueueItem[] } = {}
  
  private maxConcurrentPerTenant = 3 // Máximo 3 operaciones simultáneas por restaurante
  private maxQueueSize = 100 // Máximo 100 items en cola por restaurante
  private processingTimes: { [tenantId: string]: number[] } = {}

  async enqueue(
    tenantId: string,
    operation: string,
    data: any,
    priority: number = 0,
    maxRetries: number = 3
  ): Promise<string> {
    const itemId = `${tenantId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const item: QueueItem = {
      id: itemId,
      tenantId,
      operation,
      data,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries
    }

    // Verificar límite de cola
    if (this.queues[tenantId]?.length >= this.maxQueueSize) {
      throw new Error(`Queue limit reached for tenant ${tenantId}`)
    }

    if (!this.queues[tenantId]) {
      this.queues[tenantId] = []
    }

    // Insertar por prioridad
    this.insertByPriority(tenantId, item)

    // Procesar cola si no está procesando
    this.processQueue(tenantId)

    return itemId
  }

  private insertByPriority(tenantId: string, item: QueueItem) {
    const queue = this.queues[tenantId]
    let inserted = false

    for (let i = 0; i < queue.length; i++) {
      if (item.priority > queue[i].priority) {
        queue.splice(i, 0, item)
        inserted = true
        break
      }
    }

    if (!inserted) {
      queue.push(item)
    }
  }

  private async processQueue(tenantId: string) {
    const queue = this.queues[tenantId]
    const processing = this.processing[tenantId] || new Set()

    if (!queue || queue.length === 0 || processing.size >= this.maxConcurrentPerTenant) {
      return
    }

    const item = queue.shift()
    if (!item) return

    if (!this.processing[tenantId]) {
      this.processing[tenantId] = new Set()
    }

    this.processing[tenantId].add(item.id)

    // Procesar item en paralelo
    this.processItem(item)
  }

  private async processItem(item: QueueItem) {
    const startTime = Date.now()

    try {
      // Simular procesamiento basado en el tipo de operación
      await this.executeOperation(item)

      // Marcar como completado
      this.markCompleted(item)
      
      // Registrar tiempo de procesamiento
      this.recordProcessingTime(item.tenantId, Date.now() - startTime)

    } catch (error) {
      console.error(`[DistributedQueue] Error processing item ${item.id}:`, error)
      
      // Reintentar si no ha excedido el límite
      if (item.retries < item.maxRetries) {
        item.retries++
        this.requeue(item)
      } else {
        this.markFailed(item)
      }
    } finally {
      // Remover de procesamiento
      if (this.processing[item.tenantId]) {
        this.processing[item.tenantId].delete(item.id)
      }

      // Procesar siguiente item
      setTimeout(() => this.processQueue(item.tenantId), 100)
    }
  }

  private async executeOperation(item: QueueItem) {
    // Simular diferentes tipos de operaciones
    switch (item.operation) {
      case 'auth':
        await this.simulateAuth(item.data)
        break
      case 'table_data':
        await this.simulateTableData(item.data)
        break
      case 'bar_data':
        await this.simulateBarData(item.data)
        break
      case 'chat_message':
        await this.simulateChatMessage(item.data)
        break
      default:
        await this.simulateGenericOperation(item.data)
    }
  }

  private async simulateAuth(data: any) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private async simulateTableData(data: any) {
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  private async simulateBarData(data: any) {
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  private async simulateChatMessage(data: any) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  private async simulateGenericOperation(data: any) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private markCompleted(item: QueueItem) {
    if (!this.completed[item.tenantId]) {
      this.completed[item.tenantId] = []
    }
    this.completed[item.tenantId].push(item)
  }

  private markFailed(item: QueueItem) {
    if (!this.failed[item.tenantId]) {
      this.failed[item.tenantId] = []
    }
    this.failed[item.tenantId].push(item)
  }

  private requeue(item: QueueItem) {
    if (!this.queues[item.tenantId]) {
      this.queues[item.tenantId] = []
    }
    this.queues[item.tenantId].unshift(item) // Reinsertar al inicio
  }

  private recordProcessingTime(tenantId: string, time: number) {
    if (!this.processingTimes[tenantId]) {
      this.processingTimes[tenantId] = []
    }
    this.processingTimes[tenantId].push(time)
    
    // Mantener solo los últimos 100 tiempos
    if (this.processingTimes[tenantId].length > 100) {
      this.processingTimes[tenantId] = this.processingTimes[tenantId].slice(-100)
    }
  }

  getQueueStats(tenantId: string): QueueStats {
    const queue = this.queues[tenantId] || []
    const processing = this.processing[tenantId] || new Set()
    const completed = this.completed[tenantId] || []
    const failed = this.failed[tenantId] || []
    
    const times = this.processingTimes[tenantId] || []
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0

    return {
      totalItems: queue.length + processing.size + completed.length + failed.length,
      processingItems: processing.size,
      completedItems: completed.length,
      failedItems: failed.length,
      averageProcessingTime: averageTime
    }
  }

  clearQueue(tenantId: string) {
    this.queues[tenantId] = []
    this.processing[tenantId] = new Set()
    this.completed[tenantId] = []
    this.failed[tenantId] = []
  }
}

// Instancia global de la cola distribuida
const distributedQueue = new DistributedQueueManager()

export function useDistributedQueue(tenantId: string) {
  const [stats, setStats] = useState(distributedQueue.getQueueStats(tenantId))

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(distributedQueue.getQueueStats(tenantId))
    }, 1000)

    return () => clearInterval(interval)
  }, [tenantId])

  const enqueue = async (
    operation: string,
    data: any,
    priority: number = 0,
    maxRetries: number = 3
  ): Promise<string> => {
    return distributedQueue.enqueue(tenantId, operation, data, priority, maxRetries)
  }

  const clearQueue = () => {
    distributedQueue.clearQueue(tenantId)
    setStats(distributedQueue.getQueueStats(tenantId))
  }

  return {
    enqueue,
    clearQueue,
    stats
  }
}
