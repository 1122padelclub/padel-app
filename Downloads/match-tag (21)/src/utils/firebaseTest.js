// Utilidad para probar conexión a Firebase
export async function testFirebaseConnection() {
  try {
    const { getDatabase, ref, set, get } = await import('firebase/database');
    const { getFirebaseRealtimeDB } = await import('@/lib/firebase');
    
    const realtimeDb = getFirebaseRealtimeDB();
    if (!realtimeDb) {
      throw new Error('Realtime Database no está disponible');
    }
    
    // Probar escritura
    const testRef = ref(realtimeDb, 'test/connection');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Test connection successful'
    });
    
    console.log('✅ Firebase Realtime Database funcionando');
    return true;
    
  } catch (error) {
    console.error('❌ Error en Firebase Realtime Database:', error);
    return false;
  }
}

// Función para crear datos de prueba
export async function createTestData(barId, tableId) {
  try {
    const { getDatabase, ref, set } = await import('firebase/database');
    const { getFirebaseRealtimeDB } = await import('@/lib/firebase');
    
    const realtimeDb = getFirebaseRealtimeDB();
    if (!realtimeDb) {
      throw new Error('Realtime Database no está disponible');
    }
    
    // Crear chat de prueba
    const chatId = `${tableId}-test`;
    const chatRef = ref(realtimeDb, `chats/${barId}/${chatId}`);
    
    await set(chatRef, {
      barId: barId,
      tableIds: [tableId, 'test-table'],
      tableNumbers: [1, 2],
      isActive: true,
      createdAt: Date.now(),
      lastMessage: 'Chat de prueba creado',
      lastMessageAt: Date.now()
    });
    
    // Crear mensaje de prueba
    const messageRef = ref(realtimeDb, `messages/${barId}/${chatId}/test-message`);
    
    await set(messageRef, {
      text: 'Mensaje de prueba',
      senderId: 'test-user',
      timestamp: Date.now(),
      senderTable: tableId,
      chatId: chatId,
      barId: barId,
      type: 'text',
      senderTableNumber: 1
    });
    
    console.log('✅ Datos de prueba creados');
    return true;
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    return false;
  }
}











