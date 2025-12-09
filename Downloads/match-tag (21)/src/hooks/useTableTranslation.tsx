"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

const esTableTranslations = {
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    confirm: "Confirmar",
    close: "Cerrar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    refresh: "Actualizar",
    yes: "Sí",
    no: "No",
    noResults: "No se encontraron resultados",
    identified: "Identificado",
    welcome: "Bienvenido",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    optional: "Opcional",
    back: "Atrás",
    sending: "Enviando...",
    next: "Siguiente",
    specifications: "Especificaciones"
  },
  table: {
    tableNumber: "Mesa {number}",
    available: "Disponible",
    occupied: "Ocupada",
    reserved: "Reservada",
    orderNow: "Pedir Ahora",
    reserve: "Reservar",
    callWaiter: "Llamar Mesero",
    generalChat: "Chat General",
    discover: "Descubrir",
    menu: "Menú",
    chats: "Chats",
    ordersOnly: "Solo Pedidos",
    joinTable: "Unirse a la Mesa",
    leaveTable: "Salir de la Mesa",
    shareBill: "Dividir Cuenta",
    individualBill: "Cuenta Individual",
    yourTable: "Tu mesa",
    activeConversations: "Conversaciones Activas",
    noActiveConversations: "No hay conversaciones activas",
    discoverTablesAndMatch: "¡Descubre mesas y haz match!",
    viewChats: "Ver Chats",
    barMenu: "Menú del Bar",
    viewFullMenu: "Ver Menú Completo",
    rateService: "Calificar Servicio",
    makeOrderForMyTable: "Hacer Pedido para Mi Mesa",
    tableNotFound: "Mesa no encontrada",
    errorCallingWaiter: "Error al llamar al mesero. Inténtalo de nuevo.",
    waiterCalledSuccessfully: "Mesero llamado exitosamente. Te atenderán pronto.",
    table: "Mesa",
    requestWaiterAttention: "solicita atención del mesero",
    connectedWithTable: "Conectaste con Mesa",
    yourOpinionMatters: "Tu opinión es importante para nosotros",
    yourOpinionHelpsUsImprove: "Tu opinión nos ayuda a mejorar nuestro servicio.",
    comments: "Comentarios",
    thanksForRating: "¡Gracias por tu calificación!",
    sendRating: "Enviar Calificación",
    availableTables: "Mesas Disponibles",
    noAvailableTables: "No hay mesas disponibles",
    allTablesOccupiedOrInactive: "Todas las mesas están ocupadas o inactivas",
    selectTableToConnect: "Selecciona una mesa para conectar",
    youCanStartConversationDirectly: "Puedes iniciar una conversación directamente",
    availableForChat: "Disponible para chat",
    connect: "Conectar",
    active: "Activa",
    joinTable: "Únete a la Mesa",
    orderNow: "Pedir Ahora",
    callWaiter: "Llamar Mesero"
  },
  chat: {
    startConversation: "¡Inicia la conversación!",
    sendFirstMessage: "Envía el primer mensaje",
    typeMessage: "Escribe un mensaje...",
    send: "Enviar",
    quickMessages: "Mensajes rápidos",
    hello: "¡Hola!",
    joinOurTable: "¿Te unes a nuestra mesa?",
    cheers: "¡Salud!",
    everythingOk: "¿Todo bien?"
  },
  order: {
    makeOrder: "Hacer Pedido",
    yourOrder: "Tu Pedido",
    yourCartIsEmpty: "Tu carrito está vacío",
    confirmOrder: "Confirmar Pedido"
  },
  customer: {
    customerInformation: "Información del Cliente",
    name: "Nombre",
    customerNamePlaceholder: "Nombre del Cliente",
    phone: "Teléfono",
    phoneNumberPlaceholder: "Número de teléfono",
    sharedAccount: "Cuenta Compartida",
    sharedAccountDescription: "Tu pedido se agregará a la cuenta general de la mesa",
    individualAccount: "Cuenta Individual",
    individualAccountDescription: "Se creará una cuenta separada a tu nombre"
  },
  password: {
    requiresPassword: "Esta mesa requiere contraseña para acceder",
    password: "Contraseña",
    enterPassword: "Ingresa la contraseña de la mesa",
    accessTable: "Acceder a la Mesa"
  },
  rating: {
    howWouldYouRateOurService: "¿Cómo calificarías nuestro servicio?",
    selectRating: "Selecciona una calificación",
    tellUsAboutYourExperience: "Cuéntanos sobre tu experiencia...",
    characters: "caracteres",
    howDoYouWantToSendYourRating: "¿Cómo quieres enviar tu calificación?",
    anonymously: "Anónimamente",
    leavingMyContactData: "Dejando mis datos de contacto"
  },
  menu: {
    barMenu: "Menú del Bar",
    selectItemsToSendTo: "Selecciona items para enviar a",
    noItemsAvailable: "No hay items disponibles en el menú",
    sendOrder: "Enviar Pedido"
  },
  generalChat: {
    title: "Chat General",
    joinGeneralChat: "Unirse al Chat General",
    howDoYouWantToAppear: "¿Cómo quieres aparecer en el chat?",
    withName: "Con nombre",
    anonymous: "Anónimo",
    username: "Nombre de usuario",
    usernamePlaceholder: "Username",
    avatar: "Avatar",
    selectAvatar: "Seleccionar Avatar",
    changeAvatar: "Cambiar Avatar",
    joinChat: "Unirse al Chat",
    generalChat: "Chat General",
    online: "en línea",
    loadingMessages: "Cargando mensajes...",
    youHaveBeenBanned: "Has sido expulsado del chat",
    bannedByAdmin: "Has sido expulsado del chat general por el administrador.",
    noMessagesYet: "No hay mensajes aún. ¡Sé el primero en escribir!",
    youAreBanned: "Estás baneado del chat",
    administrator: "Administrador",
    joinedChat: "se unió al chat",
    leftChat: "salió del chat",
    selectAvatarFirst: "Por favor selecciona un avatar antes de unirte al chat"
  }
}

