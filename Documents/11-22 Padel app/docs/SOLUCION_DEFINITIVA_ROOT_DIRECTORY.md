# Solución Definitiva: Root Directory en Vercel

## 🔍 Problema

El error `A Serverless Function has an invalid name: "'Documents/11-22 Padel app/___next_launcher.cjs'"` ocurre porque:

1. Los archivos del proyecto están en git con la ruta `Documents/11-22 Padel app/`
2. Vercel está usando esa ruta completa en los nombres de las funciones serverless
3. Los espacios en los nombres de funciones no están permitidos

## ✅ Solución: Configurar Root Directory en Vercel

**Esta es la solución más simple y efectiva:**

1. **Ve a Vercel Dashboard**
   - Abre https://vercel.com
   - Selecciona tu proyecto `padel-app-alo1`

2. **Ve a Settings → General → Build & Deployment**

3. **Configura el Root Directory**
   - En el campo "Root Directory", ingresa exactamente:
     ```
     Documents/11-22 Padel app
     ```
   - **IMPORTANTE**: 
     - Sin espacios extra al inicio o final
     - Sin barra final (`/`)
     - Respeta mayúsculas y minúsculas

4. **Guarda los cambios**

5. **Limpia el caché y redeploy**
   - Ve a la pestaña "Deployments"
   - Haz clic en los tres puntos (...) del último deployment
   - Selecciona "Redeploy"
   - Marca la opción "Use existing Build Cache" como **desactivada**

## 🔧 Verificación

Después de configurar el Root Directory, verifica que:

- El build se complete sin errores
- No aparezca el error de "invalid name" en las funciones serverless
- El deployment se complete correctamente
- La aplicación funcione en producción

## 📝 Nota

Esta solución es preferible a reescribir el historial de git porque:
- Es más rápida
- No requiere cambios en el código
- No afecta el historial del repositorio
- Es la forma recomendada por Vercel para proyectos en subdirectorios

