import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { 
  Client, 
  ClientViewCode, 
  ClientCommunication, 
  ClientNote, 
  ClientProject 
} from '@/types'

/**
 * Client Data Management Library
 * Handles all client-related Firestore operations with TypeScript typing
 */

/**
 * Get all clients for an organization
 * @param organizationId - The organization ID
 * @param userId - The current user ID for permission checking
 * @returns Promise<Client[]> - Array of clients
 */
export async function getClients(organizationId: string, userId: string): Promise<Client[]> {
  try {
    // Get user role to determine access level
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'

    let clientsQuery

    if (userRole === 'admin' || userRole === 'owner') {
      // Admins can see all clients in the organization
      clientsQuery = query(
        collection(db, 'clients'),
        where('organizationId', '==', organizationId),
        orderBy('name')
      )
    } else {
      // Team members can only see assigned clients
      clientsQuery = query(
        collection(db, 'clients'),
        where('organizationId', '==', organizationId),
        where('assignedManagerId', '==', userId),
        orderBy('name')
      )
    }

    const snapshot = await getDocs(clientsQuery)
    const clients: Client[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      clients.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastContactDate: data.lastContactDate?.toDate() || null,
      } as Client)
    })

    return clients
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

/**
 * Get a single client by ID
 * @param clientId - The client ID
 * @param userId - The current user ID for permission checking
 * @returns Promise<Client | null> - The client data or null if not found
 */
export async function getClient(clientId: string, userId: string): Promise<Client | null> {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', clientId))
    
    if (!clientDoc.exists()) {
      return null
    }

    const data = clientDoc.data()
    
    // Check user permissions
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'
    const userOrganizationId = userData?.organizationId

    // Verify organization access
    if (data.organizationId !== userOrganizationId) {
      throw new Error('Access denied: Client belongs to different organization')
    }

    // Check if user is admin or assigned manager
    const isAdmin = userRole === 'admin' || userRole === 'owner'
    const isAssignedManager = data.assignedManagerId === userId

    if (!isAdmin && !isAssignedManager) {
      throw new Error('Access denied: Only admins or assigned managers can view this client')
    }

    return {
      id: clientDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastContactDate: data.lastContactDate?.toDate() || null,
    } as Client
  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}

/**
 * Create a new client
 * @param clientData - The client data (without ID)
 * @param userId - The current user ID
 * @returns Promise<string> - The new client ID
 */
export async function createClient(clientData: Omit<Client, 'id'>, userId: string): Promise<string> {
  try {
    // Check user permissions
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'

    if (userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Access denied: Only admins can create clients')
    }

    const newClient = {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'clients'), newClient)
    return docRef.id
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

/**
 * Update an existing client
 * @param clientId - The client ID
 * @param updates - The fields to update
 * @param userId - The current user ID
 * @returns Promise<void>
 */
export async function updateClient(
  clientId: string, 
  updates: Partial<Client>, 
  userId: string
): Promise<void> {
  try {
    // Check user permissions
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'

    // Get current client data
    const clientDoc = await getDoc(doc(db, 'clients', clientId))
    if (!clientDoc.exists()) {
      throw new Error('Client not found')
    }

    const clientData = clientDoc.data()

    // Check if user is admin or assigned manager
    const isAdmin = userRole === 'admin' || userRole === 'owner'
    const isAssignedManager = clientData.assignedManagerId === userId

    if (!isAdmin && !isAssignedManager) {
      throw new Error('Access denied: Only admins or assigned managers can update this client')
    }

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    }

    await updateDoc(doc(db, 'clients', clientId), updateData)
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}

/**
 * Delete a client
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<void>
 */
export async function deleteClient(clientId: string, userId: string): Promise<void> {
  try {
    // Check user permissions
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'

    if (userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Access denied: Only admins can delete clients')
    }

    // Check if client has active projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', clientId),
      where('status', 'in', ['planning', 'in-progress', 'review'])
    )
    const projectsSnapshot = await getDocs(projectsQuery)

    if (!projectsSnapshot.empty) {
      throw new Error('Cannot delete client with active projects')
    }

    // Delete client and related data in a batch
    const batch = writeBatch(db)

    // Delete client
    batch.delete(doc(db, 'clients', clientId))

    // Delete client view codes
    const codesQuery = query(
      collection(db, 'clientViewCodes'),
      where('clientId', '==', clientId)
    )
    const codesSnapshot = await getDocs(codesQuery)
    codesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete client communications
    const commsQuery = query(
      collection(db, 'clientCommunications'),
      where('clientId', '==', clientId)
    )
    const commsSnapshot = await getDocs(commsQuery)
    commsSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete client notes
    const notesQuery = query(
      collection(db, 'clientNotes'),
      where('clientId', '==', clientId)
    )
    const notesSnapshot = await getDocs(notesQuery)
    notesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  } catch (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}

/**
 * Get client view codes
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientViewCode[]> - Array of view codes
 */
export async function getClientViewCodes(clientId: string, userId: string): Promise<ClientViewCode[]> {
  try {
    // Verify user has access to this client
    await getClient(clientId, userId)

    const codesQuery = query(
      collection(db, 'clientViewCodes'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(codesQuery)
    const codes: ClientViewCode[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      codes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || null,
        lastUsedAt: data.lastUsedAt?.toDate() || null,
      } as ClientViewCode)
    })

    return codes
  } catch (error) {
    console.error('Error fetching client view codes:', error)
    throw error
  }
}

