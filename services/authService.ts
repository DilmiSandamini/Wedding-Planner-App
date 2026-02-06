import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebaseConfig"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const logout = async () => {
  await signOut(auth)
  AsyncStorage.clear()
  return
}

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCred.user, {
    displayName: name,
    photoURL: ""
  })

  setDoc(doc(db, "users", userCred.user.uid), {
    name,
    role: "",
    email,
    createdAt: new Date()
  })
  return userCred.user
}