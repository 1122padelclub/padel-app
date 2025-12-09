export {
  db,
  auth,
  realtimeDb,
} from "@/lib/firebase"

export {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"

export {
  ref,
  get,
  onValue,
  off,
  push,
  set,
  update,
  remove,
} from "firebase/database"