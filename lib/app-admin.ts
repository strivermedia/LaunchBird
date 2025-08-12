import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './platform'
import type { 
  Organization, 
  AppAdmin,
  AppAnalytics,
  AppAdminRole,
  AppAdminPermissions 
} from '@/types'
import type { UserProfile } from '@/lib/auth'

// --- App Admin Service ---

export const isAppAdmin = async (userId: string): Promise<boolean> => {
  console.log(`isAppAdmin: Starting check for user ${userId}`)
  
  // In development mode with disabled auth, allow access
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    console.log('isAppAdmin: Development mode with disabled auth, allowing access')
    return true
  }
  
  // If Firebase is not available, return false (don't allow admin access)
  if (!db) {
    console.warn('isAppAdmin: Firestore not available, denying admin access')
    return false
  }
  
  try {
    console.log(`isAppAdmin: Checking Firestore document for user ${userId}`)
    const adminDoc = await getDoc(doc(db, 'appAdmins', userId))
    const isAdmin = adminDoc.exists()
    console.log(`isAppAdmin: Document exists: ${isAdmin}`)
    
    if (isAdmin) {
      console.log('isAppAdmin: Document data:', adminDoc.data())
    }
    
    return isAdmin
  } catch (error) {
    console.error('isAppAdmin: Error checking admin status:', error)
    return false
  }
}

export const getAllOrganizations = async (): Promise<Organization[]> => {
  if (!db) {
    // Return mock data for development
    return [
      {
        id: 'org-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        plan: 'pro',
        settings: {
          branding: {
            primaryColor: '#3B82F6',
            companyName: 'Acme Corp'
          },
          features: {
            clientAccess: true,
            customDomains: false,
            advancedAnalytics: true,
            timeTracking: true,
            fileStorage: true
          },
          limits: {
            maxProjects: 50,
            maxTeamMembers: 25,
            maxStorage: 1000,
            maxClients: 100
          },
          notifications: {
            emailUpdates: true,
            slackIntegration: false,
            clientNotifications: true
          }
        },
        members: ['user-1', 'user-2', 'user-3'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'org-2',
        name: 'TechStart Inc',
        slug: 'techstart-inc',
        plan: 'enterprise',
        settings: {
          branding: {
            primaryColor: '#10B981',
            companyName: 'TechStart Inc'
          },
          features: {
            clientAccess: true,
            customDomains: true,
            advancedAnalytics: true,
            timeTracking: true,
            fileStorage: true
          },
          limits: {
            maxProjects: 200,
            maxTeamMembers: 100,
            maxStorage: 5000,
            maxClients: 500
          },
          notifications: {
            emailUpdates: true,
            slackIntegration: true,
            clientNotifications: true
          }
        },
        members: ['user-4', 'user-5', 'user-6', 'user-7'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      }
    ]
  }
  const q = query(collection(db, 'organizations'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization))
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!db) {
    // Return mock data for development
    return [
      {
        uid: 'user-1',
        email: 'john@acme.com',
        role: 'admin',
        title: 'John Smith',
        organizationId: 'org-1',
        organizationRole: 'admin',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        uid: 'user-2',
        email: 'sarah@acme.com',
        role: 'team_member',
        title: 'Sarah Johnson',
        organizationId: 'org-1',
        organizationRole: 'member',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-20')
      },
      {
        uid: 'user-3',
        email: 'mike@acme.com',
        role: 'client',
        title: 'Mike Wilson',
        organizationId: 'org-1',
        organizationRole: 'client',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-20')
      },
      {
        uid: 'user-4',
        email: 'lisa@techstart.com',
        role: 'admin',
        title: 'Lisa Chen',
        organizationId: 'org-2',
        organizationRole: 'owner',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      },
      {
        uid: 'user-5',
        email: 'david@techstart.com',
        role: 'team_member',
        title: 'David Brown',
        organizationId: 'org-2',
        organizationRole: 'member',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-15')
      }
    ]
  }
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile))
}

