import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  UserCredential,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'

// Development mode flag - set to true to bypass authentication
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Completely disable Firebase for now
const DISABLE_FIREBASE = true

/**
 * User role types
 */
export type UserRole = 'admin' | 'team_member' | 'client'

/**
 * User profile interface
 */
export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  title?: string
  location?: string
  theme?: 'light' | 'dark'
  organizationId?: string
  organizationRole?: 'owner' | 'admin' | 'member' | 'client'
  invitedBy?: string
  joinedAt?: any
  createdAt: any
  updatedAt: any
}

/**
 * Client view code interface
 */
export interface ClientViewCode {
  code: string
  projectId: string
  password?: string
  expiresAt: any
  createdAt: any
  createdBy: string
}

/**
 * Authentication error types
 */
export type AuthError = {
  code: string
  message: string
}

/**
 * Get mock user for development mode
 * @returns Mock user profile
 */
const getMockUser = (): UserProfile => ({
  uid: 'dev-user-123',
  email: 'dev@launchbird.com',
  role: 'admin',
  title: 'Developer',
  location: 'Development',
  theme: 'light',
  createdAt: new Date(),
  updatedAt: new Date(),
})

/**
 * Check if development mode is enabled
 * @returns boolean
 */
export const isDevMode = (): boolean => DEV_MODE || DISABLE_FIREBASE

/**
 * Get current user (with dev mode support)
 * @returns Promise<User | null>
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return a mock user for development
    return {
      uid: 'dev-user-123',
      email: 'dev@launchbird.com',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'dev-token',
      getIdTokenResult: async () => ({ 
        authTime: '', 
        issuedAtTime: '', 
        signInProvider: null, 
        signInSecondFactor: null,
        claims: {}, 
        expirationTime: '', 
        token: 'dev-token' 
      }),
      reload: async () => {},
      toJSON: () => ({}),
      displayName: 'Developer',
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
    } as User
  }
  
  return auth?.currentUser || null
}

/**
 * Get current user profile (with dev mode support)
 * @returns Promise<UserProfile | null>
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    console.log('Development mode enabled - returning mock user')
    return getMockUser()
  }
  
  if (!auth) {
    console.warn('Firebase Auth not initialized')
    return null
  }
  
  const user = auth.currentUser
  if (!user) {
    console.log('No current user found')
    return null
  }
  
  return getUserProfile(user.uid)
}

/**
 * Sign in with email and password
 * @param email - User email
 * @param password - User password
 * @param rememberMe - Whether to remember the user
 * @returns Promise<UserCredential>
 */
export const signInWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<UserCredential> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    throw new Error('Authentication is disabled in development mode')
  }
  
  if (!auth) {
    throw new Error('Firebase Auth is not initialized')
  }
  
  try {
    if (rememberMe) {
      // Set persistence to LOCAL for "Remember Me"
      await setPersistence(auth, browserLocalPersistence)
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Create new user account
 * @param email - User email
 * @param password - User password
 * @param role - User role
 * @param title - User title
 * @param location - User location
 * @returns Promise<UserCredential>
 */
export const createUserAccount = async (
  email: string,
  password: string,
  role: UserRole,
  title?: string,
  location?: string
): Promise<UserCredential> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    throw new Error('Authentication is disabled in development mode')
  }
  
  if (!auth || !db) {
    throw new Error('Firebase is not initialized')
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      role,
      title,
      location,
      theme: 'light',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile)
    
    return result
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Sign out user
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    throw new Error('Authentication is disabled in development mode')
  }
  
  if (!auth) {
    throw new Error('Firebase Auth is not initialized')
  }
  
  try {
    await signOut(auth)
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Send password reset email
 * @param email - User email
 * @returns Promise<void>
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    throw new Error('Authentication is disabled in development mode')
  }
  
  if (!auth) {
    throw new Error('Firebase Auth is not initialized')
  }
  
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Sign in anonymously for client view
 * @returns Promise<UserCredential>
 */
