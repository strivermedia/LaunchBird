// Supabase removed; use mock data helpers
import { isDevMode } from './auth'
import {
  Project,
  Task,
  Activity,
  Message,
  Shoutout,
  TimeEntry,
  TimeSummary,
  DashboardStats,
  TeamMemberWorkload,
  ProjectStatus,
  TaskStatus,
  ActivityType,
} from '@/types'

/**
 * Dashboard service - Mock implementations for development
 */

/**
 * Get dynamic gradient colors based on time of day
 * Inspired by muted color palette from the design
 * @returns object with gradient colors
 */
export const getDynamicGradient = () => {
  const hour = new Date().getHours()
  
  // Early morning (5-8 AM): Soft blue-green to pale yellow
  if (hour >= 5 && hour < 8) {
    return {
      from: 'from-blue-50 to-emerald-50',
      darkFrom: 'dark:from-blue-950 dark:to-emerald-950',
      cardBg: 'bg-gradient-to-br from-blue-50/80 to-emerald-50/80',
      darkCardBg: 'dark:bg-gradient-to-br dark:from-blue-950/80 dark:to-emerald-950/80'
    }
  }
  // Morning (8-12 PM): Light blue-green to soft orange
  else if (hour >= 8 && hour < 12) {
    return {
      from: 'from-cyan-50 to-orange-50',
      darkFrom: 'dark:from-cyan-950 dark:to-orange-950',
      cardBg: 'bg-gradient-to-br from-cyan-50/80 to-orange-50/80',
      darkCardBg: 'dark:bg-gradient-to-br dark:from-cyan-950/80 dark:to-orange-950/80'
    }
  }
  // Afternoon (12-5 PM): Warm yellow to soft orange
  else if (hour >= 12 && hour < 17) {
    return {
      from: 'from-yellow-50 to-orange-50',
      darkFrom: 'dark:from-yellow-950 dark:to-orange-950',
      cardBg: 'bg-gradient-to-br from-yellow-50/80 to-orange-50/80',
      darkCardBg: 'dark:bg-gradient-to-br dark:from-yellow-950/80 dark:to-orange-950/80'
    }
  }
  // Evening (5-8 PM): Soft orange to warm pink
  else if (hour >= 17 && hour < 20) {
    return {
      from: 'from-orange-50 to-pink-50',
      darkFrom: 'dark:from-orange-950 dark:to-pink-950',
      cardBg: 'bg-gradient-to-br from-orange-50/80 to-pink-50/80',
      darkCardBg: 'dark:bg-gradient-to-br dark:from-orange-950/80 dark:to-pink-950/80'
    }
  }
  // Night (8 PM-5 AM): Deep blue to purple
  else {
    return {
      from: 'from-blue-50 to-purple-50',
      darkFrom: 'dark:from-blue-950 dark:to-purple-950',
      cardBg: 'bg-gradient-to-br from-blue-50/80 to-purple-50/80',
      darkCardBg: 'dark:bg-gradient-to-br dark:from-blue-950/80 dark:to-purple-950/80'
    }
  }
}

/**
 * Get gradient colors as CSS values for inline styles
 * @returns object with CSS color values
 */
export const getGradientColors = () => {
  const hour = new Date().getHours()
  
  // Early morning (5-8 AM): Soft purple-blue to lavender
  if (hour >= 5 && hour < 8) {
    return {
      from: '#8b5cf6', // violet-500
      to: '#a78bfa'    // violet-400
    }
  }
  // Morning (8-12 PM): Purple to soft pink
  else if (hour >= 8 && hour < 12) {
    return {
      from: '#7c3aed', // purple-600 (app's primary color)
      to: '#ec4899'    // pink-500
    }
  }
  // Afternoon (12-5 PM): Purple to warm magenta
  else if (hour >= 12 && hour < 17) {
    return {
      from: '#7c3aed', // purple-600
      to: '#be185d'    // pink-700
    }
  }
  // Evening (5-8 PM): Purple to deep magenta
  else if (hour >= 17 && hour < 20) {
    return {
      from: '#7c3aed', // purple-600
      to: '#9d174d'    // pink-800
    }
  }
  // Night (8 PM-5 AM): Deep purple to indigo
  else {
    return {
      from: '#5b21b6', // purple-800
      to: '#3730a3'    // indigo-800
    }
  }
}

/**
 * Get personalized greeting based on time of day
 * @param userName - User's name or title
 * @returns string
 */
export const getGreeting = (userName: string): string => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return `Good Morning, ${userName}!`
  } else if (hour >= 12 && hour < 17) {
    return `Good Afternoon, ${userName}!`
  } else if (hour >= 17 && hour < 22) {
    return `Good Evening, ${userName}!`
  } else {
    return `Good Night, ${userName}!`
  }
}

/**
 * Get current local time formatted
 * @returns string
 */
export const getLocalTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get mock data for development mode
 * @returns object with mock data
 */
