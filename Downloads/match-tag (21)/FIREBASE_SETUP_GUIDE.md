# Guía de Configuración de Firebase para Inventario

## Error Actual
```
Error en API: Invalid JSON format in FIREBASE_SERVICE_ACCOUNT environment variable
```

## Solución

### 1. Obtener la Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `match-tag-v0`
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **"Generate new private key"**
5. Descarga el archivo JSON

### 2. Configurar Variable de Entorno

#### Opción A: En Vercel (Recomendado)
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega una nueva variable:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Copia todo el contenido del archivo JSON descargado
   - **Environment**: Production, Preview, Development (todas)

#### Opción B: En archivo .env.local (Desarrollo local)
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega la variable:
```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"match-tag-v0",...}
```

### 3. Formato Correcto de la Variable

La variable debe contener el JSON completo de la service account, por ejemplo:
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

### 4. Verificar Configuración

1. **Redeploy** tu aplicación en Vercel
2. Prueba el botón **"Probar API"** nuevamente
3. Deberías ver: `✅ API de inventario funcionando correctamente`

### 5. Troubleshooting

#### Si sigue fallando:
1. **Verifica el JSON**: Asegúrate de que no haya caracteres extra o saltos de línea
2. **Escape de comillas**: Si copias desde un editor, asegúrate de que las comillas estén escapadas
3. **Revisa los logs**: Ve a Vercel → Functions → Logs para ver errores detallados

#### Logs esperados después de la configuración:
```
✅ Firebase Admin SDK initialized successfully
Processing inventory deduct for order test_1234567890
```

## Archivos Afectados

- `app/api/inventory/process-order/route.ts` - API de inventario
- `lib/firebaseAdmin.ts` - Configuración del Admin SDK
- Variables de entorno de Vercel

## Funcionalidad Después de la Configuración

Una vez configurado correctamente:
- ✅ Los pedidos descontarán inventario automáticamente
- ✅ Se registrarán movimientos en la base de datos
- ✅ Las alertas de stock bajo funcionarán
- ✅ El botón de prueba mostrará éxito
