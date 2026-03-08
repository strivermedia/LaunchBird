/**
 * Calendar Data Layer
 * Fetches and transforms tasks, projects, and time entries into calendar event format
 */

import type { Task, Project } from '@/types'
import type { TimeEntry } from '@/types'
import type { CalendarEvent, CalendarFilters } from '@/types/calendar'
import { getTasks } from './tasks'
import { getProjects } from './projects'
import { getTimeEntries } from './time-tracking'

/**
 * Get all calendar events for an organization
 */
export async function getCalendarEvents(
  organizationId: string,
  filters?: CalendarFilters
): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = []

  // Fetch tasks, projects, and time entries
  const [tasks, projects, timeEntries] = await Promise.all([
    getTasks(organizationId),
    getProjects(organizationId),
    getTimeEntries(organizationId, filters)
  ])

  // Transform tasks to calendar events
  for (const task of tasks) {
    // Apply filters
    if (filters) {
      if (filters.projects && task.projectId && !filters.projects.includes(task.projectId)) {
        continue
      }
      if (filters.teamMembers && !task.assignedTo.some(id => filters.teamMembers!.includes(id))) {
        continue
      }
      if (filters.status && !filters.status.includes(task.status)) {
        continue
      }
      if (filters.taskTypes) {
        const isRecurring = task.isRecurring
        const isOngoing = task.projectId && projects.find(p => p.id === task.projectId)?.type === 'ongoing'
        const taskType = isRecurring ? 'recurring' : (isOngoing ? 'ongoing' : 'one-time')
        if (!filters.taskTypes.includes(taskType as any)) {
          continue
        }
      }
    }

    const taskEvent = transformTaskToEvent(task)
    if (taskEvent) {
      events.push(taskEvent)
    }
  }

  // Transform projects to calendar events (milestones)
  for (const project of projects) {
    // Apply filters
    if (filters) {
      if (filters.projects && !filters.projects.includes(project.id)) {
        continue
      }
      if (filters.status && !filters.status.includes(project.status)) {
        continue
      }
    }

    const projectEvents = transformProjectToEvents(project)
    events.push(...projectEvents)
  }

  // Transform time entries to calendar events
  for (const entry of timeEntries) {
    // Apply filters
    if (filters) {
      if (filters.projects && entry.projectId && !filters.projects.includes(entry.projectId)) {
        continue
      }
      if (filters.teamMembers && !filters.teamMembers.includes(entry.userId)) {
        continue
      }
    }

    const timeEvent = transformTimeEntryToEvent(entry)
    if (timeEvent) {
      events.push(timeEvent)
    }
  }

  // Apply date range filter if specified
  if (filters?.dateRange) {
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = event.end ? new Date(event.end) : eventStart
      return (
        (eventStart >= filters.dateRange!.start && eventStart <= filters.dateRange!.end) ||
        (eventEnd >= filters.dateRange!.start && eventEnd <= filters.dateRange!.end) ||
        (eventStart <= filters.dateRange!.start && eventEnd >= filters.dateRange!.end)
      )
    })
  }

  return events
}

/**
 * Transform a Task to a CalendarEvent
 */
export function transformTaskToEvent(task: Task): CalendarEvent | null {
  // Only show tasks that have explicit scheduling dates.
  // We intentionally do NOT use createdAt as a calendar fallback.
  if (!task.startDate && !task.dueDate) {
    return null
  }

  const startDate = task.startDate || task.dueDate!
  const endDate =
    task.dueDate ||
    (task.startDate ? new Date(task.startDate.getTime() + 24 * 60 * 60 * 1000) : undefined)

  // Determine color based on priority
  const colorMap: Record<string, string> = {
    urgent: '#ef4444', // red-500
    high: '#f97316', // orange-500
    medium: '#3b82f6', // blue-500
    low: '#10b981' // green-500
  }

  // Determine if event is all-day:
  // - If both dates exist, check if both have zero time components
  // - If only one date exists, check if that date has zero time components
  // - A task with only startDate should respect its time information
  const hasZeroTime = (date: Date): boolean => {
    return date.getHours() === 0 && 
           date.getMinutes() === 0 && 
           date.getSeconds() === 0 && 
           date.getMilliseconds() === 0
  }

  let allDay = false
  if (task.startDate && task.dueDate) {
    // Both dates exist - check if both have zero time
    allDay = hasZeroTime(task.startDate) && hasZeroTime(task.dueDate)
  } else if (task.startDate) {
    // Only startDate exists - check if it has zero time
    allDay = hasZeroTime(task.startDate)
  } else if (task.dueDate) {
    // Only dueDate exists - check if it has zero time
    allDay = hasZeroTime(task.dueDate)
  } else {
    // Neither exists (shouldn't happen due to null check above, but default to allDay)
    allDay = true
  }

  return {
    id: `task-${task.id}`,
    title: task.title,
    start: startDate,
    end: endDate,
    allDay,
    type: 'task',
    extendedProps: {
      taskId: task.id,
      projectId: task.projectId,
      priority: task.priority,
      status: task.status,
      assignees: task.assignedTo,
      assigneeNames: task.assignedToNames,
      navigateTo: `/tasks?taskId=${task.id}`,
      description: task.description,
      color: colorMap[task.priority] || colorMap.medium
    }
  }
}

