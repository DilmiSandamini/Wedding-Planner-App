import { initializeApp } from "firebase/app"
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCLbTLLMoQGbHYliTk25fKjS0jINjwgEbI",
  authDomain: "wedding-planner-app-729f6.firebaseapp.com",
  projectId: "wedding-planner-app-729f6",
  storageBucket: "wedding-planner-app-729f6.firebasestorage.app",
  messagingSenderId: "443667969058",
  appId: "1:443667969058:web:ad13f394623f0d3ec0467b",
  measurementId: "G-2M3JM809BQ"
};

const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

export const db = getFirestore(app)
