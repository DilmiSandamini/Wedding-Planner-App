import { db } from './firebaseConfig'
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore'
import { Expense } from '@/types/budget'

export const subscribeToExpenses = (userId: string, callback: (expenses: Expense[]) => void) => {
  const q = query(collection(db, "expenses"), where("userId", "==", userId))

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expense))
    
    // Sort by creation date (newest first)
    expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    callback(expenses)
  })
}

export const addExpense = async (userId: string, data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'paid' | 'actualCost'>) => {
  await addDoc(collection(db, "expenses"), {
    userId,
    ...data,
    actualCost: 0,
    paid: false,
    createdAt: new Date().toISOString()
  })
}

export const updateExpense = async (id: string, data: Partial<Expense>) => {
  await updateDoc(doc(db, "expenses", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export const deleteExpense = async (id: string) => {
  await deleteDoc(doc(db, "expenses", id))
}