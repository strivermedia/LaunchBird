// Supabase authentication implementation
import { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
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
 * Client portal code interface
 */
export interface ClientPortalCode {
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
  organizationId: 'dev-org-123',
  organizationRole: 'owner',
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
      id: 'dev-user-123',
      email: 'dev@launchbird.com',
      email_confirmed_at: new Date().toISOString(),
      phone: undefined,
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      role: 'authenticated',
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User
  }
  
  if (!auth) {
    console.warn('Auth not initialized')
    return null
  }
  
  const { data: { user }, error } = await auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
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
  
  const user = await getCurrentUser()
  if (!user) {
    console.log('No current user found')
    return null
  }
  
  return getUserProfile(user.id)
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
): Promise<{ user: User | null; error: SupabaseAuthError | null }> => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  
  const { data, error } = await auth.signInWithPassword({
    email,
    password,
  })
  
  return {
    user: data.user,
    error
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
): Promise<{ user: User | null; error: SupabaseAuthError | null }> => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  
  const { data, error } = await auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        title,
        location,
      }
    }
  })
  
  if (data.user && !error) {
    // Create user profile in database
    await createUserProfile(data.user.id, {
      email,
      role,
      title,
      location,
    })
  }
  
  return {
    user: data.user,
    error
  }
}

/**
 * Sign out user
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  
  try {
    // Sign out from Supabase (clears cookies and localStorage)
    const { error } = await auth.signOut()
    if (error) {
      console.error('Supabase sign out error:', error)
      throw error
    }
    
    // Clear any additional local storage
    if (typeof window !== 'undefined') {
      // Clear theme preference if needed (optional)
      // localStorage.removeItem('theme')
    }
  } catch (error) {
    console.error('Error during sign out:', error)
    throw error
  }
}

/**
 * Send password reset email
 * @param email - User email
 * @returns Promise<void>
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  
  const { error } = await auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) {
    throw error
  }
}

/**
 * Sign in anonymously for client portal
 * @returns Promise<UserCredential>
 */
export const signInAnonymouslyForClient = async (): Promise<{ user: User | null; error: SupabaseAuthError | null }> => {
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  
  const { data, error } = await auth.signInAnonymously()
  
  return {
    user: data.user,
    error
  }
}

/**
 * Get user profile from Supabase
 * @param uid - User ID
 * @returns Promise<UserProfile | null>
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (DEV_MODE) {
    return getMockUser()
  }
  
  if (!db) {
    console.warn('Database not initialized')
    return null
  }
  
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', uid)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data ? {
    uid: (data as any).id,
    email: (data as any).email,
    role: (data as any).role,
    title: (data as any).title,
    jobTitle: (data as any).job_title,
    location: (data as any).location,
    profileImageUrl: (data as any).profile_image_url,
    theme: (data as any).theme,
    organizationId: (data as any).organization_id,
    organizationRole: (data as any).organization_role,
    invitedBy: (data as any).invited_by,
    joinedAt: (data as any).joined_at,
    createdAt: (data as any).created_at,
    updatedAt: (data as any).updated_at,
  } : null
}

/**
 * Update user profile
 * @param uid - User ID
 * @param updates - Profile updates
 * @returns Promise<void>
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { error } = await db
    .from('users')
    .update({
      title: updates.title,
      job_title: updates.jobTitle,
      location: updates.location,
      profile_image_url: updates.profileImageUrl,
      theme: updates.theme,
      organization_id: updates.organizationId,
      organization_role: updates.organizationRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', uid)
  
  if (error) {
    throw error
  }
}

/**
 * Validate client portal code
 * @param code - 4-character code
 * @param password - Optional password
 * @returns Promise<ClientPortalCode | null>
 */
