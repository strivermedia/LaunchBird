// Firebase removed; keep mock implementations
import { db } from './platform'
import type { Project, Activity, Client } from '@/types'

// Development mode flag - set to true to bypass Firebase operations
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

/**
 * Check if development mode is enabled
 * @returns boolean
 */
export const isDevMode = (): boolean => DEV_MODE

/**
 * Get project by client code
 * @param code - 4-character client access code
 * @returns Promise<Project | null>
 */
export const getProjectByClientCode = async (code: string): Promise<Project | null> => {
  if (DEV_MODE) {
    // Return a mock project for development
    const mockProject: Project = {
      id: 'dev-project-123',
      organizationId: 'dev-org-123',
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      type: 'one-time',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-01'),
      deadline: new Date('2024-02-28'),
      assignedTo: ['user-1', 'user-2'],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      clientId: 'dev-client-123',
      budget: 15000,
      tags: ['web', 'design'],
      clientCode: code.toUpperCase(),
      codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      clientAccessEnabled: true,
      assignedManagerId: 'manager1',
      assignedManagerName: 'Sarah Johnson',
      assignedManagerTitle: 'Senior Project Manager',
      assignedManagerEmail: 'sarah.johnson@launchbird.com',
      assignedManagerPhone: '+1 (555) 987-6543',
    }
    console.log('Returning mock project in dev mode for code:', code)
    return mockProject
  }

  if (!db) {
    // Return null in strict non-dev usage; mock path handles dev
    return null
  }

  try {
    const q = query(
      collection(db, 'projects'),
      where('clientCode', '==', code.toUpperCase()),
      where('clientAccessEnabled', '==', true)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const projectDoc = snapshot.docs[0]
    const data = projectDoc.data()
    
    // Check if code has expired
    if (data.codeExpiry) {
      const expiryDate = data.codeExpiry instanceof Date 
        ? data.codeExpiry 
        : data.codeExpiry.toDate()
      
      if (expiryDate < new Date()) {
        return null
      }
    }
    
    return {
      id: projectDoc.id,
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate(),
      deadline: data.deadline?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      codeExpiry: data.codeExpiry?.toDate(),
    } as Project
  } catch (error) {
    console.error('Error getting project by client code:', error)
    return null
  }
}

/**
 * Get project updates/activities for client view
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @param limitCount - Number of activities to fetch
 * @returns Promise<Activity[]>
 */
export const getProjectActivities = async (
  projectId: string,
  organizationId: string,
  limitCount: number = 20
): Promise<Activity[]> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return mock activities for development
    const mockActivities: Activity[] = [
      {
        id: 'activity-1',
        organizationId: 'dev-org-123',
        type: 'project_update',
        title: 'Project Update',
        description: 'Updated project status and timeline',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userTitle: 'Project Manager',
        projectId: 'dev-project-123',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'activity-2',
        organizationId: 'dev-org-123',
        type: 'task_completed',
        title: 'Task Completed',
        description: 'Completed design phase and wireframes',
        userId: 'user-2',
        userName: 'Mike Chen',
        userTitle: 'Designer',
        projectId: 'dev-project-123',
        timestamp: new Date('2024-01-14T15:30:00Z'),
      },
      {
        id: 'activity-3',
        organizationId: 'dev-org-123',
        type: 'client_feedback',
        title: 'Client Feedback',
        description: 'Received positive feedback on initial designs',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userTitle: 'Project Manager',
        projectId: 'dev-project-123',
        timestamp: new Date('2024-01-13T14:20:00Z'),
      },
    ]
    console.log('Returning mock activities in dev mode for project:', projectId)
    return mockActivities.slice(0, limitCount)
  }

  if (!db) {
    return []
  }

  try {
    const q = query(
      collection(db, 'activities'),
      where('organizationId', '==', organizationId),
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const activities: Activity[] = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Activity)
    })
    
    return activities
  } catch (error) {
    console.error('Error fetching project activities:', error)
    return []
  }
}

