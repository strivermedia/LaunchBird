/**
 * Projects Database Integration
 * Handles project data operations with local storage for development
 */

import { Project, ProjectType, ProjectStatus } from '@/types'
import { ProjectStorage } from './localStorage'
import { db } from './platform'

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Mock data for development (will be replaced with Supabase calls)
const mockProjects: Project[] = [
  {
    id: '1',
    organizationId: 'org-1',
    title: 'E-commerce Website Redesign',
    description: 'Complete redesign of client e-commerce platform with modern UI/UX',
    type: 'one-time',
    status: 'in-progress',
    progress: 65,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
    deadline: new Date('2024-03-15'),
    assignedTo: ['user-1', 'user-2'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    clientId: 'client-1',
    budget: 15000,
    tags: ['web-design', 'e-commerce'],
    clientCode: 'AB12',
    assignedManagerId: 'user-1',
    assignedManagerName: 'John Doe',
    assignedManagerTitle: 'Senior Developer',
    assignedManagerEmail: 'john@launchbird.com',
    assignedManagerPhone: '+1-555-0123'
  },
  {
    id: '2',
    organizationId: 'org-1',
    title: 'PPC Campaign Management',
    description: 'Ongoing PPC campaign management and optimization',
    type: 'ongoing',
    status: 'in-progress',
    progress: 85,
    startDate: new Date('2024-01-01'),
    assignedTo: ['user-3'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
    clientId: 'client-2',
    budget: 5000,
    tags: ['ppc', 'marketing'],
    clientCode: 'CD34',
    assignedManagerId: 'user-3',
    assignedManagerName: 'Jane Smith',
    assignedManagerTitle: 'Marketing Specialist',
    assignedManagerEmail: 'jane@launchbird.com',
    assignedManagerPhone: '+1-555-0456'
  },
  {
    id: '3',
    organizationId: 'org-1',
    title: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    type: 'one-time',
    status: 'planning',
    progress: 25,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-01'),
    deadline: new Date('2024-06-01'),
    assignedTo: ['user-1', 'user-4'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    clientId: 'client-3',
    budget: 25000,
    tags: ['mobile', 'app-development'],
    clientCode: 'EF56',
    assignedManagerId: 'user-1',
    assignedManagerName: 'John Doe',
    assignedManagerTitle: 'Senior Developer',
    assignedManagerEmail: 'john@launchbird.com',
    assignedManagerPhone: '+1-555-0123'
  }
]

/**
 * Project interface for database operations
 */
export interface CreateProjectData {
  title: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  progress: number
  startDate: Date
  endDate?: Date
  deadline?: Date
  assignedTo: string[]
  createdBy: string
  organizationId: string
  clientId?: string
  budget?: number
  tags?: string[]
  clientCode?: string
  assignedManagerId?: string
  assignedManagerName?: string
  assignedManagerTitle?: string
  assignedManagerEmail?: string
  assignedManagerPhone?: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateProjectData {
  title?: string
  description?: string
  type?: ProjectType
  status?: ProjectStatus
  progress?: number
  startDate?: Date
  endDate?: Date
  deadline?: Date
  assignedTo?: string[]
  clientId?: string
  budget?: number
  tags?: string[]
  clientCode?: string
  assignedManagerId?: string
  assignedManagerName?: string
  assignedManagerTitle?: string
  assignedManagerEmail?: string
  assignedManagerPhone?: string
}

/**
 * Get all projects for an organization
 * @param organizationId - Organization ID
 * @param userId - Current user ID for role-based filtering
 * @param userRole - Current user role
 * @returns Promise<Project[]>
 */
export async function getProjects(
  organizationId: string,
  userId?: string,
  userRole?: string
): Promise<Project[]> {
  // Use local storage in development mode
  if (DEV_MODE) {
    console.log('🔧 Development mode: Using local storage for projects')
    return ProjectStorage.getProjects(organizationId)
  }

  try {
    // Fetch from Supabase
    const { db } = await import('./platform')
    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching projects:', error)
      throw error
    }

    // Transform Supabase data to Project type
    const projects: Project[] = (data || []).map((project: any): Project => ({
      id: project.id,
      organizationId: project.organization_id,
      title: project.name,
      description: project.description,
      type: (project.type || 'one-time') as ProjectType,
      status: project.status as ProjectStatus,
      progress: project.progress || 0,
      startDate: project.start_date ? new Date(project.start_date) : new Date(project.created_at),
      endDate: project.end_date ? new Date(project.end_date) : undefined,
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      assignedTo: project.assigned_to || [],
      createdBy: project.created_by,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
      clientId: project.client_id,
      tags: project.tags || []
    }))
    
    // Role-based filtering
    let filteredProjects = projects

    // Team members can only see assigned projects
    if (userRole === 'team_member' && userId) {
      filteredProjects = filteredProjects.filter((project: Project) =>
        project.assignedTo.includes(userId)
      )
    }

    return filteredProjects
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects')
  }
}

/**
 * Get a single project by ID
 * @param projectId - Project ID
 * @param userId - Current user ID for role-based access
 * @param userRole - Current user role
 * @returns Promise<Project | null>
 */
export async function getProject(
  projectId: string,
  userId?: string,
  userRole?: string
): Promise<Project | null> {
  // Use local storage in development mode
  if (DEV_MODE) {
    console.log('🔧 Development mode: Using local storage for project')
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    return ProjectStorage.getProject(organizationId, projectId)
  }

  try {
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    const project = await ProjectStorage.getProject(organizationId, projectId)
    
    if (!project) return null

    // Role-based access control
    if (userRole === 'team_member' && userId && !project.assignedTo.includes(userId)) {
      throw new Error('Access denied')
    }

    return project
  } catch (error) {
    console.error('Error fetching project:', error)
    throw new Error('Failed to fetch project')
  }
}

/**
 * Create a new project
 * @param projectData - Project data
 * @returns Promise<Project>
 */
export async function createProject(projectData: CreateProjectData): Promise<Project> {
  try {
    return ProjectStorage.createProject(projectData.organizationId, projectData)
  } catch (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }
}

/**
 * Update an existing project
 * @param projectId - Project ID
 * @param updateData - Update data
 * @param userId - Current user ID for role-based access
 * @param userRole - Current user role
 * @returns Promise<Project>
 */
export async function updateProject(
  projectId: string,
  updateData: UpdateProjectData,
  userId?: string,
  userRole?: string
): Promise<Project> {
  try {
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    
    // First, get the current project to check access
    const currentProject = await ProjectStorage.getProject(organizationId, projectId)
    if (!currentProject) {
      throw new Error('Project not found')
    }

    // Role-based access control
    if (userRole === 'team_member' && userId && !currentProject.assignedTo.includes(userId)) {
      throw new Error('Access denied')
    }

    const updatedProject = await ProjectStorage.updateProject(organizationId, projectId, updateData)
    if (!updatedProject) {
      throw new Error('Project not found')
    }

    return updatedProject
  } catch (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }
}

/**
 * Delete a project
 * @param projectId - Project ID
 * @param userId - Current user ID for role-based access
 * @param userRole - Current user role
 * @returns Promise<void>
 */
export async function deleteProject(
  projectId: string,
  userId?: string,
  userRole?: string
): Promise<void> {
  try {
    const organizationId = 'dev-org-123' // In a real app, this would come from user context
    
    // First, get the current project to check access
    const currentProject = await ProjectStorage.getProject(organizationId, projectId)
    if (!currentProject) {
      throw new Error('Project not found')
    }

    // Only organization admins can delete projects
    if (userRole !== 'admin') {
      throw new Error('Access denied - only organization admins can delete projects')
    }

    const success = await ProjectStorage.deleteProject(organizationId, projectId)
    if (!success) {
      throw new Error('Project not found')
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }
}

/**
 * Generate a unique 4-character client code
 * @param organizationId - Organization ID
 * @returns Promise<string>
 */
export async function generateClientCode(organizationId: string): Promise<string> {
  try {
    if (!db) {
      throw new Error('Database not initialized')
    }

    // Check for existing codes to ensure uniqueness
    const { data: existingCodes } = await db
      .from('client_portal_codes')
      .select('code')
      .eq('project_id', 
        db.from('projects')
          .select('id')
          .eq('organization_id', organizationId)
      )

    const existingCodeList = (existingCodes || []).map((item: any) => item.code)

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code: string
    let attempts = 0
    const maxAttempts = 100

    do {
      code = ''
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      attempts++
    } while (existingCodeList.includes(code) && attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique client code')
    }

    return code
  } catch (error) {
    console.error('Error generating client code:', error)
    throw new Error('Failed to generate client code')
  }
}

/**
 * Get project statistics for an organization
 * @param organizationId - Organization ID
 * @param userId - Current user ID for role-based filtering
 * @param userRole - Current user role
 * @returns Promise<object>
 */
export async function getProjectStats(
  organizationId: string,
  userId?: string,
  userRole?: string
): Promise<{
  total: number
  active: number
  completed: number
  planning: number
  onHold: number
  averageProgress: number
  totalBudget: number
}> {
  try {
    const projects = await getProjects(organizationId, userId, userRole)

    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'in-progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      averageProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    }

    return stats
  } catch (error) {
    console.error('Error fetching project stats:', error)
    throw new Error('Failed to fetch project statistics')
  }
}

/**
 * Search projects by title, description, or tags
 * @param organizationId - Organization ID
 * @param searchTerm - Search term
 * @param userId - Current user ID for role-based filtering
 * @param userRole - Current user role
 * @returns Promise<Project[]>
 */
export async function searchProjects(
  organizationId: string,
  searchTerm: string,
  userId?: string,
  userRole?: string
): Promise<Project[]> {
  try {
    const projects = await getProjects(organizationId, userId, userRole)
    
    const searchLower = searchTerm.toLowerCase()
    
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  } catch (error) {
    console.error('Error searching projects:', error)
    throw new Error('Failed to search projects')
  }
}

/**
 * Filter projects by status, type, or other criteria
 * @param organizationId - Organization ID
 * @param filters - Filter criteria
 * @param userId - Current user ID for role-based filtering
 * @param userRole - Current user role
 * @returns Promise<Project[]>
 */
export async function filterProjects(
  organizationId: string,
  filters: {
    status?: ProjectStatus[]
    type?: ProjectType[]
    assignedTo?: string[]
    dateRange?: { start: Date; end: Date }
  },
  userId?: string,
  userRole?: string
): Promise<Project[]> {
  try {
    const projects = await getProjects(organizationId, userId, userRole)
    
    return projects.filter(project => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(project.status)) return false
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(project.type)) return false
      }

      // Assigned to filter
      if (filters.assignedTo && filters.assignedTo.length > 0) {
        if (!project.assignedTo.some(userId => filters.assignedTo!.includes(userId))) {
          return false
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const projectStart = new Date(project.startDate)
        if (projectStart < filters.dateRange.start || projectStart > filters.dateRange.end) {
          return false
        }
      }

      return true
    })
  } catch (error) {
    console.error('Error filtering projects:', error)
    throw new Error('Failed to filter projects')
  }
}
