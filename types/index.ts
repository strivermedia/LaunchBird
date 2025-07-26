/**
 * LaunchBird Dashboard Types
 * Comprehensive type definitions for the dashboard components
 */

import { UserProfile } from '@/lib/auth'

/**
 * Project types
 */
export type ProjectType = 'one-time' | 'ongoing'
export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold'

export interface Project {
  id: string
  title: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  progress: number // 0-100
  startDate: Date
  endDate?: Date
  deadline?: Date
  assignedTo: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  clientId?: string
  budget?: number
  tags?: string[]
}

/**
 * Task types
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed'

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  assignedTo: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  completedAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  estimatedHours?: number
  actualHours?: number
}

/**
 * Activity types
 */
export type ActivityType = 'project_update' | 'task_completed' | 'client_feedback' | 'shoutout' | 'message' | 'deadline_reminder'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  userId: string
  userName: string
  userTitle?: string
  projectId?: string
  taskId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Message types
 */
export interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderTitle?: string
  recipientId?: string
  projectId?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Shoutout types
 */
export interface Shoutout {
  id: string
  content: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  projectId?: string
  createdAt: Date
}

/**
 * Time tracking types
 */
export interface TimeEntry {
  id: string
  userId: string
  projectId?: string
  taskId?: string
  description: string
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  createdAt: Date
  updatedAt: Date
}

export interface TimeSummary {
  totalHours: number
  todayHours: number
  thisWeekHours: number
  thisMonthHours: number
  projectBreakdown: Array<{
    projectId: string
    projectTitle: string
    hours: number
  }>
}

/**
 * Weather types
 */
export interface WeatherData {
  temperature: number
  condition: string
  icon: string
  location: string
  humidity?: number
  windSpeed?: number
  feelsLike?: number
  lastUpdated: Date
}

/**
 * Team workload types
 */
export interface TeamMemberWorkload {
  userId: string
  userName: string
  userTitle?: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalHours: number
  avatar?: string
}

/**
 * Dashboard stats types
 */
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  teamMembers: number
  totalHours: number
  thisWeekHours: number
}

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Dashboard filters
 */
export interface DashboardFilters {
  projectStatus?: ProjectStatus[]
  taskStatus?: TaskStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  assignedTo?: string[]
}

/**
 * Quick action types
 */
export type QuickActionType = 'create_project' | 'create_task' | 'create_shoutout' | 'send_message'

export interface QuickAction {
  type: QuickActionType
  label: string
  icon: string
  description: string
  requiresAdmin?: boolean
  action: () => void
}

/**
 * Chart data types
 */
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Geolocation types
 */
export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: Date
}

/**
 * User preferences types
 */
export interface UserPreferences {
  theme: Theme
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  dashboard: {
    showWeather: boolean
    showTimeTracking: boolean
    showRecentActivity: boolean
    showTeamWorkload: boolean
  }
}

/**
 * Notification types
 */
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  userId: string
  createdAt: Date
  actionUrl?: string
}

/**
 * Client feedback types
 */
export interface ClientFeedback {
  id: string
  projectId: string
  clientId: string
  clientName: string
  rating: number // 1-5
  comment: string
  category: 'general' | 'design' | 'functionality' | 'communication' | 'timeline'
  createdAt: Date
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

/**
 * Deadline reminder types
 */
export interface DeadlineReminder {
  id: string
  title: string
  description: string
  deadline: Date
  projectId?: string
  taskId?: string
  assignedTo: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Dashboard context types
 */
export interface DashboardContextType {
  user: UserProfile | null
  theme: Theme
  setTheme: (theme: Theme) => void
  stats: DashboardStats | null
  projects: Project[]
  tasks: Task[]
  activities: Activity[]
  timeSummary: TimeSummary | null
  weather: WeatherData | null
  teamWorkload: TeamMemberWorkload[]
  loading: boolean
  refreshData: () => void
}

/**
 * Form types
 */
export interface CreateProjectForm {
  title: string
  description?: string
  type: ProjectType
  startDate: Date
  endDate?: Date
  deadline?: Date
  assignedTo: string[]
  clientId?: string
  budget?: number
  tags?: string[]
}

export interface CreateTaskForm {
  title: string
  description?: string
  projectId: string
  assignedTo: string
  priority: TaskPriority
  dueDate?: Date
  estimatedHours?: number
}

export interface CreateShoutoutForm {
  content: string
  toUserId: string
  projectId?: string
}

export interface SendMessageForm {
  content: string
  recipientId?: string
  projectId?: string
} 