/**
 * Subscribe to real-time project updates for client view
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToProjectUpdates = (
  projectId: string,
  organizationId: string,
  callback: (project: Project | null) => void
) => {
  if (!db) {
    callback(null)
    return () => {}
  }

  try {
    return onSnapshot(
      doc(db, 'projects', projectId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          
          // Only return project if it belongs to the correct organization
          if (data.organizationId === organizationId) {
            callback({
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate() || new Date(),
              endDate: data.endDate?.toDate(),
              deadline: data.deadline?.toDate(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              codeExpiry: data.codeExpiry?.toDate(),
            } as Project)
          } else {
            callback(null)
          }
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error subscribing to project updates:', error)
        callback(null)
      }
    )
  } catch (error) {
    console.error('Error setting up project subscription:', error)
    callback(null)
    return () => {}
  }
}

/**
 * Subscribe to real-time project activities for client view
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToProjectActivities = (
  projectId: string,
  organizationId: string,
  callback: (activities: Activity[]) => void
) => {
  if (!db) {
    callback([])
    return () => {}
  }

  try {
    const q = query(
      collection(db, 'activities'),
      where('organizationId', '==', organizationId),
      where('projectId', '==', projectId),
      orderBy('timestamp', 'desc'),
      limit(20)
    )

    return onSnapshot(q, (querySnapshot) => {
      const activities: Activity[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Activity)
      })
      callback(activities)
    })
  } catch (error) {
    console.error('Error subscribing to project activities:', error)
    callback([])
    return () => {}
  }
}

/**
 * Generate a secure client access code
 * @returns string - 4-character alphanumeric code
 */
export const generateClientCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Create client access for a project
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @param expiresInDays - Days until expiration (default: 30)
 * @returns Promise<string> - Generated client code
 */
export const createClientAccess = async (
  projectId: string,
  organizationId: string,
  expiresInDays: number = 30
): Promise<string> => {
  if (!db) { return 'MOCK' }

  try {
    const code = generateClientCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    
    // Update project with client access
    await updateDoc(doc(db, 'projects', projectId), {
      clientCode: code,
      codeExpiry: expiresAt,
      clientAccessEnabled: true,
      updatedAt: new Date(),
    })
    
    return code
  } catch (error) {
    console.error('Error creating client access:', error)
    throw error
  }
}

/**
 * Disable client access for a project
 * @param projectId - Project ID
 * @returns Promise<void>
 */
export const disableClientAccess = async (projectId: string): Promise<void> => {
  if (!db) { return }

  try {
    await updateDoc(doc(db, 'projects', projectId), {
      clientAccessEnabled: false,
      clientCode: null,
      codeExpiry: null,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error disabling client access:', error)
    throw error
  }
}

/**
 * Validate client access code
 * @param code - 4-character client access code
 * @returns Promise<{ valid: boolean; project?: Project; error?: string }>
 */
export const validateClientCode = async (code: string): Promise<{
  valid: boolean
  project?: Project
  error?: string
}> => {
  try {
    const project = await getProjectByClientCode(code)
    
    if (!project) {
      return { valid: false, error: 'Invalid or expired access code' }
    }
    
    if (!project.clientAccessEnabled) {
      return { valid: false, error: 'Client access is disabled for this project' }
    }
    
    return { valid: true, project }
  } catch (error) {
    console.error('Error validating client code:', error)
    return { valid: false, error: 'Error validating access code' }
  }
}

/**
 * Log client access for tracking
 * @param code - Client access code
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @returns Promise<void>
 */
export const logClientAccess = async (
  code: string,
  projectId: string,
  organizationId: string
): Promise<void> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    console.log('Client access logged in dev mode:', { code, projectId, organizationId })
    return
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return
  }

  try {
    const accessLog = {
      code,
      projectId,
      organizationId,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ip: 'unknown', // In a real implementation, this would be captured server-side
    }

    await setDoc(doc(db, 'clientAccessLogs', `${code}_${Date.now()}`), accessLog)
  } catch (error) {
    console.error('Error logging client access:', error)
  }
}

