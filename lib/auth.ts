// Supabase removed. Provide stubs and allow full access without auth
type User = any
type UserCredential = any
import { auth, db } from './platform'

// Development mode flag - set to true to bypass authentication
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

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
  jobTitle?: string
  location?: string
  profileImageUrl?: string
  theme?: 'light' | 'dark'
  organizationId?: string
  organizationRole?: 'owner' | 'admin' | 'member' | 'client'
  invitedBy?: string
  joinedAt?: any
  createdAt: any
  updatedAt: any
}

/**
 * Client profile code interface
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
export const isDevMode = (): boolean => DEV_MODE

/**
 * Get current user (with dev mode support)
 * @returns Promise<User | null>
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (DEV_MODE) {
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
  // Auth is disabled
  return null
}

/**
 * Get current user profile (with dev mode support)
 * @returns Promise<UserProfile | null>
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  if (DEV_MODE) {
    console.log('Development mode enabled - returning mock user')
    return getMockUser()
  }
  
  if (!auth) {
    console.warn('Auth not initialized')
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
  _email: string,
  _password: string,
  _rememberMe: boolean = false
): Promise<UserCredential> => {
  throw new Error('Authentication is disabled')
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
  _email: string,
  _password: string,
  _role: UserRole,
  _title?: string,
  _location?: string
): Promise<UserCredential> => {
  throw new Error('Authentication is disabled')
}

/**
 * Sign out user
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {}

/**
 * Send password reset email
 * @param email - User email
 * @returns Promise<void>
 */
export const sendPasswordReset = async (_email: string): Promise<void> => {}

/**
 * Sign in anonymously for client profile
 * @returns Promise<UserCredential>
 */
export const signInAnonymouslyForClient = async (): Promise<UserCredential> => {
  throw new Error('Authentication is disabled')
}

/**
 * Get user profile from Firestore
 * @param uid - User ID
 * @returns Promise<UserProfile | null>
 */
export const getUserProfile = async (_uid: string): Promise<UserProfile | null> => getMockUser()

/**
 * Update user profile
 * @param uid - User ID
 * @param updates - Profile updates
 * @returns Promise<void>
 */
export const updateUserProfile = async (_uid: string, _updates: Partial<UserProfile>): Promise<void> => {}

/**
 * Validate client profile code
 * @param code - 4-character code
 * @param password - Optional password
 * @returns Promise<ClientViewCode | null>
 */
export const validateClientViewCode = async (
  code: string,
  password?: string
): Promise<ClientViewCode | null> => ({
  code: code.toUpperCase(),
  projectId: 'dev-project-123',
  password,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  createdBy: 'dev-user-123',
})

/**
 * Create client profile code
 * @param projectId - Project ID
 * @param password - Optional password
 * @param expiresInDays - Days until expiration (default: 30)
 * @returns Promise<string>
 */
export const createClientViewCode = async (): Promise<string> => Math.random().toString(36).substring(2, 6).toUpperCase()

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
export const onAuthStateChange = (callback: (user: User | null) => void) => { callback(null); return () => {} }