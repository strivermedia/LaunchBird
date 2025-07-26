import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Development mode flag - set to true to bypass authentication
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

/**
 * Firebase configuration object
 * Replace with your actual Firebase config values
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dev-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dev-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dev-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dev-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dev-app-id',
}

/**
 * Initialize Firebase app only if not in dev mode or if Firebase config is provided
 */
let app: any = null
let auth: any = null
let db: any = null

if (!DEV_MODE || (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_firebase_api_key_here')) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)

    /**
     * Connect to Firebase emulators in development
     */
    if (process.env.NODE_ENV === 'development' && !DEV_MODE) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099')
        connectFirestoreEmulator(db, 'localhost', 8080)
      } catch (error) {
        console.log('Firebase emulators already connected')
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
}

/**
 * Export Firebase instances (may be null in dev mode)
 */
export { auth, db }
export default app 