export const getAppAdmin = async (userId: string): Promise<AppAdmin | null> => {
  if (!db) return null
  const adminDoc = await getDoc(doc(db, 'appAdmins', userId))
  return adminDoc.exists() ? ({ id: adminDoc.id, ...adminDoc.data() } as AppAdmin) : null
} 

export const getAppAnalytics = async (): Promise<AppAnalytics> => {
  if (!db) {
    // Return mock analytics data for development
    return {
      totalUsers: 2450,
      totalOrganizations: 156,
      activeOrganizations: 142,
      totalProjects: 892,
      totalTasks: 3247,
      storageUsed: 2.1,
      revenue: 13800,
      userGrowth: {
        daily: 12,
        weekly: 89,
        monthly: 342,
      },
    }
  }

  try {
    // Get basic counts
    const [usersSnapshot, orgsSnapshot, projectsSnapshot, tasksSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'organizations')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'tasks')),
    ])

    const totalUsers = usersSnapshot.size
    const totalOrganizations = orgsSnapshot.size
    const totalProjects = projectsSnapshot.size
    const totalTasks = tasksSnapshot.size

    // Calculate active organizations (not suspended)
    const activeOrganizations = orgsSnapshot.docs.filter(
      doc => (doc.data() as any).status !== 'suspended'
    ).length

    // Calculate revenue (simplified)
    const revenue = orgsSnapshot.docs.reduce((total, doc) => {
      const plan = String((doc.data() as any).plan)
      const planRevenue = {
        free: 0,
        pro: 29,
        enterprise: 99,
      }[plan] || 0
      return total + planRevenue
    }, 0)

    // Calculate user growth (simplified)
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyUsers = usersSnapshot.docs.filter(
      doc => {
        const createdAt = (doc.data() as any).createdAt
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
        return date > oneDayAgo
      }
    ).length

    const weeklyUsers = usersSnapshot.docs.filter(
      doc => {
        const createdAt = (doc.data() as any).createdAt
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
        return date > oneWeekAgo
      }
    ).length

    const monthlyUsers = usersSnapshot.docs.filter(
      doc => {
        const createdAt = (doc.data() as any).createdAt
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt)
        return date > oneMonthAgo
      }
    ).length

    return {
      totalUsers,
      totalOrganizations,
      activeOrganizations,
      totalProjects,
      totalTasks,
      storageUsed: 0, // Would calculate from storage service
      revenue,
      userGrowth: {
        daily: dailyUsers,
        weekly: weeklyUsers,
        monthly: monthlyUsers,
      },
    }
  } catch (error) {
    console.error('Error fetching app analytics:', error)
    return {
      totalUsers: 0,
      totalOrganizations: 0,
      activeOrganizations: 0,
      totalProjects: 0,
      totalTasks: 0,
      storageUsed: 0,
      revenue: 0,
      userGrowth: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    }
  }
} 

export const suspendOrganization = async (organizationId: string, reason: string): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await updateDoc(doc(db, 'organizations', organizationId), {
    status: 'suspended',
    suspensionReason: reason,
    suspendedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const reactivateOrganization = async (organizationId: string): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await updateDoc(doc(db, 'organizations', organizationId), {
    status: 'active',
    suspensionReason: null,
    suspendedAt: null,
    updatedAt: serverTimestamp(),
  })
}

export const updateOrganizationPlan = async (organizationId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await updateDoc(doc(db, 'organizations', organizationId), {
    plan,
    updatedAt: serverTimestamp(),
  })
}

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await updateDoc(doc(db, 'users', userId), {
    role,
    updatedAt: serverTimestamp(),
  })
}

export const deleteOrganization = async (organizationId: string): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await deleteDoc(doc(db, 'organizations', organizationId))
}

export const deleteUser = async (userId: string): Promise<void> => {
  if (!db) throw new Error('Firestore is not initialized')
  await deleteDoc(doc(db, 'users', userId))
} 