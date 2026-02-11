import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'
import { WeddingPlan } from '@/types/weddingdetails'

// Save or Update Plan
export const saveWeddingPlan = async (userId: string, data: Partial<WeddingPlan>) => {
  try {
    const planRef = doc(db, 'wedding_plans', userId)
    const docSnap = await getDoc(planRef)
    
    const weddingData: WeddingPlan = {
      userId,
      planName: data.planName || '',
      coupleName: data.coupleName || '',
      weddingDate: data.weddingDate || new Date().toISOString(),
      budget: data.budget || '',
      guests: Number(data.guests) || 0, 
      location: data.location || '',
      isSetupComplete: true, 
      updatedAt: new Date().toISOString(),
      ...(docSnap.exists() ? {} : { createdAt: new Date().toISOString() })
    }

    await setDoc(planRef, weddingData, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving wedding plan:', error)
    throw error
  }
}

// Get Plan
export const getWeddingPlan = async (userId: string): Promise<WeddingPlan | null> => {
  try {
    const docRef = doc(db, 'wedding_plans', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as WeddingPlan
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching wedding plan:', error)
    throw error
  }
}