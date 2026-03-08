/**
 * Authentication Middleware
 * Provides authentication checks and redirects for protected routes
 */

import { auth } from './platform'

/**
 * Check if user is authenticated
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user }, error } = await auth.getUser()
    return !!user && !error
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Get the current authenticated user
 * @returns Promise<User | null>
 */
export async function getAuthenticatedUser() {
  try {
    const { data: { user }, error } = await auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/reset-password',
  '/portal', // Client portal pages
]

/**
 * Check if a path is a public route
 * @param pathname - The pathname to check
 * @returns boolean
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

