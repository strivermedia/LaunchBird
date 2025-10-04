/**
 * Local Storage Utilities
 * Comprehensive local storage solution for development mode
 */

import type { 
  Client, 
  Project, 
  Task, 
  Organization,
  Activity,
  TimeSummary,
  TeamMemberWorkload,
  DashboardStats
} from '@/types'
import type { UserProfile } from '@/lib/auth'
import { getTasks } from '@/lib/tasks'

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

/**
 * Generic local storage operations
 */
export class LocalStorageManager {
  static getKey(prefix: string, organizationId: string, suffix?: string): string {
    return suffix ? `${prefix}-${organizationId}-${suffix}` : `${prefix}-${organizationId}`
  }

  static async get<T>(key: string, defaultValue: T): Promise<T> {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        return this.convertDates(parsed)
      }
      return defaultValue
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }

  static async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error deleting from localStorage (${key}):`, error)
    }
  }

  private static convertDates(obj: any): any {
    if (obj === null || obj === undefined) return obj
    if (obj instanceof Date) return obj
    if (typeof obj !== 'object') return obj

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDates(item))
    }

    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.isDateString(value)) {
        converted[key] = new Date(value)
      } else if (typeof value === 'object') {
        converted[key] = this.convertDates(value)
      } else {
        converted[key] = value
      }
    }
    return converted
  }

  private static isDateString(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str) || 
           /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str)
  }
}

/**
 * Mock data generators
 */
export const MockData = {
  // Mock clients
  clients: (organizationId: string): Client[] => [
    {
      id: 'client-1',
      organizationId,
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
      organizationId,
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
    },
    {
      id: 'client-3',
      organizationId,
      name: 'Global Solutions Ltd',
      email: 'info@globalsolutions.com',
      company: 'Global Solutions Ltd',
      phone: '+1-555-0789',
      assignedManagerId: 'user-1',
      assignedManagerName: 'John Doe',
      status: 'inactive',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-10'),
      totalProjects: 2,
      activeProjects: 0,
      completedProjects: 2,
      lastContactDate: new Date('2024-01-05'),
      notes: '',
    }
  ],

  // Mock projects
  projects: (organizationId: string): Project[] => [
    {
      id: 'project-1',
      organizationId,
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
      id: 'project-2',
      organizationId,
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
      id: 'project-3',
      organizationId,
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
  ],

  // Mock users
  users: (organizationId: string): UserProfile[] => [
    {
      uid: 'user-1',
      email: 'john@launchbird.com',
      role: 'admin',
      title: 'John Doe',
      jobTitle: 'Senior Developer',
      location: 'San Francisco, CA',
      organizationId,
      organizationRole: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-25')
    },
    {
      uid: 'user-2',
      email: 'jane@launchbird.com',
      role: 'team_member',
      title: 'Jane Smith',
      jobTitle: 'Marketing Specialist',
      location: 'New York, NY',
      organizationId,
      organizationRole: 'member',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-25')
    },
    {
      uid: 'user-3',
      email: 'bob@launchbird.com',
      role: 'team_member',
      title: 'Bob Johnson',
      jobTitle: 'UI/UX Designer',
      location: 'Austin, TX',
      organizationId,
      organizationRole: 'member',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25')
    }
  ],

  // Mock organization
  organization: (organizationId: string): Organization => ({
    id: organizationId,
    name: 'LaunchBird Development',
    slug: 'launchbird-development',
    plan: 'pro',
    settings: {
      branding: {
        logo: '',
        primaryColor: '#3b82f6',
        companyName: 'LaunchBird Development',
        domain: 'launchbird.dev'
      },
      features: {
        clientAccess: true,
        customDomains: true,
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
    members: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25')
  }),

  // Mock activities
  activities: (organizationId: string): Activity[] => [
    {
      id: 'activity-1',
      organizationId,
      type: 'project_update',
      title: 'Project Update',
      description: 'Updated project status and timeline',
      userId: 'user-1',
      userName: 'John Doe',
      userTitle: 'Senior Developer',
      projectId: 'project-1',
      timestamp: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 'activity-2',
      organizationId,
      type: 'project_update',
      title: 'Task Completed',
      description: 'Completed design phase and wireframes',
      userId: 'user-2',
      userName: 'Jane Smith',
      userTitle: 'Marketing Specialist',
      projectId: 'project-1',
      timestamp: new Date('2024-01-14T15:30:00Z')
    },
    {
      id: 'activity-3',
      organizationId,
      type: 'message',
      title: 'Client Meeting',
      description: 'Scheduled weekly check-in with client',
      userId: 'user-1',
      userName: 'John Doe',
      userTitle: 'Senior Developer',
      projectId: 'project-2',
      timestamp: new Date('2024-01-13T14:00:00Z')
    }
  ],

  // Mock time summary
  timeSummary: (organizationId: string): TimeSummary => ({
    totalHours: 42.5,
    todayHours: 6.5,
    thisWeekHours: 32.0,
    thisMonthHours: 156.0,
    projectBreakdown: [
      { projectId: 'project-1', projectTitle: 'E-commerce Website Redesign', hours: 25.0 },
      { projectId: 'project-2', projectTitle: 'PPC Campaign Management', hours: 17.5 },
    ]
  }),

  // Mock team workload
  teamWorkload: (organizationId: string): TeamMemberWorkload[] => [
    {
      userId: 'user-1',
      userName: 'John Doe',
      userTitle: 'Senior Developer',
      totalTasks: 15,
      completedTasks: 12,
      inProgressTasks: 2,
      overdueTasks: 1,
      totalHours: 42.5,
      avatar: '/avatars/john.jpg'
    },
    {
      userId: 'user-2',
      userName: 'Jane Smith',
      userTitle: 'Marketing Specialist',
      totalTasks: 10,
      completedTasks: 8,
      inProgressTasks: 1,
      overdueTasks: 1,
      totalHours: 38.0,
      avatar: '/avatars/jane.jpg'
    },
    {
      userId: 'user-3',
      userName: 'Bob Johnson',
      userTitle: 'UI/UX Designer',
      totalTasks: 8,
      completedTasks: 6,
      inProgressTasks: 1,
      overdueTasks: 1,
      totalHours: 35.5,
      avatar: '/avatars/bob.jpg'
    }
  ]
}

/**
 * Client Management with Local Storage
 */
export class ClientStorage {
  static async getClients(organizationId: string): Promise<Client[]> {
    const key = LocalStorageManager.getKey('clients', organizationId)
    const clients = await LocalStorageManager.get(key, MockData.clients(organizationId))
    return clients
  }

  static async getClient(organizationId: string, clientId: string): Promise<Client | null> {
    const clients = await this.getClients(organizationId)
    return clients.find(client => client.id === clientId) || null
  }

  static async createClient(organizationId: string, clientData: Omit<Client, 'id'>): Promise<Client> {
    const clients = await this.getClients(organizationId)
    const newClient: Client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedClients = [newClient, ...clients]
    const key = LocalStorageManager.getKey('clients', organizationId)
    await LocalStorageManager.set(key, updatedClients)
    
    return newClient
  }

  static async updateClient(organizationId: string, clientId: string, updates: Partial<Client>): Promise<Client | null> {
    const clients = await this.getClients(organizationId)
    const clientIndex = clients.findIndex(client => client.id === clientId)
    
    if (clientIndex === -1) return null
    
    const updatedClient = {
      ...clients[clientIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    const updatedClients = [...clients]
    updatedClients[clientIndex] = updatedClient
    
    const key = LocalStorageManager.getKey('clients', organizationId)
    await LocalStorageManager.set(key, updatedClients)
    
    return updatedClient
  }

  static async deleteClient(organizationId: string, clientId: string): Promise<boolean> {
    const clients = await this.getClients(organizationId)
    const updatedClients = clients.filter(client => client.id !== clientId)
    
    if (updatedClients.length === clients.length) return false
    
    const key = LocalStorageManager.getKey('clients', organizationId)
    await LocalStorageManager.set(key, updatedClients)
    
    return true
  }
}

/**
 * Project Management with Local Storage
 */
export class ProjectStorage {
  static async getProjects(organizationId: string): Promise<Project[]> {
    const key = LocalStorageManager.getKey('projects', organizationId)
    const projects = await LocalStorageManager.get(key, MockData.projects(organizationId))
    return projects
  }

  static async getProject(organizationId: string, projectId: string): Promise<Project | null> {
    const projects = await this.getProjects(organizationId)
    return projects.find(project => project.id === projectId) || null
  }

  static async createProject(organizationId: string, projectData: Omit<Project, 'id'>): Promise<Project> {
    const projects = await this.getProjects(organizationId)
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedProjects = [newProject, ...projects]
    const key = LocalStorageManager.getKey('projects', organizationId)
    await LocalStorageManager.set(key, updatedProjects)
    
    return newProject
  }

  static async updateProject(organizationId: string, projectId: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = await this.getProjects(organizationId)
    const projectIndex = projects.findIndex(project => project.id === projectId)
    
    if (projectIndex === -1) return null
    
    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    const updatedProjects = [...projects]
    updatedProjects[projectIndex] = updatedProject
    
    const key = LocalStorageManager.getKey('projects', organizationId)
    await LocalStorageManager.set(key, updatedProjects)
    
    return updatedProject
  }

  static async deleteProject(organizationId: string, projectId: string): Promise<boolean> {
    const projects = await this.getProjects(organizationId)
    const updatedProjects = projects.filter(project => project.id !== projectId)
    
    if (updatedProjects.length === projects.length) return false
    
    const key = LocalStorageManager.getKey('projects', organizationId)
    await LocalStorageManager.set(key, updatedProjects)
    
    return true
  }
}

/**
 * User Management with Local Storage
 */
export class UserStorage {
  static async getUsers(organizationId: string): Promise<UserProfile[]> {
    const key = LocalStorageManager.getKey('users', organizationId)
    const users = await LocalStorageManager.get(key, MockData.users(organizationId))
    return users
  }

  static async getUser(organizationId: string, userId: string): Promise<UserProfile | null> {
    const users = await this.getUsers(organizationId)
    return users.find(user => user.uid === userId) || null
  }

  static async createUser(organizationId: string, userData: Omit<UserProfile, 'uid'>): Promise<UserProfile> {
    const users = await this.getUsers(organizationId)
    const newUser: UserProfile = {
      uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedUsers = [newUser, ...users]
    const key = LocalStorageManager.getKey('users', organizationId)
    await LocalStorageManager.set(key, updatedUsers)
    
    return newUser
  }

  static async updateUser(organizationId: string, userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const users = await this.getUsers(organizationId)
    const userIndex = users.findIndex(user => user.uid === userId)
    
    if (userIndex === -1) return null
    
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    const updatedUsers = [...users]
    updatedUsers[userIndex] = updatedUser
    
    const key = LocalStorageManager.getKey('users', organizationId)
    await LocalStorageManager.set(key, updatedUsers)
    
    return updatedUser
  }

  static async deleteUser(organizationId: string, userId: string): Promise<boolean> {
    const users = await this.getUsers(organizationId)
    const updatedUsers = users.filter(user => user.uid !== userId)
    
    if (updatedUsers.length === users.length) return false
    
    const key = LocalStorageManager.getKey('users', organizationId)
    await LocalStorageManager.set(key, updatedUsers)
    
    return true
  }
}

/**
 * Organization Management with Local Storage
 */
export class OrganizationStorage {
  static async getOrganization(organizationId: string): Promise<Organization | null> {
    const key = LocalStorageManager.getKey('organization', organizationId)
    const organization = await LocalStorageManager.get(key, MockData.organization(organizationId))
    return organization
  }

  static async updateOrganization(organizationId: string, updates: Partial<Organization>): Promise<Organization | null> {
    const organization = await this.getOrganization(organizationId)
    if (!organization) return null
    
    const updatedOrganization = {
      ...organization,
      ...updates,
      updatedAt: new Date()
    }
    
    const key = LocalStorageManager.getKey('organization', organizationId)
    await LocalStorageManager.set(key, updatedOrganization)
    
    return updatedOrganization
  }

  static async getOrganizationMembers(organizationId: string): Promise<any[]> {
    const users = await UserStorage.getUsers(organizationId)
    return users.map(user => ({
      id: user.uid,
      email: user.email,
      role: user.role,
      organizationRole: user.organizationRole || 'member',
      title: user.title,
      joinedAt: user.createdAt
    }))
  }
}

/**
 * Dashboard Data with Local Storage
 */
export class DashboardStorage {
  static async getActivities(organizationId: string): Promise<Activity[]> {
    const key = LocalStorageManager.getKey('activities', organizationId)
    const activities = await LocalStorageManager.get(key, MockData.activities(organizationId))
    return activities
  }

  static async getTimeSummary(organizationId: string): Promise<TimeSummary> {
    const key = LocalStorageManager.getKey('timeSummary', organizationId)
    const timeSummary = await LocalStorageManager.get(key, MockData.timeSummary(organizationId))
    return timeSummary
  }

  static async getTeamWorkload(organizationId: string): Promise<TeamMemberWorkload[]> {
    const key = LocalStorageManager.getKey('teamWorkload', organizationId)
    const teamWorkload = await LocalStorageManager.get(key, MockData.teamWorkload(organizationId))
    return teamWorkload
  }

  static async getDashboardStats(organizationId: string): Promise<DashboardStats> {
    const [projects, clients, users, tasks] = await Promise.all([
      ProjectStorage.getProjects(organizationId),
      ClientStorage.getClients(organizationId),
      UserStorage.getUsers(organizationId),
      getTasks(organizationId)
    ])

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in-progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date() > t.dueDate && t.status !== 'completed').length,
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalUsers: users.length,
      totalTeamMembers: users.length,
      activeTeamMembers: users.length,
      upcomingDeadlines: tasks.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && t.status !== 'completed').length,
      totalRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      monthlyRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 12,
    }
  }
}

/**
 * Clear all data for an organization (for development/testing)
 */
export const clearOrganizationData = async (organizationId: string): Promise<void> => {
  const keys = [
    'clients',
    'projects', 
    'users',
    'organization',
    'activities',
    'timeSummary',
    'teamWorkload'
  ]

  for (const key of keys) {
    const fullKey = LocalStorageManager.getKey(key, organizationId)
    await LocalStorageManager.delete(fullKey)
  }
}

/**
 * Reset to mock data (for development/testing)
 */
export const resetToMockData = async (organizationId: string): Promise<void> => {
  await clearOrganizationData(organizationId)
  // Mock data will be loaded automatically on next access
}
