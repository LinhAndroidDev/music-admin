import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

function validateFirebaseConfig() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const

  const missing = required.filter((key) => !import.meta.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Thiếu biến môi trường Firebase: ${missing.join(', ')}. Sao chép .env.example thành .env và điền giá trị.`,
    )
  }
}

validateFirebaseConfig()

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

/** Analytics — chỉ khởi tạo trên browser khi có measurementId */
export async function initAnalytics() {
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  if (!measurementId || typeof window === 'undefined') return null

  const supported = await isSupported()
  if (!supported) return null

  return getAnalytics(firebaseApp)
}
