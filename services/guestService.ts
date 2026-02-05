import { db } from './firebaseConfig'
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore'
import { Guest } from '@/types/guest'

export const subscribeToGuests = (userId: string, callback: (guests: Guest[]) => void) => {
  const q = query(collection(db, "guests"), where("userId", "==", userId))

  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Guest))
    
    // Sort by name
    guests.sort((a, b) => a.name.localeCompare(b.name))
    
    callback(guests)
  })
}

export const addGuest = async (userId: string, data: Omit<Guest, 'id' | 'userId' | 'createdAt' | 'invited' | 'confirmed' | 'attending'>) => {
  await addDoc(collection(db, "guests"), {
    userId,
    ...data,
    invited: true,
    confirmed: false,
    attending: false,
    createdAt: new Date().toISOString()
  })
}

export const updateGuest = async (id: string, data: Partial<Guest>) => {
  await updateDoc(doc(db, "guests", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export const deleteGuest = async (id: string) => {
  await deleteDoc(doc(db, "guests", id))
}