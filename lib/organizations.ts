// Firebase removed; return mock organizations and no-op updates
import { db } from './firebase'
import type { 
  Organization, 
  OrganizationSettings, 
  OrganizationInvitation,
  OrganizationPlan,
  OrganizationRole 
} from '@/types'

/**
 * Create a new organization
 * @param name - Organization name
 * @param ownerId - User ID of the organization owner
 * @param settings - Optional custom settings
 * @returns Promise<string> - Organization ID
 */
export const createOrganization = async (
  name: string,
  ownerId: string,
  _settings?: Partial<OrganizationSettings>
): Promise<string> => 'org-' + Math.random().toString(36).slice(2, 8)

/**
 * Get organization by ID
 * @param organizationId - Organization ID
 * @returns Promise<Organization | null>
 */
export const getOrganization = async (organizationId: string): Promise<Organization | null> => ({
  id: organizationId,
  name: 'Acme Corp',
  slug: 'acme-corp',
  plan: 'pro',
  members: ['user-1', 'user-2'],
  settings: {
    branding: { primaryColor: '#7c3aed', companyName: 'Acme Corp' },
    features: { clientAccess: true, customDomains: false, advancedAnalytics: true, timeTracking: true, fileStorage: true },
    limits: { maxProjects: 50, maxTeamMembers: 25, maxStorage: 1000, maxClients: 100 },
    notifications: { emailUpdates: true, slackIntegration: false, clientNotifications: true },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
})

/**
 * Get organization by slug
 * @param slug - Organization slug
 * @returns Promise<Organization | null>
 */
export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> =>
  slug === 'acme-corp' ? await getOrganization('org-1') : null

/**
 * Get user's organization
 * @param userId - User ID
 * @returns Promise<Organization | null>
 */
export const getUserOrganization = async (_userId: string): Promise<Organization | null> => getOrganization('org-1')

/**
 * Update organization settings
 * @param organizationId - Organization ID
 * @param updates - Settings updates
 * @returns Promise<void>
 */
export const updateOrganization = async (
  _organizationId: string,
  _updates: Partial<Organization>
): Promise<void> => {}

/**
 * Add member to organization
 * @param organizationId - Organization ID
 * @param userId - User ID to add
 * @param role - Member role
 * @returns Promise<void>
 */
export const addOrganizationMember = async (
  _organizationId: string,
  _userId: string,
  _role: OrganizationRole = 'member'
): Promise<void> => {}

/**
 * Remove member from organization
 * @param organizationId - Organization ID
 * @param userId - User ID to remove
 * @returns Promise<void>
 */
export const removeOrganizationMember = async (
  _organizationId: string,
  _userId: string
): Promise<void> => {}

/**
 * Create organization invitation
 * @param organizationId - Organization ID
 * @param email - Invitee email
 * @param role - Invitee role
 * @param invitedBy - User ID of inviter
 * @param invitedByName - Name of inviter
 * @returns Promise<string> - Invitation ID
 */
export const createOrganizationInvitation = async (
  organizationId: string,
  email: string,
  role: OrganizationRole,
  invitedBy: string,
  invitedByName: string
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized')
  }

  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const invitationData: Omit<OrganizationInvitation, 'id'> = {
      organizationId,
      email: email.toLowerCase(),
      role,
      invitedBy,
      invitedByName,
      status: 'pending',
      expiresAt,
      createdAt: serverTimestamp() as any,
    }

    const invitationRef = await addDoc(collection(db, 'organizationInvitations'), invitationData)
    return invitationRef.id
  } catch (error) {
    console.error('Error creating organization invitation:', error)
    throw error
  }
}

/**
 * Get organization invitations
 * @param organizationId - Organization ID
 * @returns Promise<OrganizationInvitation[]>
 */
export const getOrganizationInvitations = async (
  organizationId: string
): Promise<OrganizationInvitation[]> => {
  if (!db) {
    console.warn('Firestore is not initialized')
    return []
  }

  try {
    const q = query(
      collection(db, 'organizationInvitations'),
      where('organizationId', '==', organizationId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OrganizationInvitation[]
  } catch (error) {
    console.error('Error getting organization invitations:', error)
    return []
  }
}

/**
 * Accept organization invitation
 * @param invitationId - Invitation ID
 * @param userId - User ID accepting the invitation
 * @returns Promise<void>
 */
export const acceptOrganizationInvitation = async (
  invitationId: string,
  userId: string
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized')
  }

  try {
    const invitationRef = doc(db, 'organizationInvitations', invitationId)
    const invitationDoc = await getDoc(invitationRef)
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found')
    }
    
    const invitationData = invitationDoc.data() as OrganizationInvitation
    
    // Check if invitation has expired
    const expiresAt = invitationData.expiresAt as any
    const expiresDate = expiresAt?.toDate ? expiresAt.toDate() : expiresAt
    
    if (expiresDate < new Date()) {
      throw new Error('Invitation has expired')
    }
    
    // Add user to organization
    await addOrganizationMember(
      invitationData.organizationId,
      userId,
      invitationData.role
    )
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
    })
  } catch (error) {
    console.error('Error accepting organization invitation:', error)
    throw error
  }
}

/**
 * Subscribe to organization changes
 * @param organizationId - Organization ID
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const subscribeToOrganization = (
  organizationId: string,
  callback: (organization: Organization | null) => void
) => {
  if (!db) {
    console.warn('Firestore is not initialized')
    callback(null)
    return () => {}
  }

  return onSnapshot(
    doc(db, 'organizations', organizationId),
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Organization)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('Error subscribing to organization:', error)
      callback(null)
    }
  )
}

/**
 * Check if user has permission in organization
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param requiredRole - Minimum required role
 * @returns Promise<boolean>
 */
export const hasOrganizationPermission = async (
  userId: string,
  organizationId: string,
  requiredRole: OrganizationRole = 'member'
): Promise<boolean> => {
  if (!db) {
    return false
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      return false
    }
    
    const userData = userDoc.data()
    
    if (userData.organizationId !== organizationId) {
      return false
    }
    
    const roleHierarchy = {
      'owner': 4,
      'admin': 3,
      'member': 2,
      'client': 1,
    }
    
    const userRoleLevel = roleHierarchy[userData.organizationRole as OrganizationRole] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    return userRoleLevel >= requiredRoleLevel
  } catch (error) {
    console.error('Error checking organization permission:', error)
    return false
  }
} 