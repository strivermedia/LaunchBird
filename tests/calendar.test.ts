/**
 * Calendar Utilities Test Suite
 * Tests for calendar event transformations, date utilities, and filter logic
 */

import { transformTaskToEvent, transformProjectToEvents, transformTimeEntryToEvent } from '@/lib/calendar'
import type { Task, Project } from '@/types'
import type { TimeEntry } from '@/types'
import type { CalendarEvent } from '@/types/calendar'

describe('Calendar Event Transformations', () => {
  describe('transformTaskToEvent', () => {
    it('should transform a task with startDate and dueDate to a calendar event', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-01-20'),
        assignedTo: ['user-1'],
        assignedToNames: ['John Doe'],
        createdBy: 'user-1',
        createdByName: 'Creator',
        projectId: 'project-1',
        projectTitle: 'Test Project',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: ['test'],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)

      expect(event).not.toBeNull()
      expect(event?.id).toBe('task-task-1')
      expect(event?.title).toBe('Test Task')
      expect(event?.start).toEqual(new Date('2024-01-15'))
      expect(event?.end).toEqual(new Date('2024-01-20'))
      expect(event?.type).toBe('task')
      expect(event?.extendedProps.taskId).toBe('task-1')
      expect(event?.extendedProps.priority).toBe('high')
      expect(event?.extendedProps.navigateTo).toBe('/tasks?taskId=task-1')
    })

    it('should return null for task without dates', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).toBeNull()
    })

    it('should use dueDate as startDate if startDate is missing', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2024-01-20'),
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).not.toBeNull()
      expect(event?.start).toEqual(new Date('2024-01-20'))
    })

    it('should respect time information when only startDate exists', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        startDate: new Date('2024-01-15T14:30:00'), // 2:30 PM
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).not.toBeNull()
      expect(event?.allDay).toBe(false) // Should NOT be all-day because it has time
    })

    it('should mark as all-day when startDate has zero time components', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        startDate: new Date('2024-01-15T00:00:00'), // Midnight
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).not.toBeNull()
      expect(event?.allDay).toBe(true) // Should be all-day because time is zero
    })

    it('should mark as all-day only when both dates have zero time components', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        startDate: new Date('2024-01-15T00:00:00'), // Midnight
        dueDate: new Date('2024-01-20T00:00:00'), // Midnight
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).not.toBeNull()
      expect(event?.allDay).toBe(true) // Both have zero time
    })

    it('should NOT mark as all-day when one date has time and other has zero time', () => {
      const task: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        startDate: new Date('2024-01-15T14:30:00'), // 2:30 PM
        dueDate: new Date('2024-01-20T00:00:00'), // Midnight
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(task)
      expect(event).not.toBeNull()
      expect(event?.allDay).toBe(false) // startDate has time, so NOT all-day
    })

    it('should set correct color based on priority', () => {
      const highPriorityTask: Task = {
        id: 'task-1',
        organizationId: 'org-1',
        title: 'High Priority',
        status: 'todo',
        priority: 'urgent',
        startDate: new Date('2024-01-15'),
        assignedTo: [],
        assignedToNames: [],
        createdBy: 'user-1',
        createdByName: 'Creator',
        dependencies: [],
        isRecurring: false,
        recurrencePattern: 'none',
        tags: [],
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTaskToEvent(highPriorityTask)
      expect(event?.extendedProps.color).toBe('#ef4444') // red-500 for urgent
    })
  })

  describe('transformProjectToEvents', () => {
    it('should transform a project with dates to milestone events', () => {
      const project: Project = {
        id: 'project-1',
        organizationId: 'org-1',
        title: 'Test Project',
        description: 'Test Description',
        type: 'one-time',
        status: 'in-progress',
        progress: 50,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15'),
        deadline: new Date('2024-03-15'),
        assignedTo: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const events = transformProjectToEvents(project)

      expect(events).toHaveLength(3) // start, deadline, end
      expect(events[0].type).toBe('milestone')
      expect(events[0].title).toContain('Start')
      expect(events[1].title).toContain('Deadline')
      expect(events[2].title).toContain('End')
    })

    it('should create range event for ongoing projects', () => {
      const project: Project = {
        id: 'project-1',
        organizationId: 'org-1',
        title: 'Ongoing Project',
        type: 'ongoing',
        status: 'in-progress',
        progress: 50,
        startDate: new Date('2024-01-15'),
        assignedTo: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const events = transformProjectToEvents(project)

      const rangeEvent = events.find(e => e.type === 'project')
      expect(rangeEvent).toBeDefined()
      expect(rangeEvent?.start).toEqual(new Date('2024-01-15'))
    })
  })

  describe('transformTimeEntryToEvent', () => {
    it('should transform a time entry to a calendar event', () => {
      const entry: TimeEntry = {
        id: 'time-1',
        organizationId: 'org-1',
        userId: 'user-1',
        description: 'Worked on feature',
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        duration: 480, // 8 hours
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTimeEntryToEvent(entry)

      expect(event).not.toBeNull()
      expect(event?.id).toBe('time-time-1')
      expect(event?.title).toBe('Worked on feature')
      expect(event?.start).toEqual(new Date('2024-01-15T09:00:00'))
      expect(event?.end).toEqual(new Date('2024-01-15T17:00:00'))
      expect(event?.allDay).toBe(false)
      expect(event?.type).toBe('time_entry')
    })

    it('should return null for time entry without startTime', () => {
      const entry: TimeEntry = {
        id: 'time-1',
        organizationId: 'org-1',
        userId: 'user-1',
        description: 'Worked on feature',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTimeEntryToEvent(entry)
      expect(event).toBeNull()
    })

    it('should calculate endTime from duration if not provided', () => {
      const entry: TimeEntry = {
        id: 'time-1',
        organizationId: 'org-1',
        userId: 'user-1',
        description: 'Worked on feature',
        startTime: new Date('2024-01-15T09:00:00'),
        duration: 120, // 2 hours
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const event = transformTimeEntryToEvent(entry)
      expect(event).not.toBeNull()
      expect(event?.end).toEqual(new Date('2024-01-15T11:00:00'))
    })
  })
})

describe('Calendar Filter Logic', () => {
  it('should filter events by project', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Task 1',
        start: new Date(),
        type: 'task',
        extendedProps: { projectId: 'project-1' }
      },
      {
        id: 'event-2',
        title: 'Task 2',
        start: new Date(),
        type: 'task',
        extendedProps: { projectId: 'project-2' }
      }
    ]

    const filtered = events.filter(e => e.extendedProps.projectId === 'project-1')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('event-1')
  })

  it('should filter events by date range', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Task 1',
        start: new Date('2024-01-15'),
        type: 'task',
        extendedProps: {}
      },
      {
        id: 'event-2',
        title: 'Task 2',
        start: new Date('2024-02-15'),
        type: 'task',
        extendedProps: {}
      }
    ]

    const start = new Date('2024-01-01')
    const end = new Date('2024-01-31')
    const filtered = events.filter(e => e.start >= start && e.start <= end)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('event-1')
  })
})

describe('Date Utilities', () => {
  it('should calculate duration between dates correctly', () => {
    const start = new Date('2024-01-15')
    const end = new Date('2024-01-20')
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(duration).toBe(5)
  })

  it('should handle all-day events correctly', () => {
    const start = new Date('2024-01-15T00:00:00')
    const end = new Date('2024-01-15T00:00:00')
    const isAllDay = start.getHours() === 0 && end.getHours() === 0
    expect(isAllDay).toBe(true)
  })
})

