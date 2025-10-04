/**
 * Organization Management Library
 * Handles organization-specific operations with local storage for development
 */

import { OrganizationStorage } from './localStorage'
import type { Organization } from '@/types'
import { db } from './platform'

/**
 * Get organization by ID
 * @param organizationId - Organization ID
 * @param userId - Current user ID for access control
 * @returns Promise<Organization | null>
 */
export async function getOrganization(
  organizationId: string,
  userId: string
): Promise<Organization | null> {
  try {
    return OrganizationStorage.getOrganization(organizationId)
  } catch (error) {
    console.error('Error fetching organization:', error)
    throw new Error('Failed to fetch organization')
  }
}

/**
 * Get organization members
 * @param organizationId - Organization ID
 * @param userId - Current user ID for access control
 * @returns Promise<OrganizationMember[]>
 */
export async function getOrganizationMembers(
  organizationId: string,
  userId: string
): Promise<any[]> {
  try {
    return OrganizationStorage.getOrganizationMembers(organizationId)
  } catch (error) {
    console.error('Error fetching organization members:', error)
    throw new Error('Failed to fetch organization members')
  }
}

/**
 * Update organization
 * @param organizationId - Organization ID
 * @param updates - Update data
 * @param userId - Current user ID for access control
 * @returns Promise<Organization>
 */
export async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>,
  userId: string
): Promise<Organization> {
  try {
    const updatedOrganization = await OrganizationStorage.updateOrganization(organizationId, updates)
    if (!updatedOrganization) {
      throw new Error('Organization not found')
    }
    return updatedOrganization
  } catch (error) {
    console.error('Error updating organization:', error)
    throw new Error('Failed to update organization')
  }
}

/**
 * Remove user from organization
 * @param userId - User ID to remove
 * @param organizationId - Organization ID
 * @param currentUserId - Current user ID for access control
 * @returns Promise<void>
 */
export async function removeUserFromOrganization(
  userId: string,
  organizationId: string,
  currentUserId: string
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }

    const { error } = await db
      .from('users')
      .update({
        organization_id: null,
        organization_role: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error removing user from organization:', error)
    throw new Error('Failed to remove user from organization')
  }
}

/**
 * Update user's organization role
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param newRole - New organization role
 * @param currentUserId - Current user ID for access control
 * @returns Promise<void>
 */
export async function updateUserOrganizationRole(
  userId: string,
  organizationId: string,
  newRole: 'owner' | 'admin' | 'member' | 'client',
  currentUserId: string
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }

    const { error } = await db
      .from('users')
      .update({
        organization_role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
  } catch (error) {
    console.error('Error updating user organization role:', error)
    throw new Error('Failed to update user organization role')
  }
}

/**
 * Get organization statistics
 * @param organizationId - Organization ID
 * @param userId - Current user ID for access control
 * @returns Promise<object>
 */
export async function getOrganizationStats(
  organizationId: string,
  userId: string
): Promise<{
  totalMembers: number
  totalProjects: number
  totalClients: number
  activeProjects: number
  completedProjects: number
}> {
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }

    // Get member count
    const { count: memberCount } = await db
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Get project counts
    const { count: totalProjects } = await db
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    const { count: activeProjects } = await db
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    const { count: completedProjects } = await db
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'completed')

    // Get client count
    const { count: totalClients } = await db
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    return {
      totalMembers: memberCount || 0,
      totalProjects: totalProjects || 0,
      totalClients: totalClients || 0,
      activeProjects: activeProjects || 0,
      completedProjects: completedProjects || 0
    }
  } catch (error) {
    console.error('Error fetching organization stats:', error)
    throw new Error('Failed to fetch organization statistics')
  }
}