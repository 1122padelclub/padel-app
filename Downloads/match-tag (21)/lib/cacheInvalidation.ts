/**
 * Utilidades para invalidar caché cuando cambia configuración de bar
 */

/**
 * Invalida el caché del Service Worker para un bar específico
 */
export function invalidateBarCache(barId: string) {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          type: "INVALIDATE_BAR_CACHE",
          barId: barId,
        })
        console.log("[Cache] Invalidated cache for bar:", barId)
      }
    })
  }
}

/**
 * Fuerza recarga de página sin caché
 */
export function forceReloadWithoutCache() {
  if (typeof window !== "undefined") {
    // Recargar página sin caché
    window.location.reload()
  }
}

/**
 * Invalida caché y recarga páginas abiertas del bar
 */
export function invalidateAndReloadBar(barId: string) {
  invalidateBarCache(barId)

  // Notificar a otras pestañas/ventanas del mismo bar
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    const channel = new BroadcastChannel(`bar-updates-${barId}`)
    channel.postMessage({
      type: "THEME_UPDATED",
      barId: barId,
      timestamp: Date.now(),
    })

    // Escuchar actualizaciones de otros tabs
    channel.addEventListener("message", (event) => {
      if (event.data.type === "THEME_UPDATED" && event.data.barId === barId) {
        console.log("[Cache] Received theme update notification for bar:", barId)
        // Opcional: recargar automáticamente o mostrar notificación
        // forceReloadWithoutCache()
      }
    })
  }
}
