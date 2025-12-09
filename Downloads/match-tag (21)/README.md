# Match Tag - Chat por Mesa y Pedidos para Bares

Una aplicación web progresiva (PWA) que revoluciona el servicio en bares mediante chat por mesa y pedidos integrados usando tecnología NFC.

## 🚀 Características

- **Chat por Mesa en Tiempo Real**: Comunicación instantánea entre clientes y personal
- **Sistema de Pedidos Integrado**: Pedidos directos desde el chat con menú interactivo
- **Panel de Administración**: Gestión completa de mesas, menú, pedidos y chats
- **Super Admin**: Creación y gestión de bares y administradores
- **PWA**: Instalable en dispositivos móviles con funcionalidad offline
- **NFC Integration**: Acceso rápido escaneando tags NFC en cada mesa

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage, Analytics)
- **Estado Global**: Zustand
- **PWA**: Service Worker + Web App Manifest
- **Validación**: Zod + React Hook Form
- **Utilidades**: date-fns

## 🎨 Diseño

- **Tema**: Oscuro por defecto
- **Colores**: Azules con negro (#0A84FF, #0066CC, #003B73, #0B0B0B)
- **Tipografía**: Inter + Urbanist
- **Estilo**: Minimal, rounded-2xl, sombras suaves, grid layouts

## 🔐 Roles y Permisos

- **Super Admin**: Crear bares, asignar administradores, gestión global
- **Bar Admin**: Gestionar mesas, menú, pedidos y chats de su bar
- **Guest**: Acceso anónimo para chat y pedidos por mesa

## 📱 Rutas Principales

- `/` - Landing page
- `/mesa?barId=<id>&tableId=<id>` - Chat y pedidos por mesa (vía NFC)
- `/admin/login` - Login para administradores de bar
- `/admin` - Panel de administración de bar
- `/superadmin` - Panel de super administración

## 🚀 Instalación y Setup

### Prerrequisitos

- Node.js 18+ 
- Cuenta de Firebase
- Git

### 1. Clonar el Repositorio

\`\`\`bash
git clone <repository-url>
cd match-tag
npm install
\`\`\`

### 2. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication, Firestore, Storage y Analytics
3. Configurar Authentication con Email/Password
4. Los archivos de configuración ya están incluidos en `src/services/`

### 3. Configurar Firestore

1. Aplicar las reglas de seguridad desde `firestore.rules`
2. **Configurar índices compuestos requeridos** (Ver sección de Índices más abajo)
3. Crear el primer super admin:

**Opción A: Usando la página de inicialización (Recomendado)**
\`\`\`bash
# Ir a http://localhost:3000/init-super-admin
# Hacer clic en "Crear Super Admin"
# Credenciales: superadmin@matchtag.com / SuperAdmin123!
\`\`\`

**Opción B: Script Node.js (Producción)**
\`\`\`bash
# Configurar service account en scripts/init-super-admin.js
node scripts/init-super-admin.js
\`\`\`

**Credenciales del Super Admin:**
- Email: `superadmin@matchtag.com`
- Contraseña: `SuperAdmin123!`
- Acceso: `http://localhost:3000/superadmin`

### 4. Ejecutar en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

### 5. Configurar PWA

Los archivos PWA ya están configurados:
- `public/manifest.json` - Web App Manifest
- `public/sw.js` - Service Worker
- Iconos en múltiples tamaños en `/public/`

## 📊 Estructura de Base de Datos (Firestore)

\`\`\`
users/
  {uid}/
    - email: string
    - role: 'super_admin' | 'bar_admin' | 'guest'
    - barId?: string
    - createdAt: timestamp

bars/
  {barId}/
    - name: string
    - address: string
    - adminIds: string[]
    - isActive: boolean
    - createdAt: timestamp
    
    menuCategories/
      {categoryId}/
        - name: string
        - order: number
    
    menuItems/
      {itemId}/
        - categoryId: string
        - name: string
        - description?: string
        - price: number
        - isAvailable: boolean
        - imageUrl?: string

tables/
  {tableId}/
    - barId: string
    - number: number
    - isActive: boolean
    - createdAt: timestamp

orders/
  {orderId}/
    - barId: string
    - tableId: string
    - items: OrderItem[]
    - status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
    - total: number
    - createdAt: timestamp
    - updatedAt: timestamp

chats/
  {tableId}/
    messages/
      {messageId}/
        - type: 'text' | 'gif' | 'order'
        - content: string
        - orderId?: string
        - senderType: 'guest' | 'staff'
        - senderName?: string
        - createdAt: timestamp
\`\`\`

## 🔧 Índices de Firestore Requeridos

La aplicación requiere índices compuestos para consultas complejas. **IMPORTANTE**: Configura estos índices antes de usar la aplicación.

### Opción 1: Configuración Automática (Recomendada)

\`\`\`bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (si no está inicializado)
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
\`\`\`

### Opción 2: Configuración Manual

Ve a [Firebase Console](https://console.firebase.google.com) → Firestore → Índices y crea:

**Para `orders`:**
- Campos: `barId` (Ascending), `createdAt` (Descending)
- Tipo: Collection

**Para `messages`:**
- Campos: `tableId` (Ascending), `createdAt` (Ascending)
- Tipo: Collection

**Para `tables`:**
- Campos: `barId` (Ascending), `number` (Ascending)
- Tipo: Collection

### Opción 3: Usar Enlaces de Error

Cuando veas errores de índices faltantes:
1. Copia la URL del error de la consola
2. Pégala en tu navegador
3. Haz clic en "Crear índice"
4. Espera a que se complete (2-5 minutos)

**Nota**: Sin estos índices, las consultas de pedidos y mesas fallarán.

## 🔧 Componentes Principales

### Chat y Pedidos
- `ChatWindow` - Ventana principal de chat
- `MessageBubble` - Burbujas de mensajes
- `MenuSheet` - Hoja de menú con pedidos
- `OrderCard` - Tarjetas de items del menú

### Administración
- `AdminTableList` - CRUD de mesas
- `AdminMenuList` - Gestión de menú
- `AdminOrdersBoard` - Panel de pedidos
- `AdminChatMonitor` - Monitor de chats

### Super Admin
- `SuperAdminBarsList` - Gestión de bares
- `SuperAdminUsersList` - Gestión de administradores

### Utilidades
- `RoleGate` - Protección de rutas por roles
- `PWAInstallPrompt` - Prompt de instalación PWA

## 🔒 Seguridad

- Reglas de Firestore configuradas por roles
- Autenticación Firebase requerida para operaciones sensibles
- Validación client-side y server-side
- Acceso público controlado solo para funciones de mesa

## 📱 PWA Features

- **Instalable**: Prompt automático de instalación
- **Offline**: Cache de shell y datos críticos
- **Background Sync**: Sincronización de mensajes offline
- **Push Notifications**: Preparado para notificaciones
- **Responsive**: Optimizado para móviles y desktop

## 🚀 Deployment

### Vercel (Recomendado)

\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Otros Proveedores

\`\`\`bash
npm run build
npm start
\`\`\`

## 🧪 Testing

\`\`\`bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage
\`\`\`

## 📈 Analytics

Firebase Analytics está habilitado para tracking de:
- Uso de la aplicación
- Conversiones de pedidos
- Engagement por mesa
- Performance de la PWA

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear un issue en GitHub
- Email: support@matchtag.com
- Documentación: [docs.matchtag.com](https://docs.matchtag.com)

## 🎯 Roadmap

- [ ] Notificaciones push
- [ ] Integración con sistemas de pago
- [ ] Analytics avanzados
- [ ] Multi-idioma
- [ ] API pública
- [ ] Integración con POS systems

---

Desarrollado con ❤️ para revolucionar la experiencia en bares y restaurantes.
