// Script para actualizar las reglas de Firestore
// Este script te ayudará a configurar las reglas correctas para las mesas

console.log(`
🔥 ACTUALIZACIÓN DE REGLAS DE FIRESTORE

Para solucionar el error de permisos en las mesas, necesitas actualizar las reglas en Firebase:

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto "match-tag-v0"
3. Ve a "Firestore Database" en el menú lateral
4. Haz clic en la pestaña "Reglas"
5. Reemplaza las reglas actuales con estas reglas actualizadas:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Bars collection - super_admins can CRUD, bar_admins can read their assigned bar
    match /bars/{barId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
      allow read, create, update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'bar_admin';
      
      // Menu categories subcollection
      match /menuCategories/{categoryId} {
        allow read: if true; // Public read for menu display
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }
      
      // Menu items subcollection  
      match /menuItems/{itemId} {
        allow read: if true; // Public read for menu display
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Reservations subcollection
      match /reservations/{reservationId} {
        allow read: if true; // Public read for checking availability
        allow create: if true; // Guests can create reservations
        allow update, delete: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Tables subcollection
      match /tables/{tableId} {
        allow read: if true; // Public read for table access
        allow create, update, delete: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Theme config subcollection
      match /themeConfig/{configId} {
        allow read: if true; // Public read for theme access
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Customers subcollection
      match /customers/{customerId} {
        allow read: if true; // Permitir lectura pública temporal
        allow create: if true; // Permitir que usuarios no autenticados creen clientes
        allow update, delete: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // CRM Contacts subcollection - Sistema agnóstico de contactos
      match /crm_contacts/{contactId} {
        allow read: if true; // Lectura pública para panel CRM
        allow create: if true; // Permitir creación desde pedidos sin autenticación
        allow update: if true; // Permitir actualización automática de estadísticas
        allow delete: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Reviews subcollection
      match /reviews/{reviewId} {
        allow read: if true; // Public read for reviews
        allow create: if true; // Guests can create reviews
        allow update, delete: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Theme config subcollection
      match /themeConfig/{configId} {
        allow read: if true; // Public read for theme
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Announcements subcollection
      match /announcements/{announcementId} {
        allow read: if true; // Public read for announcements
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Integration logs subcollection
      match /integration_logs/{logId} {
        allow read: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
        allow write: if request.auth != null && 
          (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == barId));
      }

      // Table chats subcollection
      match /tableChats/{chatId} {
        allow read, write: if true; // Acceso público para chats de mesa
      }

      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if true; // Acceso público para mensajes
      }

      // Legacy chat structure
      match /chats/{tableId}/messages/{messageId} {
        allow read, write: if true; // Acceso público para chats internos (legacy)
      }
    }

    match /tables/{tableId} {
      allow read: if true; // Public read for table access
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == request.resource.data.barId);
      allow update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == resource.data.barId);
    }

    match /orders/{orderId} {
      allow create: if true; // Guests can create orders
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
         (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'bar_admin' &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == resource.data.barId));
      allow update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' ||
         (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'bar_admin' &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.barId == resource.data.barId));
    }
  }
}

6. Haz clic en "Publicar" para guardar los cambios

Una vez que hagas esto, las mesas deberían funcionar correctamente sin errores de permisos.

⚠️  IMPORTANTE: Estas reglas permiten acceso público de lectura para desarrollo.
    Para producción, necesitarás reglas más seguras con autenticación.
`)

console.log(`
🔍 DIAGNÓSTICO ADICIONAL:

Si el problema persiste después de actualizar las reglas, verifica:

1. Que las reglas se hayan aplicado correctamente en Firebase Console
2. Que no haya errores de sintaxis en las reglas
3. Que el barId y tableId sean válidos
4. Que la conexión a Firestore esté funcionando

Para verificar la conexión, puedes usar la página de diagnóstico:
https://match-tag-21-26ednyq33-gibracompany-3588s-projects.vercel.app/test-firebase
`)

