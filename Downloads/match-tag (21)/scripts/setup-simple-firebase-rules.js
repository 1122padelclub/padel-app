// Script para configurar reglas simples de Firebase Realtime Database
// Este script te ayudará a configurar reglas básicas para desarrollo

console.log(`
🔥 CONFIGURACIÓN DE REGLAS DE FIREBASE REALTIME DATABASE

Para solucionar el error de permisos, necesitas actualizar las reglas en Firebase:

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto "Match tag V0"
3. Ve a "Realtime Database" en el menú lateral
4. Haz clic en la pestaña "Reglas"
5. Reemplaza las reglas actuales con estas reglas simples:

{
  "rules": {
    ".read": true,
    ".write": true
  }
}

⚠️  IMPORTANTE: Estas reglas son para DESARROLLO únicamente.
    Para producción, necesitarás reglas más seguras.

6. Haz clic en "Publicar" para guardar los cambios

Una vez que hagas esto, el chat debería funcionar correctamente.
`)

// También podemos intentar autenticación anónima como fallback
import { getAuth, signInAnonymously } from "firebase/auth"

const auth = getAuth()

async function ensureAuthentication() {
  try {
    if (!auth.currentUser) {
      console.log("[v0] No hay usuario autenticado, intentando autenticación anónima...")
      const result = await signInAnonymously(auth)
      console.log("[v0] Usuario anónimo creado:", result.user.uid)
      return result.user
    }
    return auth.currentUser
  } catch (error) {
    console.error("[v0] Error en autenticación anónima:", error)
    return null
  }
}

// Ejecutar autenticación anónima
ensureAuthentication().then((user) => {
  if (user) {
    console.log("[v0] Usuario autenticado correctamente:", user.uid)
  } else {
    console.log("[v0] No se pudo autenticar al usuario")
  }
})
