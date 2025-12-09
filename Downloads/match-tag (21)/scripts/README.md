# Scripts de Migración de Bares

Este directorio contiene scripts para migrar la estructura de datos de los bares a las nuevas versiones del esquema.

## Configuración Inicial

1. **Obtener credenciales de Firebase Admin:**
   - Ve a la consola de Firebase
   - Proyecto Settings > Service Accounts
   - Genera una nueva clave privada
   - Descarga el archivo JSON

2. **Colocar credenciales:**
   \`\`\`bash
   # Colocar el archivo en la raíz del proyecto
   cp path/to/downloaded/file.json serviceAccount.json
   \`\`\`

3. **Instalar dependencias:**
   \`\`\`bash
   npm install firebase-admin
   \`\`\`

## Scripts Disponibles

### migrate_bars.js

Script principal para migrar todos los bares del sistema.

**Verificar estado actual:**
\`\`\`bash
node scripts/migrate_bars.js check
\`\`\`

**Ejecutar migración:**
\`\`\`bash
node scripts/migrate_bars.js migrate
\`\`\`

**Características:**
- Procesa bares en lotes para evitar límites de Firestore
- Migración incremental (solo aplica cambios necesarios)
- Manejo robusto de errores
- Reporte detallado de resultados
- Backup automático de configuraciones legacy

## Versiones del Esquema

### Versión 0 (Legacy)
- Configuración de tema en `bars/{barId}.theme`
- Configuración de reservas en `bars/{barId}.reservationSite`
- Sin versionado

### Versión 1
- Configuración de tema en `bars/{barId}/themeConfig/default`
- Migración automática desde estructura legacy
- Campo `meta.schemaVersion = 1`

### Versión 2 (Actual)
- Configuración de tema en `bars/{barId}/themeConfig/default`
- Configuración de reservas en `bars/{barId}/reservationSite/config`
- Campo `meta.schemaVersion = 2`
- Timestamps de migración

## Estructura de Datos Migrada

### Antes (Legacy)
\`\`\`
bars/{barId}
├── name: "Mi Restaurante"
├── theme: { colors: {...}, menuCustomization: {...} }
└── reservationSite: { heroTitle: "...", ... }
\`\`\`

### Después (v2)
\`\`\`
bars/{barId}
├── name: "Mi Restaurante"
├── meta: { schemaVersion: 2, updatedAt: timestamp, migratedAt: timestamp }
├── themeConfig/
│   └── default: { colors: {...}, menuCustomization: {...} }
└── reservationSite/
    └── config: { heroTitle: "...", ... }
\`\`\`

## Seguridad

- Usa Firebase Admin SDK con permisos completos
- Requiere credenciales de servicio válidas
- Solo ejecutar en entornos seguros
- Hacer backup antes de ejecutar en producción

## Troubleshooting

**Error: "Cannot find module '../serviceAccount.json'"**
- Asegúrate de que el archivo serviceAccount.json está en la raíz del proyecto

**Error: "Permission denied"**
- Verifica que las credenciales de servicio tienen permisos de escritura
- Revisa las reglas de seguridad de Firestore

**Error: "Quota exceeded"**
- El script usa lotes pequeños, pero en bases de datos muy grandes puede ser necesario ajustar BATCH_SIZE
- Ejecutar en horarios de menor tráfico