/**
 * Get or create client access code
 * @param clientId - Client ID
 * @param organizationId - Organization ID
 * @param expiresInDays - Days until expiration (default: 30)
 * @returns Promise<string> - Client access code
 */
export const getOrCreateClientAccessCode = async (
  clientId: string,
  organizationId: string,
  expiresInDays: number = 30
): Promise<string> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return a mock client access code for development
    const code = generateClientCode()
    console.log('Created client access code in dev mode:', code)
    return code
  }

  if (!db) { return }

  try {
    // Check if client already has an access code
    const clientDoc = await getDoc(doc(db, 'clients', clientId))
    
    if (clientDoc.exists()) {
      const clientData = clientDoc.data()
      if (clientData.clientAccessCode && clientData.codeExpiry) {
        const expiryDate = clientData.codeExpiry instanceof Date 
          ? clientData.codeExpiry 
          : clientData.codeExpiry.toDate()
        
        // If code hasn't expired, return existing code
        if (expiryDate > new Date()) {
          return clientData.clientAccessCode
        }
      }
    }
    
    // Generate new code
    const code = generateClientCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    
    // Update client with access code
    await setDoc(doc(db, 'clients', clientId), {
      clientAccessCode: code,
      codeExpiry: expiresAt,
      clientAccessEnabled: true,
      updatedAt: new Date(),
    }, { merge: true })
    
    return code
  } catch (error) {
    console.error('Error getting or creating client access code:', error)
    throw error
  }
}

/**
 * Get client by access code
 * @param code - 4-character client access code
 * @returns Promise<Client | null>
 */
export const getClientByAccessCode = async (code: string): Promise<Client | null> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return a mock client for development
                    const mockClient: Client = {
                  id: 'dev-client-123',
                  organizationId: 'dev-org-123',
                  name: 'John Smith',
                  email: 'john.smith@acme.com',
                  phone: '+1 (555) 123-4567',
                  company: 'Acme Corporation',
                  position: 'CTO',
                  assignedManagerId: 'manager1',
                  assignedManagerName: 'Sarah Johnson',
                  assignedManagerTitle: 'Senior Project Manager',
                  assignedManagerEmail: 'sarah.johnson@launchbird.com',
                  assignedManagerPhone: '+1 (555) 987-6543',
                  status: 'active',
                  createdAt: new Date('2024-01-15'),
                  updatedAt: new Date('2024-01-20'),
                  notes: 'Key decision maker for all technical projects',
                  tags: ['enterprise', 'technical'],
                  lastContactDate: new Date('2024-01-18'),
                  totalProjects: 5,
                  activeProjects: 2,
                  completedProjects: 3,
                  clientAccessCode: code.toUpperCase(),
                  codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                  clientAccessEnabled: true,
                }
    console.log('Returning mock client in dev mode for code:', code)
    return mockClient
  }

  if (!db) { return null }

  try {
    const q = query(
      collection(db, 'clients'),
      where('clientAccessCode', '==', code.toUpperCase()),
      where('clientAccessEnabled', '==', true)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const clientDoc = snapshot.docs[0]
    const data = clientDoc.data()
    
    // Check if code has expired
    if (data.codeExpiry) {
      const expiryDate = data.codeExpiry instanceof Date 
        ? data.codeExpiry 
        : data.codeExpiry.toDate()
      
      if (expiryDate < new Date()) {
        return null
      }
    }
    
    return {
      id: clientDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      codeExpiry: data.codeExpiry?.toDate(),
    } as Client
  } catch (error) {
    console.error('Error getting client by access code:', error)
    return null
  }
}

/**
 * Get projects for a client
 * @param clientId - Client ID
 * @param organizationId - Organization ID
 * @returns Promise<Project[]>
 */
