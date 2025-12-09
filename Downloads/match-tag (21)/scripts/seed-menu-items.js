const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Configuración de Firebase (usa las mismas variables de entorno)
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "match-tag-v0.firebaseapp.com",
  projectId: "match-tag-v0",
  storageBucket: "match-tag-v0.appspot.com",
  messagingSenderId: "954838217281",
  appId: "1:954838217281:web:f94e51d094fb821eef4cc0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const barId = "F1It58glCbBLTVwYVOjM";

// Items de menú de prueba
const menuItems = [
  // Bebidas
  {
    barId,
    categoryId: "bebidas", // Asumiendo que existe esta categoría
    name: "Cerveza Corona",
    description: "Cerveza mexicana refrescante",
    price: 15000,
    isAvailable: true,
    imageUrl: null,
    order: 1,
    createdAt: new Date(),
  },
  {
    barId,
    categoryId: "bebidas",
    name: "Cerveza Heineken",
    description: "Cerveza holandesa premium",
    price: 18000,
    isAvailable: true,
    imageUrl: null,
    order: 2,
    createdAt: new Date(),
  },
  {
    barId,
    categoryId: "bebidas",
    name: "Coca Cola",
    description: "Refresco de cola",
    price: 5000,
    isAvailable: true,
    imageUrl: null,
    order: 3,
    createdAt: new Date(),
  },
  // Comidas
  {
    barId,
    categoryId: "comidas", // Asumiendo que existe esta categoría
    name: "Hamburguesa Clásica",
    description: "Hamburguesa con carne, lechuga, tomate y queso",
    price: 25000,
    isAvailable: true,
    imageUrl: null,
    order: 1,
    createdAt: new Date(),
  },
  {
    barId,
    categoryId: "comidas",
    name: "Pizza Margherita",
    description: "Pizza con tomate, mozzarella y albahaca",
    price: 30000,
    isAvailable: true,
    imageUrl: null,
    order: 2,
    createdAt: new Date(),
  },
  {
    barId,
    categoryId: "comidas",
    name: "Ensalada César",
    description: "Ensalada con lechuga, pollo, queso parmesano y aderezo césar",
    price: 20000,
    isAvailable: true,
    imageUrl: null,
    order: 3,
    createdAt: new Date(),
  },
  // Postres
  {
    barId,
    categoryId: "postres", // Asumiendo que existe esta categoría
    name: "Tiramisú",
    description: "Postre italiano con café y mascarpone",
    price: 12000,
    isAvailable: true,
    imageUrl: null,
    order: 1,
    createdAt: new Date(),
  },
  {
    barId,
    categoryId: "postres",
    name: "Brownie con Helado",
    description: "Brownie de chocolate con helado de vainilla",
    price: 15000,
    isAvailable: true,
    imageUrl: null,
    order: 2,
    createdAt: new Date(),
  }
];

async function seedMenuItems() {
  try {
    console.log("🌱 Iniciando seed de items del menú...");
    
    // Crear categorías si no existen
    const categories = [
      { id: "bebidas", name: "Bebidas", order: 1 },
      { id: "comidas", name: "Comidas", order: 2 },
      { id: "postres", name: "Postres", order: 3 }
    ];
    
    for (const category of categories) {
      const categoryRef = doc(db, "bars", barId, "menuCategories", category.id);
      await setDoc(categoryRef, {
        barId,
        name: category.name,
        order: category.order,
        createdAt: new Date(),
      });
      console.log(`✅ Categoría creada: ${category.name}`);
    }
    
    // Crear items del menú
    for (const item of menuItems) {
      const itemsRef = collection(db, "bars", barId, "menuItems");
      await addDoc(itemsRef, item);
      console.log(`✅ Item creado: ${item.name}`);
    }
    
    console.log("🎉 Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error en seed:", error);
  }
}

seedMenuItems();