export const validateClientPortalCode = async (
  code: string,
  password?: string
): Promise<ClientPortalCode | null> => {
  if (DEV_MODE) {
    return {
      code: code.toUpperCase(),
      projectId: 'dev-project-123',
      password,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      createdBy: 'dev-user-123',
    }
  }
  
  if (!db) {
    console.warn('Database not initialized')
    return null
  }
  
  const { data, error } = await db
    .from('client_portal_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error || !data) {
    return null
  }
  
  // Check password if required
  if ((data as any).password && (data as any).password !== password) {
    return null
  }
  
  return {
    code: (data as any).code,
    projectId: (data as any).project_id,
    password: (data as any).password,
    expiresAt: (data as any).expires_at,
    createdAt: (data as any).created_at,
    createdBy: (data as any).created_by,
  }
}

/**
 * Create client portal code
 * @param projectId - Project ID
 * @param password - Optional password
 * @param expiresInDays - Days until expiration (default: 30)
 * @returns Promise<string>
 */
export const createClientPortalCode = async (
  projectId: string,
  password?: string,
  expiresInDays: number = 30
): Promise<string> => {
  if (DEV_MODE) {
    return Math.random().toString(36).substring(2, 6).toUpperCase()
  }
  
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const code = Math.random().toString(36).substring(2, 6).toUpperCase()
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
  
  const { error } = await db
    .from('client_portal_codes')
    .insert({
      code,
      project_id: projectId,
      password,
      expires_at: expiresAt.toISOString(),
      created_by: (await getCurrentUser())?.id || 'system',
    })
  
  if (error) {
    throw error
  }
  
  return code
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
      return '/portal'
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
  if (!auth) {
    callback(null)
    return () => {}
  }
  
  const { data: { subscription } } = auth.onAuthStateChange((event: any, session: any) => {
    callback(session?.user || null)
  })
  return () => subscription.unsubscribe()
}

/**
 * Create user profile in database
 * @param uid - User ID
 * @param profileData - Profile data
 * @returns Promise<void>
 */
const createUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { error } = await db
    .from('users')
    .insert({
      id: uid,
      email: profileData.email,
      role: profileData.role,
      title: profileData.title,
      job_title: profileData.jobTitle,
      location: profileData.location,
      theme: profileData.theme || 'light',
      organization_id: profileData.organizationId,
      organization_role: profileData.organizationRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  
  if (error) {
    throw error
  }
}

/**
 * Update organization plan
 * @param organizationId - Organization ID
 * @param plan - New plan
 * @param userId - Current user ID for access control
 * @returns Promise<void>
 */
export const updateOrganizationPlan = async (
  organizationId: string,
  plan: 'free' | 'pro' | 'enterprise',
  userId: string
): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { error } = await db
    .from('organizations')
    .update({
      plan,
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId)
  
  if (error) {
    throw error
  }
}

/**
 * Create a new organization
 * @param name - Organization name
 * @param description - Organization description
 * @param userId - User ID creating the organization
 * @returns Promise<string> - Organization ID
 */
export const createOrganization = async (
  name: string,
  description: string,
  userId: string
): Promise<string> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { data, error } = await db
    .from('organizations')
    .insert([{
      name,
      description,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return (data as any)?.id || ''
}

/**
 * Get user's organization
 * @param userId - User ID
 * @returns Promise<any> - Organization data
 */
export const getUserOrganization = async (userId: string): Promise<any> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { data, error } = await db
    .from('users')
    .select(`
      organization_id,
      organization_role,
      organizations!inner(*)
    `)
    .eq('id', userId)
    .single()
  
  if (error || !data) {
    console.error('Error fetching user organization:', error)
    return null
  }
  
  return data.organizations
}

/**
 * Add user to organization
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param organizationRole - Role in organization
 * @returns Promise<void>
 */
export const addUserToOrganization = async (
  userId: string,
  organizationId: string,
  organizationRole: 'owner' | 'admin' | 'member' | 'client'
): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  
  const { error } = await db
    .from('users')
    .update({
      organization_id: organizationId,
      organization_role: organizationRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (error) {
    throw error
  }
}