export const getClientProjects = async (
  clientId: string,
  organizationId: string
): Promise<Project[]> => {
  if (DEV_MODE || DISABLE_FIREBASE) {
    // Return mock projects for development
    const mockProjects: Project[] = [
      {
        id: 'dev-project-1',
        organizationId: 'dev-org-123',
        title: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        type: 'one-time',
        status: 'in-progress',
        progress: 65,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-01'),
        deadline: new Date('2024-02-28'),
        assignedTo: ['user-1', 'user-2'],
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        clientId: 'dev-client-123',
        budget: 15000,
        tags: ['web', 'design'],
        clientCode: 'WEB1',
        codeExpiry: new Date('2024-12-31'),
        clientAccessEnabled: true,
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        assignedManagerTitle: 'Senior Project Manager',
        assignedManagerEmail: 'sarah.johnson@launchbird.com',
        assignedManagerPhone: '+1 (555) 987-6543',
      },
      {
        id: 'dev-project-2',
        organizationId: 'dev-org-123',
        title: 'Mobile App Development',
        description: 'iOS and Android mobile application for customer engagement',
        type: 'ongoing',
        status: 'completed',
        progress: 100,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-01-15'),
        deadline: new Date('2024-01-15'),
        assignedTo: ['user-3', 'user-4'],
        createdBy: 'user-1',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2024-01-15'),
        clientId: 'dev-client-123',
        budget: 25000,
        tags: ['mobile', 'app'],
        clientCode: 'MOB1',
        codeExpiry: new Date('2024-12-31'),
        clientAccessEnabled: true,
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        assignedManagerTitle: 'Senior Project Manager',
        assignedManagerEmail: 'sarah.johnson@launchbird.com',
        assignedManagerPhone: '+1 (555) 987-6543',
      },
      {
        id: 'dev-project-3',
        organizationId: 'dev-org-123',
        title: 'E-commerce Platform',
        description: 'Full-featured e-commerce platform with payment integration',
        type: 'one-time',
        status: 'review',
        progress: 85,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        deadline: new Date('2024-03-30'),
        assignedTo: ['user-1', 'user-5'],
        createdBy: 'user-1',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15'),
        clientId: 'dev-client-123',
        budget: 30000,
        tags: ['ecommerce', 'payment'],
        clientCode: 'ECO1',
        codeExpiry: new Date('2024-12-31'),
        clientAccessEnabled: true,
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        assignedManagerTitle: 'Senior Project Manager',
        assignedManagerEmail: 'sarah.johnson@launchbird.com',
        assignedManagerPhone: '+1 (555) 987-6543',
      },
    ]
    console.log('Returning mock projects in dev mode for client:', clientId)
    return mockProjects
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return []
  }

  try {
    const q = query(
      collection(db, 'projects'),
      where('organizationId', '==', organizationId),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const projects: Project[] = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      projects.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        deadline: data.deadline?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        codeExpiry: data.codeExpiry?.toDate(),
      } as Project)
    })
    
    return projects
  } catch (error) {
    console.error('Error fetching client projects:', error)
    return []
  }
}

/**
 * Submit client feedback
 * @param feedback - Client feedback data
 * @returns Promise<void>
 */
export const submitClientFeedback = async (feedback: {
  projectId: string
  clientName: string
  clientEmail: string
  rating: number
  category: 'general' | 'design' | 'functionality' | 'communication' | 'timeline'
  comment: string
}): Promise<void> => {
  if (!db) {
    console.warn('Firestore is not initialized')
    return
  }

  try {
    const feedbackData = {
      ...feedback,
      createdAt: new Date(),
      isResolved: false,
    }

    await setDoc(doc(db, 'clientFeedback', `${feedback.projectId}_${Date.now()}`), feedbackData)
  } catch (error) {
    console.error('Error submitting client feedback:', error)
    throw error
  }
} 