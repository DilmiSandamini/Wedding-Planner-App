import { db } from './firebaseConfig'
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, orderBy 
} from 'firebase/firestore'
import { ChecklistItem, PriorityLevel } from '@/types/checklist'

// Listen to Checklist Items (Real-time)
export const subscribeToChecklist = (userId: string, callback: (items: ChecklistItem[]) => void) => {
  const q = query(
    collection(db, "checklist_items"), 
    where("userId", "==", userId)
    // Note: Create a composite index in Firebase Console if sorting gives an error
    // orderBy("createdAt", "desc") 
  )

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChecklistItem))
    
    // Client-side sorting to avoid index issues initially
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    callback(items)
  })
}

// Add Item
export const addChecklistItem = async (userId: string, title: string, category: string, priority: PriorityLevel) => {
  await addDoc(collection(db, "checklist_items"), {
    userId,
    title,
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  })
}

// Update Item
export const updateChecklistItem = async (id: string, data: Partial<ChecklistItem>) => {
  await updateDoc(doc(db, "checklist_items", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

// Delete Item
export const deleteChecklistItem = async (id: string) => {
  await deleteDoc(doc(db, "checklist_items", id))
}