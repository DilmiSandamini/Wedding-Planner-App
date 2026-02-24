import { createContext, ReactNode, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from "@/services/firebaseConfig"
import { logout as authLogout } from "@/services/authService"
import { useLoader } from "@/hooks/useLoader"

interface AuthContextType {
  user: User | null
  loading: boolean
  isSetupComplete: boolean | null
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSetupComplete: null,
  logout: async () => {}
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const loaderContext = useLoader()
  const showLoader = loaderContext?.showLoader || (() => console.warn("showLoader not found"))
  const hideLoader = loaderContext?.hideLoader || (() => console.warn("hideLoader not found"))

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)

  useEffect(() => {
    if (!auth || !db) {
      console.error("Firebase auth or db is not initialized properly in firebaseConfig!")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        try {
          const docRef = doc(db, 'wedding_plans', usr.uid)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists() && docSnap.data()?.isSetupComplete) {
            setIsSetupComplete(true)
          } else {
            setIsSetupComplete(false)
          }
        } catch (error) {
          console.error("Firestore Error in AuthContext:", error)
          setIsSetupComplete(false)
        }
        setUser(usr)
      } else {
        setUser(null)
        setIsSetupComplete(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      showLoader()
      await authLogout()
      setUser(null)
      setIsSetupComplete(null)
    } catch (error) {
      console.error("Logout Error:", error)
    } finally {
      hideLoader()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isSetupComplete, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}