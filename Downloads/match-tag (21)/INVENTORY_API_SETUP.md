# Configuración de la API de Inventario

## Problema Actual
La API de inventario está fallando con error 500 debido a permisos insuficientes. Esto ocurre porque las API routes de Next.js necesitan usar el Firebase Admin SDK en lugar del cliente SDK.

## Solución

### 1. Configurar Variable de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con la siguiente variable:

```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tu_project_id","private_key_id":"tu_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@tu_project_id.iam.gserviceaccount.com","client_id":"tu_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xxxxx%40tu_project_id.iam.gserviceaccount.com"}
```

### 2. Obtener la Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Service Accounts**
4. Haz clic en **"Generate new private key"**
5. Descarga el archivo JSON
6. Copia el contenido del JSON y pégalo como valor de `FIREBASE_SERVICE_ACCOUNT`

### 3. Reiniciar el Servidor

```bash
npm run dev
# o
yarn dev
```

## Verificación

Una vez configurado, deberías ver en la consola:
```
✅ Firebase Admin SDK initialized successfully
```

Y la API de inventario debería funcionar correctamente sin errores de permisos.

## Archivos Modificados

- `app/api/inventory/process-order/route.ts` - Actualizado para usar Admin SDK
- `lib/firebaseAdmin.ts` - Configuración del Admin SDK
- `src/hooks/useAdminOrders.ts` - Integración con la API de inventario

## Funcionalidad

La API ahora:
- ✅ Usa Firebase Admin SDK (permisos completos)
- ✅ Procesa descuentos de inventario automáticamente
- ✅ Registra movimientos de inventario
- ✅ Maneja cancelaciones y reversiones
- ✅ Evita procesamiento duplicado