const enTableTranslations = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    refresh: "Refresh",
    yes: "Yes",
    no: "No",
    noResults: "No results found",
    identified: "Identified",
    welcome: "Welcome",
    name: "Name",
    email: "Email",
    phone: "Phone",
    optional: "Optional",
    back: "Back",
    sending: "Sending...",
    next: "Next",
    specifications: "Specifications"
  },
  table: {
    tableNumber: "Table {number}",
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    orderNow: "Order Now",
    reserve: "Reserve",
    callWaiter: "Call Waiter",
    generalChat: "General Chat",
    discover: "Discover",
    menu: "Menu",
    chats: "Chats",
    ordersOnly: "Orders Only",
    joinTable: "Join Table",
    leaveTable: "Leave Table",
    shareBill: "Share Bill",
    individualBill: "Individual Bill",
    yourTable: "Your table",
    activeConversations: "Active Conversations",
    noActiveConversations: "No active conversations",
    discoverTablesAndMatch: "Discover tables and make matches!",
    viewChats: "View Chats",
    barMenu: "Bar Menu",
    viewFullMenu: "View Full Menu",
    rateService: "Rate Service",
    makeOrderForMyTable: "Make Order for My Table",
    tableNotFound: "Table not found",
    errorCallingWaiter: "Error calling waiter. Please try again.",
    waiterCalledSuccessfully: "Waiter called successfully. You will be attended soon.",
    table: "Table",
    requestWaiterAttention: "requests waiter attention",
    connectedWithTable: "Connected with Table",
    yourOpinionMatters: "Your opinion is important to us",
    yourOpinionHelpsUsImprove: "Your opinion helps us improve our service.",
    comments: "Comments",
    thanksForRating: "Thanks for your rating!",
    sendRating: "Send Rating",
    availableTables: "Available Tables",
    noAvailableTables: "No available tables",
    allTablesOccupiedOrInactive: "All tables are occupied or inactive",
    selectTableToConnect: "Select a table to connect",
    youCanStartConversationDirectly: "You can start a conversation directly",
    availableForChat: "Available for chat",
    connect: "Connect",
    active: "Active",
    joinTable: "Join Table",
    orderNow: "Order Now",
    callWaiter: "Call Waiter"
  },
  chat: {
    startConversation: "Start the conversation!",
    sendFirstMessage: "Send the first message",
    typeMessage: "Type a message...",
    send: "Send",
    quickMessages: "Quick messages",
    hello: "Hello!",
    joinOurTable: "Join our table?",
    cheers: "Cheers!",
    everythingOk: "Everything ok?"
  },
  order: {
    makeOrder: "Make Order",
    yourOrder: "Your Order",
    yourCartIsEmpty: "Your cart is empty",
    confirmOrder: "Confirm Order"
  },
  customer: {
    customerInformation: "Customer Information",
    name: "Name",
    customerNamePlaceholder: "Customer Name",
    phone: "Phone",
    phoneNumberPlaceholder: "Phone number",
    sharedAccount: "Shared Account",
    sharedAccountDescription: "Your order will be added to the general table account",
    individualAccount: "Individual Account",
    individualAccountDescription: "A separate account will be created in your name"
  },
  password: {
    requiresPassword: "This table requires a password to access",
    password: "Password",
    enterPassword: "Enter the table's password",
    accessTable: "Access the Table"
  },
  rating: {
    howWouldYouRateOurService: "How would you rate our service?",
    selectRating: "Select a rating",
    tellUsAboutYourExperience: "Tell us about your experience...",
    characters: "characters",
    howDoYouWantToSendYourRating: "How do you want to send your rating?",
    anonymously: "Anonymously",
    leavingMyContactData: "Leaving my contact data"
  },
  menu: {
    barMenu: "Bar Menu",
    selectItemsToSendTo: "Select items to send to",
    noItemsAvailable: "No items available in the menu",
    sendOrder: "Send Order"
  },
  generalChat: {
    title: "General Chat",
    joinGeneralChat: "Join General Chat",
    howDoYouWantToAppear: "How do you want to appear in the chat?",
    withName: "With name",
    anonymous: "Anonymous",
    username: "Username",
    usernamePlaceholder: "Username",
    avatar: "Avatar",
    selectAvatar: "Select Avatar",
    changeAvatar: "Change Avatar",
    joinChat: "Join Chat",
    generalChat: "General Chat",
    online: "online",
    loadingMessages: "Loading messages...",
    youHaveBeenBanned: "You have been banned from the chat",
    bannedByAdmin: "You have been banned from the general chat by the administrator.",
    noMessagesYet: "No messages yet. Be the first to write!",
    youAreBanned: "You are banned from the chat",
    administrator: "Administrator",
    joinedChat: "joined the chat",
    leftChat: "left the chat",
    selectAvatarFirst: "Please select an avatar before joining the chat"
  }
}

type TableLanguage = 'es' | 'en'

interface TableTranslationContextType {
  language: TableLanguage
  setLanguage: (language: TableLanguage) => void
  t: (key: string) => string
}

const TableTranslationContext = createContext<TableTranslationContextType | undefined>(undefined)

export function TableTranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<TableLanguage>('es')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Cargar idioma guardado del localStorage solo en el cliente
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('table-language') as TableLanguage | null
      if (savedLanguage) {
        setLanguage(savedLanguage)
      }
      setIsInitialized(true)
    }
  }, [])

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = language === 'es' ? esTableTranslations : enTableTranslations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  const handleSetLanguage = (newLanguage: TableLanguage) => {
    console.log('🔄 Table language changing to:', newLanguage)
    setLanguage(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('table-language', newLanguage)
    }
  }

  return (
    <TableTranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </TableTranslationContext.Provider>
  )
}

export function useTableT() {
  const context = useContext(TableTranslationContext)
  if (context === undefined) {
    throw new Error('useTableT must be used within a TableTranslationProvider')
  }
  return context
}
