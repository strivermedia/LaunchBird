import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project, Activity } from '@/types'

/**
 * Get project by client code
 * @param code - 4-character client access code
 * @returns Promise<Project | null>
 */
export const getProjectByClientCode = async (code: string): Promise<Project | null> => {
  if (!db) {
    console.warn('Firestore is not initialized')
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
  if (!db) {
    console.warn('Firestore is not initialized')
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
    console.warn('Firestore is not initialized')
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
    console.warn('Firestore is not initialized')
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
  if (!db) {
    throw new Error('Firestore is not initialized')
  }

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
  if (!db) {
    throw new Error('Firestore is not initialized')
  }

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