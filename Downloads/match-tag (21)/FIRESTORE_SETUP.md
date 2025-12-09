# Configuración de Firestore para Match Tag

## Índices Requeridos

La aplicación Match Tag requiere índices compuestos en Firestore para funcionar correctamente. Sigue estos pasos:

### Opción 1: Configuración Automática (Recomendada)

1. Instala Firebase CLI si no lo tienes:
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`

2. Inicia sesión en Firebase:
   \`\`\`bash
   firebase login
   \`\`\`

3. Inicializa el proyecto (si no está inicializado):
   \`\`\`bash
   firebase init firestore
   \`\`\`

4. Despliega los índices:
   \`\`\`bash
   firebase deploy --only firestore:indexes
   \`\`\`

### Opción 2: Configuración Manual

Si prefieres crear los índices manualmente, ve a la [Consola de Firebase](https://console.firebase.google.com) y crea estos índices compuestos:

#### Para la colección `orders`:
- **Campos**: `barId` (Ascending), `createdAt` (Descending)
- **Tipo de consulta**: Collection

#### Para la colección `messages`:
- **Campos**: `tableId` (Ascending), `createdAt` (Ascending)  
- **Tipo de consulta**: Collection

#### Para la colección `tables`:
- **Campos**: `barId` (Ascending), `number` (Ascending)
- **Tipo de consulta**: Collection

### Opción 3: Usar Enlaces de Error

Cuando veas un error como el que obtuviste, Firebase proporciona un enlace directo para crear el índice. Simplemente:

1. Copia la URL del error
2. Pégala en tu navegador
3. Haz clic en "Crear índice"
4. Espera a que se complete (puede tomar unos minutos)

## Verificación

Una vez configurados los índices, reinicia la aplicación y las consultas deberían funcionar sin errores.

## Reglas de Firestore

Asegúrate de que las reglas de Firestore estén actualizadas ejecutando:
\`\`\`bash
firebase deploy --only firestore:rules
