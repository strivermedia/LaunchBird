// Client management with local storage for development
import { 
  Client, 
  ClientProfileCode, 
  ClientCommunication, 
  ClientNote, 
  ClientProject 
} from '@/types'
import { ClientStorage } from './localStorage'

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Mock data for development
const mockClients: Client[] = [
  {
    id: 'client-1',
    organizationId: 'org-1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    company: 'Acme Corporation',
    phone: '+1-555-0123',
    assignedManagerId: 'user-1',
    assignedManagerName: 'John Doe',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
    totalProjects: 3,
    activeProjects: 2,
    completedProjects: 1,
    lastContactDate: new Date('2024-01-20'),
    notes: '',
  },
  {
    id: 'client-2',
    organizationId: 'org-1',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    company: 'TechStart Inc',
    phone: '+1-555-0456',
    assignedManagerId: 'user-2',
    assignedManagerName: 'Jane Smith',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-25'),
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    lastContactDate: new Date('2024-01-22'),
    notes: '',
  }
]

/**
 * Client Data Management Library
 * Mock implementations for development
 */

/**
 * Get all clients for an organization
 * @param organizationId - The organization ID
 * @param userId - The current user ID for permission checking
 * @returns Promise<Client[]> - Array of clients
 */
export async function getClients(organizationId: string, userId: string): Promise<Client[]> {
  // Use local storage in development mode
  if (DEV_MODE) {
    console.log('🔧 Development mode: Using local storage for clients')
    return ClientStorage.getClients(organizationId)
  }

  try {
    // Fallback to local storage if Supabase is not available
    return ClientStorage.getClients(organizationId)
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw new Error('Failed to fetch clients')
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
    // Extract organizationId from userId or use default
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    return ClientStorage.getClient(organizationId, clientId)
  } catch (error) {
    console.error('Error fetching client:', error)
    throw new Error('Failed to fetch client')
  }
}

/**
 * Create a new client with retry mechanism
 * @param clientData - The client data (without ID)
 * @param userId - The current user ID
 * @param retryCount - Number of retries attempted
 * @returns Promise<string> - The new client ID
 */
export async function createClient(
  clientData: Omit<Client, 'id'>,
  userId: string,
  retryCount: number = 0
): Promise<string> {
  try {
    const organizationId = clientData.organizationId || 'dev-org-123'
    const newClient = await ClientStorage.createClient(organizationId, clientData)
    return newClient.id
  } catch (error) {
    console.error('Error creating client:', error)
    
    // Retry logic for transient errors
    if (retryCount < 3) {
      console.log(`Retrying client creation (attempt ${retryCount + 1})`)
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
      return createClient(clientData, userId, retryCount + 1)
    }
    
    throw new Error('Failed to create client')
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
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    const updatedClient = await ClientStorage.updateClient(organizationId, clientId, updates)
    if (!updatedClient) {
      throw new Error('Client not found')
    }
  } catch (error) {
    console.error('Error updating client:', error)
    throw new Error('Failed to update client')
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
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    const success = await ClientStorage.deleteClient(organizationId, clientId)
    if (!success) {
      throw new Error('Client not found')
    }
  } catch (error) {
    console.error('Error deleting client:', error)
    throw new Error('Failed to delete client')
  }
}

/**
 * Get client profile codes
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientProfileCode[]> - Array of profile codes
 */
export async function getClientProfileCodes(_clientId: string, _userId: string): Promise<ClientProfileCode[]> {
  // Mock implementation
  return [
    {
      id: 'code1',
      clientId: _clientId,
      code: 'ABC1',
      accessType: 'code',
      isActive: true,
      expiresAt: new Date('2024-12-31'),
      createdAt: new Date(),
      createdBy: 'user1',
      lastUsedAt: new Date(),
      usageCount: 5,
    }
  ]
}

/**
 * Get client communications
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientCommunication[]> - Array of communications
 */
export async function getClientCommunications(_clientId: string, _userId: string): Promise<ClientCommunication[]> {
  // Mock implementation
  return [
    {
      id: 'comm1',
      clientId: _clientId,
      type: 'email',
      subject: 'Project Update',
      content: 'Here is the latest update on your project...',
      sentBy: 'user1',
      sentByName: 'Sarah Johnson',
      timestamp: new Date(),
      status: 'delivered',
    }
  ]
}

/**
 * Get client notes
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientNote[]> - Array of notes
 */
export async function getClientNotes(_clientId: string, _userId: string): Promise<ClientNote[]> {
  // Mock implementation
  return [
    {
      id: 'note1',
      clientId: _clientId,
      content: 'Client prefers detailed progress reports',
      createdBy: 'user1',
      createdByName: 'Sarah Johnson',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPrivate: false,
      tags: ['preferences'],
    }
  ]
}

/**
 * Get client projects
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientProject[]> - Array of projects
 */
export async function getClientProjects(_clientId: string, _userId: string): Promise<ClientProject[]> {
  // Mock implementation
  return [
    {
      id: 'proj1',
      clientId: _clientId,
      projectId: 'project1',
      projectTitle: 'Website Redesign',
      projectType: 'one-time',
      projectStatus: 'in-progress',
      assignedManagerId: 'manager1',
      assignedManagerName: 'Sarah Johnson',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      progress: 65,
      lastUpdate: new Date(),
    }
  ]
} 