const getMockData = () => {
  const mockProjects: Project[] = [
    {
      id: 'project-1',
      organizationId: 'org-1',
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
      clientId: 'client-1',
      budget: 15000,
      tags: ['web', 'design'],
      clientCode: 'ABC1',
      assignedManagerId: 'user-1',
      assignedManagerName: 'Sarah Johnson',
      assignedManagerTitle: 'Senior Developer',
      assignedManagerEmail: 'sarah@launchbird.com',
      assignedManagerPhone: '+1-555-0123',
    },
    {
      id: 'project-2',
      organizationId: 'org-1',
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
      clientId: 'client-2',
      budget: 25000,
      tags: ['mobile', 'app'],
      clientCode: 'XYZ2',
      assignedManagerId: 'user-3',
      assignedManagerName: 'Mike Chen',
      assignedManagerTitle: 'Mobile Developer',
      assignedManagerEmail: 'mike@launchbird.com',
      assignedManagerPhone: '+1-555-0456',
    },
  ]

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      organizationId: 'org-1',
      projectId: 'project-1',
      title: 'Design Homepage',
      description: 'Create wireframes and mockups for homepage',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'user-1',
      createdBy: 'user-1',
      dueDate: new Date('2024-01-20'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'task-2',
      organizationId: 'org-1',
      projectId: 'project-1',
      title: 'Implement Navigation',
      description: 'Build responsive navigation component',
      status: 'todo',
      priority: 'medium',
      assignedTo: 'user-2',
      createdBy: 'user-1',
      dueDate: new Date('2024-01-25'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  const mockActivities: Activity[] = [
    {
      id: 'activity-1',
      organizationId: 'org-1',
      type: 'project_update',
      title: 'Project Update',
      description: 'Updated project status and timeline',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userTitle: 'Senior Developer',
      projectId: 'project-1',
      timestamp: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'activity-2',
      organizationId: 'org-1',
      type: 'task_completed',
      title: 'Task Completed',
      description: 'Completed design phase and wireframes',
      userId: 'user-2',
      userName: 'Mike Chen',
      userTitle: 'Designer',
      projectId: 'project-1',
      timestamp: new Date('2024-01-14T15:30:00Z'),
    },
  ]

  const mockTimeSummary: TimeSummary = {
    totalHours: 42.5,
    todayHours: 6.5,
    thisWeekHours: 32.0,
    thisMonthHours: 156.0,
    projectBreakdown: [
      { projectId: 'project-1', projectTitle: 'Website Redesign', hours: 25.0 },
      { projectId: 'project-2', projectTitle: 'Mobile App Development', hours: 17.5 },
    ],
  }

  const mockTeamWorkload: TeamMemberWorkload[] = [
    {
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userTitle: 'Senior Developer',
      totalTasks: 15,
      completedTasks: 12,
      inProgressTasks: 2,
      overdueTasks: 1,
      totalHours: 42.5,
      avatar: '/avatars/sarah.jpg',
    },
    {
      userId: 'user-2',
      userName: 'Mike Chen',
      userTitle: 'Designer',
      totalTasks: 10,
      completedTasks: 8,
      inProgressTasks: 1,
      overdueTasks: 1,
      totalHours: 38.0,
      avatar: '/avatars/mike.jpg',
    },
  ]

  return {
    projects: mockProjects,
    tasks: mockTasks,
    activities: mockActivities,
    timeSummary: mockTimeSummary,
    teamWorkload: mockTeamWorkload,
  }
}

/**
 * Get projects for dashboard
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @returns Promise<Project[]>
 */
export const getDashboardProjects = async (
  organizationId: string,
  userId: string,
  userRole: string
): Promise<Project[]> => {
  // Mock implementation
  return getMockData().projects
}

/**
 * Get tasks for dashboard
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @returns Promise<Task[]>
 */
export const getDashboardTasks = async (
  organizationId: string,
  userId: string,
  userRole: string
): Promise<Task[]> => {
  // Mock implementation
  return getMockData().tasks
}

/**
 * Get activities for dashboard
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @returns Promise<Activity[]>
 */
export const getDashboardActivities = async (
  organizationId: string,
  userId: string,
  userRole: string
): Promise<Activity[]> => {
  // Mock implementation
  return getMockData().activities
}

/**
 * Get time summary for dashboard
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @returns Promise<TimeSummary>
 */
export const getTimeSummary = async (
  organizationId: string,
  userId: string
): Promise<TimeSummary> => {
  // Mock implementation
  return getMockData().timeSummary
}

/**
 * Get team workload for dashboard
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @returns Promise<TeamMemberWorkload[]>
 */
export const getTeamWorkload = async (
  organizationId: string,
  userId: string,
  userRole: string
): Promise<TeamMemberWorkload[]> => {
  // Mock implementation
  return getMockData().teamWorkload
}

/**
 * Subscribe to real-time project updates
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToProjects = (
  organizationId: string,
  userId: string,
  userRole: string,
  callback: (projects: Project[]) => void
) => {
  // Mock implementation - return no-op unsubscribe
  console.log('Mock implementation - subscribing to projects')
  callback(getMockData().projects)
  return () => {}
}

/**
 * Subscribe to real-time activity updates
 * @param organizationId - Organization ID
 * @param userId - User ID
 * @param userRole - User role
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToActivities = (
  organizationId: string,
  userId: string,
  userRole: string,
  callback: (activities: Activity[]) => void
) => {
  // Mock implementation - return no-op unsubscribe
  console.log('Mock implementation - subscribing to activities')
  callback(getMockData().activities)
  return () => {}
} 