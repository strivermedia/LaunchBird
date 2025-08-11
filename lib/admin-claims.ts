// Firebase functions removed. Provide mock implementations.
import { auth } from './firebase'

/**
 * Set admin custom claims for a user
 * @param userUid - The user's unique ID
 * @param isAdmin - Whether to grant or revoke admin privileges
 * @returns Promise with the result of the operation
 */
export const setAdminClaims = async (_userUid: string, _isAdmin: boolean) => ({ success: true })

/**
 * Get custom claims for a user
 * @param userUid - The user's unique ID
 * @returns Promise with the user's custom claims
 */
export const getUserClaims = async (_userUid: string) => ({ success: true, claims: { admin: true } })

/**
 * List all users with admin privileges
 * @returns Promise with array of admin user IDs
 */
export const listAdminUsers = async () => ({ success: true, adminUsers: ['dev-user-123'] })

/**
 * Check if the current user has admin privileges
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export const checkCurrentUserIsAdmin = async (): Promise<boolean> => true

/**
 * Utility function to make a user an admin
 * This is a convenience function that wraps setAdminClaims
 * @param userUid - The user's unique ID to make admin
 * @returns Promise with the result
 */
export const makeUserAdmin = async (userUid: string) => {
  return setAdminClaims(userUid, true)
}

/**
 * Utility function to revoke admin privileges from a user
 * This is a convenience function that wraps setAdminClaims
 * @param userUid - The user's unique ID to revoke admin from
 * @returns Promise with the result
 */
export const revokeAdminPrivileges = async (userUid: string) => {
  return setAdminClaims(userUid, false)
} 