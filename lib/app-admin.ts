// Supabase removed - Mock implementation for development
// import {
//   doc,
//   getDoc,
//   getDocs,
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   updateDoc,
//   deleteDoc,
//   serverTimestamp,
//   onSnapshot,
// } from '@supabase/supabase-js'
// import { db } from './platform'
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
  
  // Mock implementation - return true for development
  console.log(`isAppAdmin: Mock implementation - allowing admin access for user ${userId}`)
  return true
}

export const getAllOrganizations = async (): Promise<Organization[]> => {
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

export const getAllUsers = async (): Promise<UserProfile[]> => {
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

export const getAppAdmin = async (userId: string): Promise<AppAdmin | null> => {
  // Mock implementation - return a dummy admin for development
  return {
    id: userId,
    email: 'admin@launchbird.com',
    role: 'app_admin',
    name: 'App Administrator',
    permissions: {
      manageUsers: true,
      manageOrganizations: true,
      viewAnalytics: true,
      manageBilling: true,
      accessSupport: true,
      systemSettings: true,
    },
    createdAt: new Date(),
  }
} 

export const getAppAnalytics = async (): Promise<AppAnalytics> => {
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

export const suspendOrganization = async (organizationId: string, reason: string): Promise<void> => {
  // Mock implementation - no actual update
  console.log(`suspendOrganization: Mock implementation - organization ${organizationId} suspended with reason: ${reason}`)
}

export const reactivateOrganization = async (organizationId: string): Promise<void> => {
  // Mock implementation - no actual update
  console.log(`reactivateOrganization: Mock implementation - organization ${organizationId} reactivated`)
}

export const updateOrganizationPlan = async (organizationId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<void> => {
  // Mock implementation - no actual update
  console.log(`updateOrganizationPlan: Mock implementation - organization ${organizationId} plan updated to: ${plan}`)
}

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  // Mock implementation - no actual update
  console.log(`updateUserRole: Mock implementation - user ${userId} role updated to: ${role}`)
}

export const deleteOrganization = async (organizationId: string): Promise<void> => {
  // Mock implementation - no actual delete
  console.log(`deleteOrganization: Mock implementation - organization ${organizationId} deleted`)
}

export const deleteUser = async (userId: string): Promise<void> => {
  // Mock implementation - no actual delete
  console.log(`deleteUser: Mock implementation - user ${userId} deleted`)
} 