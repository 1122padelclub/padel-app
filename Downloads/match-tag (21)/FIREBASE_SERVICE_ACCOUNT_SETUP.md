# Configuración de Firebase Service Account

## Pasos para Configurar la Variable de Entorno

### 1. Obtener Service Account Key

1. **Ve a [Firebase Console](https://console.firebase.google.com/)**
2. **Selecciona el proyecto**: `match-tag-v0`
3. **Ve a Project Settings** (⚙️) → **Service Accounts**
4. **Haz clic en "Generate new private key"**
5. **Descarga el archivo JSON**

### 2. Configurar en Vercel

1. **Ve a [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Selecciona tu proyecto**: `match-tag-21`
3. **Ve a Settings** → **Environment Variables**
4. **Agrega nueva variable**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: [Pega aquí todo el contenido del archivo JSON descargado]
   - **Environment**: Production, Preview, Development (todas)

### 3. Formato del JSON

El archivo JSON debe verse así:
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

Después de configurar:
1. **Redeploy** tu aplicación en Vercel
2. **Haz clic en "Probar API"** en el panel de inventario
3. **Deberías ver**: `✅ API de inventario funcionando correctamente`

## Enlaces Directos

- [Firebase Console - match-tag-v0](https://console.firebase.google.com/project/match-tag-v0/settings/serviceaccounts/adminsdk)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Notas Importantes

- **No compartas** la service account key públicamente
- **Mantén segura** la clave privada
- **Solo usa** esta clave en el servidor (Vercel)
- **Regenera** la clave si crees que ha sido comprometida
