import { db } from './firebaseConfig'
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore'
import { Task } from '@/types/task'

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, "tasks"), where("userId", "==", userId))

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task))
    
    // Sort by Due Date (Earliest first)
    tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    
    callback(tasks)
  })
}

export const addTask = async (userId: string, data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => {
  await addDoc(collection(db, "tasks"), {
    userId,
    ...data,
    completed: false,
    createdAt: new Date().toISOString()
  })
}

export const updateTask = async (id: string, data: Partial<Task>) => {
  await updateDoc(doc(db, "tasks", id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export const deleteTask = async (id: string) => {
  await deleteDoc(doc(db, "tasks", id))
}