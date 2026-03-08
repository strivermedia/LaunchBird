/**
 * Calendar-specific types for FullCalendar and Gantt chart integration
 */

import type { Task, Project } from './index'

/**
 * Calendar event for FullCalendar
 */
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  allDay?: boolean
  type: 'task' | 'project' | 'milestone' | 'time_entry'
  resourceId?: string
  extendedProps: {
    taskId?: string
    projectId?: string
    priority?: string
    status?: string
    assignees?: string[]
    assigneeNames?: string[]
    navigateTo?: string // Route for click navigation
    description?: string
    tags?: string[]
    color?: string
    // ... other metadata
  }
}

/**
 * Gantt chart task structure
 */
export interface GanttTask {
  id: string
  text: string
  start_date: Date | string
  end_date?: Date | string
  duration?: number // in days
  progress?: number // 0-100
  type?: 'task' | 'project' | 'milestone'
  parent?: string // Parent task ID
  open?: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: string
  assignees?: string[]
  projectId?: string
  dependencies?: string[] // Array of task IDs this task depends on
  color?: string
  extendedProps?: {
    taskId?: string
    projectId?: string
    navigateTo?: string
    description?: string
    tags?: string[]
  }
}

/**
 * Calendar filter options
 */
export interface CalendarFilters {
  projects?: string[]
  teamMembers?: string[]
  taskTypes?: ('recurring' | 'one-time' | 'ongoing')[]
  status?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * Calendar view type
 */
export type CalendarView = 'day' | 'week' | 'month' | 'gantt'

/**
 * Gantt view level
 */
export type GanttZoom = 'day' | 'week' | 'month'