/**
 * Get client communications
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @param limit - Maximum number of communications to return
 * @returns Promise<ClientCommunication[]> - Array of communications
 */
export async function getClientCommunications(
  clientId: string, 
  userId: string, 
  limit: number = 50
): Promise<ClientCommunication[]> {
  try {
    // Verify user has access to this client
    await getClient(clientId, userId)

    const commsQuery = query(
      collection(db, 'clientCommunications'),
      where('clientId', '==', clientId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    )

    const snapshot = await getDocs(commsQuery)
    const communications: ClientCommunication[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      communications.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ClientCommunication)
    })

    return communications
  } catch (error) {
    console.error('Error fetching client communications:', error)
    throw error
  }
}

/**
 * Get client notes
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @param includePrivate - Whether to include private notes
 * @returns Promise<ClientNote[]> - Array of notes
 */
export async function getClientNotes(
  clientId: string, 
  userId: string, 
  includePrivate: boolean = false
): Promise<ClientNote[]> {
  try {
    // Verify user has access to this client
    await getClient(clientId, userId)

    let notesQuery

    if (includePrivate) {
      notesQuery = query(
        collection(db, 'clientNotes'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      )
    } else {
      notesQuery = query(
        collection(db, 'clientNotes'),
        where('clientId', '==', clientId),
        where('isPrivate', '==', false),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(notesQuery)
    const notes: ClientNote[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ClientNote)
    })

    return notes
  } catch (error) {
    console.error('Error fetching client notes:', error)
    throw error
  }
}

/**
 * Get client projects
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientProject[]> - Array of projects
 */
export async function getClientProjects(clientId: string, userId: string): Promise<ClientProject[]> {
  try {
    // Verify user has access to this client
    await getClient(clientId, userId)

    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', clientId),
      orderBy('startDate', 'desc')
    )

    const snapshot = await getDocs(projectsQuery)
    const projects: ClientProject[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      projects.push({
        id: doc.id,
        clientId,
        projectId: doc.id,
        projectTitle: data.title,
        projectType: data.type,
        projectStatus: data.status,
        assignedManagerId: data.assignedTo?.[0] || '',
        assignedManagerName: data.assignedManagerName || 'Unassigned',
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || null,
        progress: data.progress || 0,
        lastUpdate: data.updatedAt?.toDate() || null,
      } as ClientProject)
    })

    return projects
  } catch (error) {
    console.error('Error fetching client projects:', error)
    throw error
  }
}

/**
 * Add a communication record
 * @param communication - The communication data
 * @param userId - The current user ID
 * @returns Promise<string> - The new communication ID
 */
export async function addClientCommunication(
  communication: Omit<ClientCommunication, 'id'>, 
  userId: string
): Promise<string> {
  try {
    // Verify user has access to this client
    await getClient(communication.clientId, userId)

    const newCommunication = {
      ...communication,
      timestamp: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'clientCommunications'), newCommunication)
    return docRef.id
  } catch (error) {
    console.error('Error adding client communication:', error)
    throw error
  }
}

/**
 * Add a note to a client
 * @param note - The note data
 * @param userId - The current user ID
 * @returns Promise<string> - The new note ID
 */
export async function addClientNote(
  note: Omit<ClientNote, 'id'>, 
  userId: string
): Promise<string> {
  try {
    // Verify user has access to this client
    await getClient(note.clientId, userId)

    const newNote = {
      ...note,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'clientNotes'), newNote)
    return docRef.id
  } catch (error) {
    console.error('Error adding client note:', error)
    throw error
  }
}

/**
 * Search clients by various criteria
 * @param organizationId - The organization ID
 * @param searchTerm - The search term
 * @param filters - Additional filters
 * @param userId - The current user ID
 * @returns Promise<Client[]> - Array of matching clients
 */
export async function searchClients(
  organizationId: string,
  searchTerm: string,
  filters: {
    status?: string
    managerId?: string
  } = {},
  userId: string
): Promise<Client[]> {
  try {
    // Get user role to determine access level
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const userRole = userData?.role || 'member'

    // Build query constraints
    const constraints = [where('organizationId', '==', organizationId)]

    if (userRole !== 'admin' && userRole !== 'owner') {
      constraints.push(where('assignedManagerId', '==', userId))
    }

    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status))
    }

    if (filters.managerId && filters.managerId !== 'all') {
      constraints.push(where('assignedManagerId', '==', filters.managerId))
    }

    const clientsQuery = query(
      collection(db, 'clients'),
      ...constraints,
      orderBy('name')
    )

    const snapshot = await getDocs(clientsQuery)
    const clients: Client[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      const client = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastContactDate: data.lastContactDate?.toDate() || null,
      } as Client

      // Apply search filter
      if (!searchTerm || 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.assignedManagerName.toLowerCase().includes(searchTerm.toLowerCase())) {
        clients.push(client)
      }
    })

    return clients
  } catch (error) {
    console.error('Error searching clients:', error)
    throw error
  }
} 