export const signInAnonymouslyForClient = async (): Promise<UserCredential> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    throw new Error('Authentication is disabled in development mode')
  }
  
  if (!auth) {
    throw new Error('Firebase Auth is not initialized')
  }
  
  try {
    return await signInAnonymously(auth)
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Get user profile from Firestore
 * @param uid - User ID
 * @returns Promise<UserProfile | null>
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    return getMockUser()
  }
  
  if (!db) {
    console.warn('Firestore is not initialized')
    return null
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile
    }
    
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Update user profile
 * @param uid - User ID
 * @param updates - Profile updates
 * @returns Promise<void>
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    console.log('Profile update in dev mode:', { uid, updates })
    return
  }
  
  if (!db) {
    throw new Error('Firestore is not initialized')
  }
  
  try {
    await setDoc(
      doc(db, 'users', uid),
      { ...updates, updatedAt: serverTimestamp() },
      { merge: true }
    )
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Validate client view code
 * @param code - 4-character code
 * @param password - Optional password
 * @returns Promise<ClientViewCode | null>
 */
export const validateClientViewCode = async (
  code: string,
  password?: string
): Promise<ClientViewCode | null> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return a mock client view code for development
    return {
      code: code.toUpperCase(),
      projectId: 'dev-project-123',
      password,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      createdBy: 'dev-user-123',
    }
  }
  
  if (!db) {
    console.warn('Firestore is not initialized')
    return null
  }
  
  try {
    const codesRef = collection(db, 'clientViewCodes')
    const q = query(codesRef, where('code', '==', code.toUpperCase()))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const codeDoc = querySnapshot.docs[0]
    const codeData = codeDoc.data() as ClientViewCode
    
    // Check if code has expired
    if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
      return null
    }
    
    // Check password if required
    if (codeData.password && codeData.password !== password) {
      return null
    }
    
    return codeData
  } catch (error) {
    console.error('Error validating client view code:', error)
    return null
  }
}

/**
 * Create client view code
 * @param projectId - Project ID
 * @param password - Optional password
 * @param expiresInDays - Days until expiration (default: 30)
 * @returns Promise<string>
 */
export const createClientViewCode = async (
  projectId: string,
  password?: string,
  expiresInDays: number = 30
): Promise<string> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Generate random 4-character alphanumeric code for development
    const code = Math.random().toString(36).substring(2, 6).toUpperCase()
    console.log('Created client view code in dev mode:', code)
    return code
  }
  
  if (!db || !auth) {
    throw new Error('Firebase is not initialized')
  }
  
  try {
    // Generate random 4-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    
    const codeData: Omit<ClientViewCode, 'code'> = {
      projectId,
      password,
      expiresAt,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'system',
    }
    
    await setDoc(doc(db, 'clientViewCodes', code), codeData)
    
    return code
  } catch (error) {
    throw error as AuthError
  }
}

/**
 * Get redirect path based on user role
 * @param role - User role
 * @returns string
 */
export const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'team_member':
      return '/tasks'
    case 'client':
      return '/view'
    default:
      return '/dashboard'
  }
}

/**
 * Auth state listener
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // In dev mode, immediately call with mock user and return no-op unsubscribe
    const mockUser = {
      uid: 'dev-user-123',
      email: 'dev@launchbird.com',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'dev-token',
      getIdTokenResult: async () => ({ 
        authTime: '', 
        issuedAtTime: '', 
        signInProvider: null, 
        signInSecondFactor: null,
        claims: {}, 
        expirationTime: '', 
        token: 'dev-token' 
      }),
      reload: async () => {},
      toJSON: () => ({}),
      displayName: 'Developer',
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
    } as User
    
    callback(mockUser)
    return () => {} // No-op unsubscribe function
  }
  
  if (!auth) {
    console.warn('Firebase Auth is not initialized')
    callback(null)
    return () => {} // No-op unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback)
} 