/**
 * Transform a Project to CalendarEvents (milestones)
 */
export function transformProjectToEvents(project: Project): CalendarEvent[] {
  const events: CalendarEvent[] = []

  // Project start milestone
  if (project.startDate) {
    events.push({
      id: `project-start-${project.id}`,
      title: `${project.title} - Start`,
      start: project.startDate,
      allDay: true,
      type: 'milestone',
      extendedProps: {
        projectId: project.id,
        status: project.status,
        navigateTo: `/projects/${project.id}`,
        description: `Project start: ${project.description}`,
        color: '#10b981' // green-500
      }
    })
  }

  // Project deadline milestone
  if (project.deadline) {
    events.push({
      id: `project-deadline-${project.id}`,
      title: `${project.title} - Deadline`,
      start: project.deadline,
      allDay: true,
      type: 'milestone',
      extendedProps: {
        projectId: project.id,
        status: project.status,
        navigateTo: `/projects/${project.id}`,
        description: `Project deadline: ${project.description}`,
        color: '#ef4444' // red-500
      }
    })
  }

  // Project end milestone
  if (project.endDate) {
    events.push({
      id: `project-end-${project.id}`,
      title: `${project.title} - End`,
      start: project.endDate,
      allDay: true,
      type: 'milestone',
      extendedProps: {
        projectId: project.id,
        status: project.status,
        navigateTo: `/projects/${project.id}`,
        description: `Project end: ${project.description}`,
        color: '#3b82f6' // blue-500
      }
    })
  }

  // For ongoing projects with a defined start date, create a range event banner
  if (project.type === 'ongoing' && project.startDate) {
    const endDate =
      project.endDate ||
      project.deadline ||
      new Date(project.startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // Default to ~1 month
    events.push({
      id: `project-${project.id}`,
      title: project.title,
      start: project.startDate,
      end: endDate,
      allDay: true,
      type: 'project',
      extendedProps: {
        projectId: project.id,
        status: project.status,
        navigateTo: `/projects/${project.id}`,
        description: project.description,
        color: '#8b5cf6' // purple-500
      }
    })
  }

  return events
}

/**
 * Transform a TimeEntry to a CalendarEvent
 */
export function transformTimeEntryToEvent(entry: TimeEntry): CalendarEvent | null {
  if (!entry.startTime) {
    return null
  }

  const endTime = entry.endTime || new Date(entry.startTime.getTime() + (entry.duration || 60) * 60 * 1000)

  return {
    id: `time-${entry.id}`,
    title: entry.description,
    start: entry.startTime,
    end: endTime,
    allDay: false,
    type: 'time_entry',
    extendedProps: {
      taskId: entry.taskId,
      projectId: entry.projectId,
      navigateTo: entry.taskId ? `/tasks?taskId=${entry.taskId}` : (entry.projectId ? `/projects/${entry.projectId}` : undefined),
      description: entry.description,
      color: '#a855f7' // purple-500
    }
  }
}

/**
 * Update task dates after drag-and-drop
 */
export async function updateTaskDates(
  organizationId: string,
  taskId: string,
  startDate: Date,
  dueDate: Date
): Promise<void> {
  const { updateTask } = await import('./tasks')
  await updateTask(organizationId, taskId, {
    startDate,
    dueDate
  })
}

/**
 * Update project dates after drag-and-drop
 */
export async function updateProjectDates(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
  deadline?: Date
): Promise<void> {
  const { updateProject } = await import('./projects')
  await updateProject(projectId, {
    startDate,
    endDate,
    deadline
  }, undefined, undefined)
}

