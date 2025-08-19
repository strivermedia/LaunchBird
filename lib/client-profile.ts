// Supabase removed; keep mock implementations
import type { Project, Activity, Client } from '@/types'

// Development mode flag - set to true to bypass Supabase operations
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
// Explicit flag to allow disabling auth paths entirely (kept in sync with auth.ts)
const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

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
  // Mock implementation - return mock project
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
    codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clientAccessEnabled: true,
    assignedManagerId: 'manager1',
    assignedManagerName: 'Sarah Johnson',
    assignedManagerTitle: 'Senior Project Manager',
    assignedManagerEmail: 'sarah.johnson@launchbird.com',
    assignedManagerPhone: '+1 (555) 987-6543',
  }
  console.log('Mock implementation - returning mock project for code:', code)
  return mockProject
}

/**
 * Get project updates/activities for client profile
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
  console.log('Mock implementation - returning mock activities for project:', projectId)
  return mockActivities.slice(0, limitCount)
}

/**
 * Subscribe to real-time project updates for client profile
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
  // Mock implementation - return no-op unsubscribe
  console.log('Mock implementation - subscribing to project updates:', projectId)
  callback(getProjectByClientCode('ABC1') as any)
  return () => {}
}

/**
 * Subscribe to real-time project activities for client profile
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
  // Mock implementation - return no-op unsubscribe
  console.log('Mock implementation - subscribing to project activities:', projectId)
  callback([])
  return () => {}
}

/**
 * Log client access for analytics
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
  // Mock implementation - no actual logging
  console.log('Mock implementation - logging client access:', { code, projectId, organizationId })
}

/**
 * Create client access code
 * @param projectId - Project ID
 * @param organizationId - Organization ID
 * @param createdBy - User ID who created the code
 * @returns Promise<string> - Generated code
 */
export const createClientAccessCode = async (
  projectId: string,
  organizationId: string,
  createdBy: string
): Promise<string> => {
  // Mock implementation - generate a random code
  const code = Math.random().toString(36).substring(2, 6).toUpperCase()
  console.log('Mock implementation - created client access code:', code)
  return code
}

/**
 * Get client by access code
 * @param code - Client access code
 * @returns Promise<Client | null>
 */
export const getClientByAccessCode = async (code: string): Promise<Client | null> => {
  // Mock implementation - return mock client
  const mockClient: Client = {
    id: 'dev-client-123',
    organizationId: 'dev-org-123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    position: 'CEO',
    assignedManagerId: 'manager1',
    assignedManagerName: 'Sarah Johnson',
    assignedManagerTitle: 'Senior Project Manager',
    assignedManagerEmail: 'sarah.johnson@launchbird.com',
    assignedManagerPhone: '+1 (555) 987-6543',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    notes: 'Key decision maker, prefers detailed progress reports',
    tags: ['vip', 'decision-maker'],
    lastContactDate: new Date('2024-01-15'),
    totalProjects: 3,
    activeProjects: 1,
    completedProjects: 2,
    clientAccessCode: code.toUpperCase(),
    codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clientAccessEnabled: true,
  }
  console.log('Mock implementation - returning mock client for code:', code)
  return mockClient
}

/**
 * Get client projects
 * @param clientId - Client ID
 * @param organizationId - Organization ID
 * @returns Promise<Project[]>
 */
export const getClientProjects = async (clientId: string, organizationId: string): Promise<Project[]> => {
  // Mock implementation - return mock projects
  const mockProjects: Project[] = [
    {
      id: 'proj1',
      organizationId: 'dev-org-123',
      title: 'Website Redesign',
      description: 'Complete redesign of the company website',
      type: 'one-time',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      deadline: new Date('2024-03-31'),
      assignedTo: ['user-1', 'user-2'],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      clientId: 'dev-client-123',
      budget: 15000,
      tags: ['web', 'design'],
      clientCode: 'ABC1',
      assignedManagerId: 'manager1',
      assignedManagerName: 'Sarah Johnson',
      assignedManagerTitle: 'Senior Project Manager',
      assignedManagerEmail: 'sarah.johnson@launchbird.com',
      assignedManagerPhone: '+1 (555) 987-6543',
    },
    {
      id: 'proj2',
      organizationId: 'dev-org-123',
      title: 'Mobile App Development',
      description: 'iOS and Android app development',
      type: 'ongoing',
      status: 'planning',
      progress: 25,
      startDate: new Date('2024-02-01'),
      assignedTo: ['user-3'],
      createdBy: 'user-1',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      clientId: 'dev-client-123',
      budget: 25000,
      tags: ['mobile', 'app'],
      clientCode: 'XYZ2',
      assignedManagerId: 'manager1',
      assignedManagerName: 'Sarah Johnson',
      assignedManagerTitle: 'Senior Project Manager',
      assignedManagerEmail: 'sarah.johnson@launchbird.com',
      assignedManagerPhone: '+1 (555) 987-6543',
    },
  ]
  console.log('Mock implementation - returning mock projects for client:', clientId)
  return mockProjects
}

/**
 * Submit client feedback
 * @param feedback - Feedback data
 * @returns Promise<void>
 */
export const submitClientFeedback = async (feedback: {
  projectId: string
  clientName: string
  clientEmail: string
  rating: number
  category: string
  comment: string
}): Promise<void> => {
  // Mock implementation - no actual submission
  console.log('Mock implementation - submitting client feedback:', feedback)
} 