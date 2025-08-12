// Firebase removed; use mock data helpers
import { db } from './platform'
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
 * Dashboard service for Firestore operations
 * Handles all data fetching and manipulation for the dashboard
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
      from: '#7c3aed', // purple-600 (app's primary color)
      to: '#be185d'    // pink-700
    }
  }
  // Evening (5-8 PM): Deep purple to rose
  else if (hour >= 17 && hour < 20) {
    return {
      from: '#6d28d9', // purple-700
      to: '#e11d48'    // rose-600
    }
  }
  // Night (8 PM-5 AM): Deep purple to indigo
  else {
    return {
      from: '#5b21b6', // purple-800
      to: '#4f46e5'    // indigo-600
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
 */
const getMockData = () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      organizationId: 'org-1',
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      type: 'one-time',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      deadline: new Date('2024-03-10'),
      assignedTo: ['user1', 'user2'],
      createdBy: 'admin',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
      budget: 15000,
      tags: ['design', 'web'],
    },
    {
      id: '2',
      organizationId: 'org-1',
      title: 'Mobile App Development',
      description: 'iOS and Android app for client',
      type: 'ongoing',
      status: 'planning',
      progress: 25,
      startDate: new Date('2024-02-01'),
      assignedTo: ['user3'],
      createdBy: 'admin',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
      budget: 25000,
      tags: ['mobile', 'app'],
    },
  ]

  const mockTasks: Task[] = [
    {
      id: '1',
      organizationId: 'org-1',
      title: 'Design Homepage',
      description: 'Create new homepage design',
      projectId: '1',
      assignedTo: 'user1',
      priority: 'high',
      status: 'in-progress',
      dueDate: new Date('2024-02-15'),
      createdBy: 'admin',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      estimatedHours: 8,
      actualHours: 6,
    },
    {
      id: '2',
      organizationId: 'org-1',
      title: 'Implement Navigation',
      description: 'Build responsive navigation menu',
      projectId: '1',
      assignedTo: 'user2',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date('2024-02-20'),
      createdBy: 'admin',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date(),
      estimatedHours: 4,
    },
  ]

  const mockActivities: Activity[] = [
    {
      id: '1',
      organizationId: 'org-1',
      type: 'project_update',
      title: 'Project Updated',
      description: 'Website Redesign progress updated to 65%',
      userId: 'user1',
      userName: 'John Doe',
      userTitle: 'Designer',
      projectId: '1',
      timestamp: new Date(),
    },
    {
      id: '2',
      organizationId: 'org-1',
      type: 'task_completed',
      title: 'Task Completed',
      description: 'Design Homepage task marked as completed',
      userId: 'user1',
      userName: 'John Doe',
      userTitle: 'Designer',
      projectId: '1',
      taskId: '1',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      organizationId: 'org-1',
      type: 'client_feedback',
      title: 'Client Feedback',
      description: 'Great work on the initial designs!',
      userId: 'client1',
      userName: 'Client Name',
      userTitle: 'Client',
      projectId: '1',
      timestamp: new Date(Date.now() - 7200000),
    },
  ]

  const mockTimeSummary: TimeSummary = {
    totalHours: 156,
    todayHours: 6.5,
    thisWeekHours: 32,
    thisMonthHours: 128,
    projectBreakdown: [
      { projectId: '1', projectTitle: 'Website Redesign', hours: 45 },
      { projectId: '2', projectTitle: 'Mobile App Development', hours: 23 },
    ],
  }

  const mockTeamWorkload: TeamMemberWorkload[] = [
    {
      userId: 'user1',
      userName: 'John Doe',
      userTitle: 'Designer',
      totalTasks: 8,
      completedTasks: 5,
      inProgressTasks: 2,
      overdueTasks: 1,
      totalHours: 45,
    },
    {
      userId: 'user2',
      userName: 'Jane Smith',
      userTitle: 'Developer',
      totalTasks: 6,
      completedTasks: 3,
      inProgressTasks: 2,
      overdueTasks: 1,
      totalHours: 38,
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
 * Get projects from Firestore
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param organizationId - Organization ID for multi-tenant filtering
 * @returns Promise<Project[]>
 */
export const getProjects = async (
  userId: string,
  userRole: string,
  organizationId?: string
): Promise<Project[]> => {
  if (isDevMode()) {
    return getMockData().projects
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return []
  }

  try {
    let projectsQuery

    if (userRole === 'admin') {
      // Admins see all projects in their organization
      projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      )
    } else {
      // Team members see assigned projects in their organization
      projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId),
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(projectsQuery)
    const projects: Project[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      projects.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        deadline: data.deadline?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project)
    })

    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

/**
 * Get tasks from Firestore
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param organizationId - Organization ID for multi-tenant filtering
 * @returns Promise<Task[]>
 */
export const getTasks = async (
  userId: string,
  userRole: string,
  organizationId?: string
): Promise<Task[]> => {
  if (isDevMode()) {
    return getMockData().tasks
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return []
  }

  try {
    let tasksQuery

    if (userRole === 'admin') {
      // Admins see all tasks in their organization
      tasksQuery = query(
        collection(db, 'tasks'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      )
    } else {
      // Team members see assigned tasks in their organization
      tasksQuery = query(
        collection(db, 'tasks'),
        where('organizationId', '==', organizationId),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(tasksQuery)
    const tasks: Task[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tasks.push({
        id: doc.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Task)
    })

    return tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

/**
 * Get recent activities from Firestore
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param limit - Number of activities to fetch
 * @returns Promise<Activity[]>
 */
export const getRecentActivities = async (
  userId: string,
  userRole: string,
  limitCount: number = 10
): Promise<Activity[]> => {
  if (isDevMode()) {
    return getMockData().activities
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return []
  }

  try {
    let activitiesQuery

    if (userRole === 'admin') {
      // Admins see all activities
      activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
    } else {
      // Team members see activities related to their projects/tasks
      activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(activitiesQuery)
    const activities: Activity[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Activity)
    })

    return activities
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

/**
 * Get time tracking summary
 * @param userId - Current user ID
 * @returns Promise<TimeSummary>
 */
export const getTimeSummary = async (userId: string): Promise<TimeSummary> => {
  if (isDevMode()) {
    return getMockData().timeSummary
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return {
      totalHours: 0,
      todayHours: 0,
      thisWeekHours: 0,
      thisMonthHours: 0,
      projectBreakdown: [],
    }
  }

  try {
    // This would typically involve complex aggregation queries
    // For now, returning mock data structure
    return {
      totalHours: 0,
      todayHours: 0,
      thisWeekHours: 0,
      thisMonthHours: 0,
      projectBreakdown: [],
    }
  } catch (error) {
    console.error('Error fetching time summary:', error)
    return {
      totalHours: 0,
      todayHours: 0,
      thisWeekHours: 0,
      thisMonthHours: 0,
      projectBreakdown: [],
    }
  }
}

/**
 * Get team workload data
 * @param userRole - Current user role
 * @returns Promise<TeamMemberWorkload[]>
 */
export const getTeamWorkload = async (
  userRole: string
): Promise<TeamMemberWorkload[]> => {
  if (isDevMode()) {
    return getMockData().teamWorkload
  }

  if (!db || userRole !== 'admin') {
    return []
  }

  try {
    // This would typically involve complex aggregation queries
    // For now, returning mock data structure
    return []
  } catch (error) {
    console.error('Error fetching team workload:', error)
    return []
  }
}

/**
 * Get dashboard statistics
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @returns Promise<DashboardStats>
 */
export const getDashboardStats = async (
  userId: string,
  userRole: string
): Promise<DashboardStats> => {
  if (isDevMode()) {
    return {
      totalProjects: 2,
      activeProjects: 1,
      completedProjects: 0,
      totalTasks: 8,
      completedTasks: 5,
      overdueTasks: 1,
      teamMembers: 3,
      totalHours: 156,
      thisWeekHours: 32,
    }
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      teamMembers: 0,
      totalHours: 0,
      thisWeekHours: 0,
    }
  }

  try {
    // This would typically involve complex aggregation queries
    // For now, returning mock data structure
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      teamMembers: 0,
      totalHours: 0,
      thisWeekHours: 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      teamMembers: 0,
      totalHours: 0,
      thisWeekHours: 0,
    }
  }
}

/**
 * Subscribe to real-time updates for projects
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToProjects = (
  userId: string,
  userRole: string,
  callback: (projects: Project[]) => void
) => {
  if (isDevMode()) {
    // In dev mode, return mock data and no-op unsubscribe
    callback(getMockData().projects)
    return () => {}
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    callback([])
    return () => {}
  }

  try {
    let projectsQuery

    if (userRole === 'admin') {
      projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      )
    } else {
      projectsQuery = query(
        collection(db, 'projects'),
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      )
    }

    return onSnapshot(projectsQuery, (querySnapshot) => {
      const projects: Project[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        projects.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          deadline: data.deadline?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Project)
      })
      callback(projects)
    })
  } catch (error) {
    console.error('Error subscribing to projects:', error)
    callback([])
    return () => {}
  }
}

/**
 * Subscribe to real-time updates for activities
 * @param userId - Current user ID
 * @param userRole - Current user role
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export const subscribeToActivities = (
  userId: string,
  userRole: string,
  callback: (activities: Activity[]) => void
) => {
  if (isDevMode()) {
    // In dev mode, return mock data and no-op unsubscribe
    callback(getMockData().activities)
    return () => {}
  }

  if (!db) {
    console.warn('Firestore is not initialized')
    callback([])
    return () => {}
  }

  try {
    let activitiesQuery

    if (userRole === 'admin') {
      activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
    } else {
      activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
    }

    return onSnapshot(activitiesQuery, (querySnapshot) => {
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
    console.error('Error subscribing to activities:', error)
    callback([])
    return () => {}
  }
} 