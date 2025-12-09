// Script para inicializar el super admin en Firestore
// Ejecutar con: node scripts/init-super-admin.js

const admin = require("firebase-admin")

// Configurar Firebase Admin SDK
// Reemplazar con tu configuración de Firebase
const serviceAccount = {
  // Agregar aquí las credenciales del service account
  // o usar variables de entorno
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
const auth = admin.auth()

async function createSuperAdmin() {
  try {
    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email: "superadmin@matchtag.com",
      password: "SuperAdmin123!",
      emailVerified: true,
    })

    console.log("Usuario creado en Firebase Auth:", userRecord.uid)

    // Crear documento en Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: "superadmin@matchtag.com",
      role: "super_admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log("Super admin creado exitosamente")
    console.log("Email: superadmin@matchtag.com")
    console.log("Password: SuperAdmin123!")

    process.exit(0)
  } catch (error) {
    console.error("Error creando super admin:", error)
    process.exit(1)
  }
}

createSuperAdmin()
