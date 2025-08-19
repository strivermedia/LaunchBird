// Supabase removed: provide mock data implementations
import { 
  Client, 
  ClientViewCode, 
  ClientCommunication, 
  ClientNote, 
  ClientProject 
} from '@/types'

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
  return [
    {
      id: 'client-1',
      organizationId,
      name: 'John Smith',
      email: 'john.smith@acme.com',
      assignedManagerId: userId,
      assignedManagerName: 'Sarah Johnson',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalProjects: 2,
      activeProjects: 1,
      completedProjects: 1,
    },
  ]
}

/**
 * Get a single client by ID
 * @param clientId - The client ID
 * @param userId - The current user ID for permission checking
 * @returns Promise<Client | null> - The client data or null if not found
 */
export async function getClient(clientId: string, _userId: string): Promise<Client | null> {
  return {
    id: clientId,
    organizationId: 'org1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    assignedManagerId: 'manager1',
    assignedManagerName: 'Sarah Johnson',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    totalProjects: 2,
    activeProjects: 1,
    completedProjects: 1,
  } as Client
}

/**
 * Create a new client with retry mechanism
 * @param clientData - The client data (without ID)
 * @param userId - The current user ID
 * @param retryCount - Number of retries attempted
 * @returns Promise<string> - The new client ID
 */
export async function createClient(
  _clientData: Omit<Client, 'id'>,
  _userId: string,
  _retryCount: number = 0
): Promise<string> {
  await new Promise(r => setTimeout(r, 300))
  return `dev-client-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Update an existing client
 * @param clientId - The client ID
 * @param updates - The fields to update
 * @param userId - The current user ID
 * @returns Promise<void>
 */
export async function updateClient(
  _clientId: string,
  _updates: Partial<Client>,
  _userId: string
): Promise<void> { 
  await new Promise(r => setTimeout(r, 200)) 
}

/**
 * Delete a client
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<void>
 */
export async function deleteClient(_clientId: string, _userId: string): Promise<void> {
  // Mock implementation - no actual delete
  console.log('Mock implementation - deleting client:', _clientId)
  await new Promise(r => setTimeout(r, 200))
}

/**
 * Get client view codes
 * @param clientId - The client ID
 * @param userId - The current user ID
 * @returns Promise<ClientViewCode[]> - Array of view codes
 */
export async function getClientViewCodes(_clientId: string, _userId: string): Promise<ClientViewCode[]> {
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