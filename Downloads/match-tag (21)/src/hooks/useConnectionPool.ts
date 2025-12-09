"use client"

import { useState, useEffect, useRef } from "react"

interface ConnectionPool {
  activeConnections: number
  maxConnections: number
  queue: Array<() => Promise<any>>
  processing: boolean
}

interface PooledRequest {
  id: string
  fn: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
  priority: number
}

class ConnectionPoolManager {
  private pool: ConnectionPool = {
    activeConnections: 0,
    maxConnections: 5, // Máximo 5 conexiones simultáneas
    queue: [],
    processing: false
  }
  
  private requestQueue: PooledRequest[] = []
  private requestId = 0

  async executeRequest<T>(
    fn: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: PooledRequest = {
        id: `req_${++this.requestId}`,
        fn,
        resolve,
        reject,
        timestamp: Date.now(),
        priority
      }

      // Insertar en cola ordenada por prioridad
      this.insertByPriority(request)
      
      // Procesar cola si no está procesando
      if (!this.pool.processing) {
        this.processQueue()
      }
    })
  }

  private insertByPriority(request: PooledRequest) {
    let inserted = false
    for (let i = 0; i < this.requestQueue.length; i++) {
      if (request.priority > this.requestQueue[i].priority) {
        this.requestQueue.splice(i, 0, request)
        inserted = true
        break
      }
    }
    if (!inserted) {
      this.requestQueue.push(request)
    }
  }

  private async processQueue() {
    if (this.pool.processing || this.requestQueue.length === 0) return
    
    this.pool.processing = true

    while (this.requestQueue.length > 0 && this.pool.activeConnections < this.pool.maxConnections) {
      const request = this.requestQueue.shift()
      if (!request) break

      this.pool.activeConnections++
      
      // Ejecutar request en paralelo
      this.executeRequestAsync(request)
    }

    this.pool.processing = false
  }

  private async executeRequestAsync(request: PooledRequest) {
    try {
      const result = await request.fn()
      request.resolve(result)
    } catch (error) {
      request.reject(error)
    } finally {
      this.pool.activeConnections--
      
      // Procesar siguiente request en cola
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100) // Pequeño delay para evitar spam
      }
    }
  }

  getPoolStatus() {
    return {
      activeConnections: this.pool.activeConnections,
      maxConnections: this.pool.maxConnections,
      queueLength: this.requestQueue.length,
      processing: this.pool.processing
    }
  }

  clearQueue() {
    this.requestQueue.forEach(request => {
      request.reject(new Error("Queue cleared"))
    })
    this.requestQueue = []
  }
}

// Instancia global del pool
const connectionPool = new ConnectionPoolManager()

export function useConnectionPool() {
  const [status, setStatus] = useState(connectionPool.getPoolStatus())

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(connectionPool.getPoolStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const executeRequest = async <T>(
    fn: () => Promise<T>,
    priority: number = 0
  ): Promise<T> => {
    return connectionPool.executeRequest(fn, priority)
  }

  const clearQueue = () => {
    connectionPool.clearQueue()
    setStatus(connectionPool.getPoolStatus())
  }

  return {
    executeRequest,
    clearQueue,
    status
  }
}

// Hook específico para operaciones de mesa
export function useTableConnectionPool() {
  const { executeRequest, status } = useConnectionPool()

  const executeTableOperation = async <T>(
    operation: () => Promise<T>,
    priority: number = 0
  ): Promise<T> => {
    return executeRequest(operation, priority)
  }

  return {
    executeTableOperation,
    status
  }
}
