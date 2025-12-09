# 🔥 Configuración de Firebase Service Account

## Pasos para Configurar la Variable de Entorno

### 1. Descargar Service Account Key

1. **Ve a [Firebase Console](https://console.firebase.google.com/project/match-tag-v0/settings/serviceaccounts/adminsdk)**
2. **Haz clic en "Generate new private key"**
3. **Descarga el archivo JSON**
4. **Renómbralo a `service-account-key.json`**
5. **Colócalo en la raíz del proyecto** (mismo nivel que `package.json`)

### 2. Ejecutar Script de Configuración

Una vez que tengas el archivo `service-account-key.json` en la raíz del proyecto, ejecuta:

```bash
node scripts/setup-firebase-env.js
```

### 3. Verificar Configuración

Después de ejecutar el script:

1. **Redeploy tu aplicación en Vercel**
2. **Ve al panel de inventario**
3. **Haz clic en "Probar API"**
4. **Deberías ver**: `✅ API de inventario funcionando correctamente`

## Enlaces Directos

- [Firebase Console - Service Accounts](https://console.firebase.google.com/project/match-tag-v0/settings/serviceaccounts/adminsdk)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Estructura del Archivo JSON

El archivo `service-account-key.json` debe verse así:

```json
{
  "type": "service_account",
  "project_id": "match-tag-v0",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@match-tag-v0.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xxxxx%40match-tag-v0.iam.gserviceaccount.com"
}
```

## Troubleshooting

### Si el script falla:
1. **Verifica que el archivo esté en la raíz del proyecto**
2. **Asegúrate de que el JSON sea válido**
3. **Revisa que tengas permisos en Vercel**

### Si la API sigue fallando:
1. **Redeploy la aplicación en Vercel**
2. **Espera unos minutos para que se propague**
3. **Revisa los logs de Vercel**

## Archivos Creados

- ✅ `scripts/setup-firebase-env.js` - Script de configuración automática
- ✅ `app/api/inventory/test/route.ts` - API de diagnóstico
- ✅ `FIREBASE_SERVICE_ACCOUNT_SETUP.md` - Guía detallada
- ✅ `service-account-key.example.json` - Archivo de ejemplo

## Próximos Pasos

Una vez configurado correctamente:
- ✅ Los pedidos descontarán inventario automáticamente
- ✅ Se registrarán movimientos en la base de datos
- ✅ Las alertas de stock bajo funcionarán
- ✅ El sistema de especificaciones funcionará correctamente
