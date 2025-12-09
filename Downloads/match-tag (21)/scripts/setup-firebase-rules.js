// Script para configurar las reglas de Firebase Realtime Database
// Este script debe ejecutarse para permitir que los usuarios puedan enviar mensajes

console.log("🔧 Configurando reglas de Firebase Realtime Database...")

const firebaseRules = {
  rules: {
    chats: {
      $chatId: {
        ".read": true,
        ".write": true,
        messages: {
          $messageId: {
            ".validate": "newData.hasChildren(['text', 'senderId', 'timestamp', 'senderTable'])",
          },
        },
      },
    },
    connections: {
      ".read": true,
      ".write": true,
    },
    tables: {
      ".read": true,
      ".write": true,
    },
  },
}

console.log("📋 Reglas de Firebase que deben aplicarse:")
console.log(JSON.stringify(firebaseRules, null, 2))

console.log("\n🚀 Para aplicar estas reglas:")
console.log("1. Ve a Firebase Console: https://console.firebase.google.com/")
console.log("2. Selecciona tu proyecto: match-tag-v0")
console.log("3. Ve a 'Realtime Database' > 'Rules'")
console.log("4. Reemplaza las reglas actuales con las reglas mostradas arriba")
console.log("5. Haz clic en 'Publish'")

console.log("\n✅ Una vez aplicadas las reglas, los mensajes deberían enviarse correctamente")
