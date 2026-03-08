/**
 * Task Management Utilities
 * Local storage implementation for development mode
 */

import type { Task, TaskStatus, TaskPriority, TaskRecurrence } from '@/types'
import { getProjects } from './projects'

// Mock data for development
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    organizationId: 'dev-org-123',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with proper validation',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignedTo: ['user-1', 'user-2'],
    assignedToNames: ['John Doe', 'Jane Smith'],
    createdBy: 'dev-user-123',
    createdByName: 'Developer',
    projectId: 'project-1',
    projectTitle: 'Authentication System',
    dependencies: [],
    isRecurring: false,
    recurrencePattern: 'none',
    tags: [],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    estimatedHours: 8,
    actualHours: 0,
  },
  {
    id: 'task-2',
    organizationId: 'dev-org-123',
    title: 'Design database schema',
    description: 'Create database tables and relationships for the new system',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    assignedTo: ['user-3'],
    assignedToNames: ['Bob Johnson'],
    createdBy: 'dev-user-123',
    createdByName: 'Developer',
    projectId: 'project-1',
    projectTitle: 'Authentication System',
    dependencies: ['task-1'],
    isRecurring: false,
    recurrencePattern: 'none',
    tags: [],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    estimatedHours: 12,
    actualHours: 4,
  },
  {
    id: 'task-3',
    organizationId: 'dev-org-123',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for all components',
    status: 'completed',
    priority: 'low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    assignedTo: ['user-1'],
    assignedToNames: ['John Doe'],
    createdBy: 'dev-user-123',
    createdByName: 'Developer',
    projectId: 'project-2',
    projectTitle: 'Testing Framework',
    dependencies: [],
    isRecurring: false,
    recurrencePattern: 'none',
    tags: [],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    estimatedHours: 6,
    actualHours: 6,
  },
  {
    id: 'task-4',
    organizationId: 'dev-org-123',
    title: 'Code review and documentation',
    description: 'Review code changes and update documentation',
    status: 'review',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    assignedTo: ['user-2'],
    assignedToNames: ['Jane Smith'],
    createdBy: 'dev-user-123',
    createdByName: 'Developer',
    projectId: 'project-1',
    projectTitle: 'Authentication System',
    dependencies: ['task-2'],
    isRecurring: false,
    recurrencePattern: 'none',
    tags: [],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    estimatedHours: 4,
    actualHours: 2,
  },
]

// Mock users for development
const MOCK_USERS = [
  { id: 'user-1', name: 'John Doe', email: 'john@launchbird.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@launchbird.com' },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@launchbird.com' },
  { id: 'dev-user-123', name: 'Developer', email: 'dev@launchbird.com' },
]

// Mock projects for development
const MOCK_PROJECTS = [
  { id: 'project-1', title: 'Authentication System' },
  { id: 'project-2', title: 'Testing Framework' },
  { id: 'project-3', title: 'User Dashboard' },
]

/**
 * Get tasks from local storage or return mock data
 */
const getLocalTasks = (organizationId: string): Task[] => {
  if (typeof window === 'undefined') {
    return MOCK_TASKS.filter(task => task.organizationId === organizationId)
  }

  try {
    const storedTasks = localStorage.getItem(`tasks-${organizationId}`)
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks)
      return tasks.map((task: any) => ({
        ...task,
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined,
      }))
    }
    return MOCK_TASKS.filter(task => task.organizationId === organizationId)
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error)
    return MOCK_TASKS.filter(task => task.organizationId === organizationId)
  }
}

export const getTasks = async (organizationId: string): Promise<Task[]> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  
  if (DEV_MODE) {
    // Use localStorage in dev mode
    return getLocalTasks(organizationId)
  }

  // Use Supabase
  try {
    const { db } = await import('./platform')
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching tasks:', error)
      throw error
    }

    // Transform Supabase data to Task type
    return (data || []).map((task: any) => ({
      id: task.id,
      organizationId: task.organization_id,
      title: task.title,
      description: task.description || '',
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      startDate: task.start_date ? new Date(task.start_date) : undefined,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      assignedTo: task.assigned_to || [],
      assignedToNames: task.assigned_to_names || [],
      createdBy: task.created_by,
      createdByName: task.created_by_name,
      projectId: task.project_id,
      projectTitle: task.project_title,
      parentTaskId: task.parent_task_id,
      dependencies: task.dependencies || [],
      isRecurring: task.is_recurring || false,
      recurrencePattern: task.recurrence_pattern || 'none',
      recurrenceEndDate: task.recurrence_end_date ? new Date(task.recurrence_end_date) : undefined,
      tags: task.tags || [],
      estimatedHours: task.estimated_hours || 0,
      actualHours: task.actual_hours || 0,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    // Fallback to local tasks if Supabase is unavailable
    return getLocalTasks(organizationId)
  }
}

/**
 * Save tasks to local storage
 */
export const saveTasks = async (organizationId: string, tasks: Task[]): Promise<void> => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(`tasks-${organizationId}`, JSON.stringify(tasks))
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error)
  }
}

/**
 * Create a new task
 */
export const createTask = async (organizationId: string, taskData: Partial<Task>): Promise<Task> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  if (!DEV_MODE) {
    try {
      const { db, auth } = await import('./platform')
      const { data: userResult } = await auth.getUser()
      const user = userResult?.user

      const insertPayload: any = {
        organization_id: organizationId,
        title: taskData.title || '',
        description: taskData.description || null,
        status: (taskData.status || 'todo') as TaskStatus,
        priority: (taskData.priority || 'medium') as TaskPriority,
        start_date: taskData.startDate ? new Date(taskData.startDate).toISOString() : null,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        assigned_to: taskData.assignedTo || [],
        assigned_to_names: taskData.assignedToNames || [],
        created_by: taskData.createdBy || user?.id,
        created_by_name: taskData.createdByName || user?.email || 'Unknown',
        project_id: taskData.projectId || null,
        project_title: taskData.projectTitle || null,
        parent_task_id: taskData.parentTaskId || null,
        dependencies: taskData.dependencies || [],
        is_recurring: taskData.isRecurring || false,
        recurrence_pattern: (taskData.recurrencePattern || 'none') as TaskRecurrence,
        recurrence_end_date: taskData.recurrenceEndDate
          ? new Date(taskData.recurrenceEndDate).toISOString()
          : null,
        tags: taskData.tags || [],
        estimated_hours: taskData.estimatedHours || 0,
        actual_hours: taskData.actualHours || 0,
        completed_at: taskData.completedAt ? new Date(taskData.completedAt).toISOString() : null,
      }

      const { data, error } = await db
        .from('tasks')
        .insert(insertPayload)
        .select('*')
        .single()

      if (error) throw error

      return {
        id: data.id,
        organizationId: data.organization_id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        assignedTo: data.assigned_to || [],
        assignedToNames: data.assigned_to_names || [],
        createdBy: data.created_by,
        createdByName: data.created_by_name,
        projectId: data.project_id,
        projectTitle: data.project_title,
        parentTaskId: data.parent_task_id,
        dependencies: data.dependencies || [],
        isRecurring: data.is_recurring || false,
        recurrencePattern: data.recurrence_pattern || 'none',
        recurrenceEndDate: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
        tags: data.tags || [],
        comments: [],
        attachments: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedHours: data.estimated_hours || 0,
        actualHours: data.actual_hours || 0,
      }
    } catch (error) {
      console.error('Error creating task in Supabase (falling back to localStorage):', error)
    }
  }

  const tasks = await getTasks(organizationId)
  
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    title: taskData.title || '',
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    startDate: taskData.startDate,
    dueDate: taskData.dueDate,
    assignedTo: taskData.assignedTo || [],
    assignedToNames: taskData.assignedToNames || [],
    createdBy: taskData.createdBy || 'dev-user-123',
    createdByName: taskData.createdByName || 'Developer',
    projectId: taskData.projectId,
    projectTitle: taskData.projectTitle,
    parentTaskId: taskData.parentTaskId,
    dependencies: taskData.dependencies || [],
    isRecurring: taskData.isRecurring || false,
    recurrencePattern: taskData.recurrencePattern || 'none',
    recurrenceEndDate: taskData.recurrenceEndDate,
    tags: [],
    comments: taskData.comments || [],
    attachments: taskData.attachments || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: taskData.completedAt,
    estimatedHours: taskData.estimatedHours || 0,
    actualHours: taskData.actualHours || 0,
  }

  const updatedTasks = [newTask, ...tasks]
  await saveTasks(organizationId, updatedTasks)
  
  return newTask
}

/**
 * Update an existing task
 */
export const updateTask = async (organizationId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  if (!DEV_MODE) {
    try {
      const { db } = await import('./platform')

      const payload: any = {}

      if (updates.title !== undefined) payload.title = updates.title
      if (updates.description !== undefined) payload.description = updates.description ?? null
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.priority !== undefined) payload.priority = updates.priority
      if (updates.startDate !== undefined)
        payload.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null
      if (updates.dueDate !== undefined)
        payload.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null
      if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo || []
      if (updates.assignedToNames !== undefined) payload.assigned_to_names = updates.assignedToNames || []
      if (updates.projectId !== undefined) payload.project_id = updates.projectId ?? null
      if (updates.projectTitle !== undefined) payload.project_title = updates.projectTitle ?? null
      if (updates.parentTaskId !== undefined) payload.parent_task_id = updates.parentTaskId ?? null
      if (updates.dependencies !== undefined) payload.dependencies = updates.dependencies || []
      if (updates.isRecurring !== undefined) payload.is_recurring = !!updates.isRecurring
      if (updates.recurrencePattern !== undefined) payload.recurrence_pattern = updates.recurrencePattern ?? 'none'
      if (updates.recurrenceEndDate !== undefined)
        payload.recurrence_end_date = updates.recurrenceEndDate
          ? new Date(updates.recurrenceEndDate).toISOString()
          : null
      if (updates.tags !== undefined) payload.tags = updates.tags || []
      if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours ?? 0
      if (updates.actualHours !== undefined) payload.actual_hours = updates.actualHours ?? 0
      if (updates.completedAt !== undefined)
        payload.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null

      const { data, error } = await db
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
        .eq('organization_id', organizationId)
        .select('*')
        .single()

      if (error) throw error

      // Estimated hours rollups:
      // - If a subtask's estimated hours changes, recompute parent's estimated hours as sum(subtasks).
      // - If a parent task has subtasks, parent estimated hours is always the sum(subtasks) (no manual override).
      const isEstimatedUpdate = updates.estimatedHours !== undefined
      if (isEstimatedUpdate) {
        if (data.parent_task_id) {
          // Subtask changed -> recompute parent
          const parentId = data.parent_task_id as string
          const { data: children, error: childrenError } = await db
            .from('tasks')
            .select('estimated_hours')
            .eq('parent_task_id', parentId)
            .eq('organization_id', organizationId)

          if (!childrenError) {
            const total = (children || []).reduce(
              (sum: number, row: any) => sum + (Number(row.estimated_hours) || 0),
              0
            )
            await db
              .from('tasks')
              .update({ estimated_hours: total })
              .eq('id', parentId)
              .eq('organization_id', organizationId)
          }
        } else {
          // Parent changed -> if it has subtasks, force it to sum(subtasks)
          const { data: children, error: childrenError } = await db
            .from('tasks')
            .select('estimated_hours')
            .eq('parent_task_id', taskId)
            .eq('organization_id', organizationId)

          if (!childrenError && (children || []).length > 0) {
            const total = (children || []).reduce(
              (sum: number, row: any) => sum + (Number(row.estimated_hours) || 0),
              0
            )
            await db
              .from('tasks')
              .update({ estimated_hours: total })
              .eq('id', taskId)
              .eq('organization_id', organizationId)
          }
        }
      }

      // If this is a parent task date update, cascade timeframe changes to subtasks
      const isParentTask = !data.parent_task_id
      const isDateUpdate = updates.startDate !== undefined || updates.dueDate !== undefined
      if (isParentTask && isDateUpdate) {
        const childrenPayload: any = {}
        if (updates.startDate !== undefined)
          childrenPayload.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null
        if (updates.dueDate !== undefined)
          childrenPayload.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null

        if (Object.keys(childrenPayload).length > 0) {
          await db
            .from('tasks')
            .update(childrenPayload)
            .eq('parent_task_id', taskId)
            .eq('organization_id', organizationId)
        }
      }

      return {
        id: data.id,
        organizationId: data.organization_id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        assignedTo: data.assigned_to || [],
        assignedToNames: data.assigned_to_names || [],
        createdBy: data.created_by,
        createdByName: data.created_by_name,
        projectId: data.project_id,
        projectTitle: data.project_title,
        parentTaskId: data.parent_task_id,
        dependencies: data.dependencies || [],
        isRecurring: data.is_recurring || false,
        recurrencePattern: data.recurrence_pattern || 'none',
        recurrenceEndDate: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
        tags: data.tags || [],
        comments: [],
        attachments: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedHours: data.estimated_hours || 0,
        actualHours: data.actual_hours || 0,
      }
    } catch (error) {
      console.error('Error updating task in Supabase (falling back to localStorage):', error)
    }
  }

  const tasks = await getTasks(organizationId)
  const taskIndex = tasks.findIndex(task => task.id === taskId)
  
  if (taskIndex === -1) {
    return null
  }

  let updatedTask: Task = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  }

  const updatedTasks = [...tasks]
  updatedTasks[taskIndex] = updatedTask

  // If this is a parent task date update, cascade timeframe changes to subtasks
  const isParentTask = !updatedTask.parentTaskId
  const isDateUpdate = updates.startDate !== undefined || updates.dueDate !== undefined
  if (isParentTask && isDateUpdate) {
    for (let i = 0; i < updatedTasks.length; i++) {
      const t = updatedTasks[i]
      if (t.parentTaskId === taskId) {
        updatedTasks[i] = {
          ...t,
          startDate: updates.startDate !== undefined ? updates.startDate : t.startDate,
          dueDate: updates.dueDate !== undefined ? updates.dueDate : t.dueDate,
          updatedAt: new Date(),
        }
      }
    }
  }

  // Estimated hours rollups (local):
  const isEstimatedUpdate = updates.estimatedHours !== undefined
  if (isEstimatedUpdate) {
    if (updatedTask.parentTaskId) {
      // Subtask changed -> recompute parent
      const parentId = updatedTask.parentTaskId
      const total = updatedTasks
        .filter(t => t.parentTaskId === parentId)
        .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      const parentIndex = updatedTasks.findIndex(t => t.id === parentId)
      if (parentIndex !== -1) {
        updatedTasks[parentIndex] = {
          ...updatedTasks[parentIndex],
          estimatedHours: total,
          updatedAt: new Date(),
        }
      }
    } else {
      // Parent changed -> if it has subtasks, force it to sum(subtasks)
      const children = updatedTasks.filter(t => t.parentTaskId === taskId)
      if (children.length > 0) {
        const total = children.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          estimatedHours: total,
          updatedAt: new Date(),
        }
        updatedTask = updatedTasks[taskIndex]
      }
    }
  }

  await saveTasks(organizationId, updatedTasks)
  
  return updatedTask
}

/**
 * Delete a task
 */
export const deleteTask = async (organizationId: string, taskId: string): Promise<boolean> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  if (!DEV_MODE) {
    try {
      const { db } = await import('./platform')
      // Read first so we can recompute parent estimated hours if this is a subtask
      const { data: existing, error: existingError } = await db
        .from('tasks')
        .select('id,parent_task_id')
        .eq('id', taskId)
        .eq('organization_id', organizationId)
        .single()

      if (existingError) throw existingError

      const { error } = await db
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('organization_id', organizationId)

      if (error) throw error

      // If deleted task was a subtask, roll up parent estimated_hours
      if (existing?.parent_task_id) {
        const parentId = existing.parent_task_id as string
        const { data: children, error: childrenError } = await db
          .from('tasks')
          .select('estimated_hours')
          .eq('parent_task_id', parentId)
          .eq('organization_id', organizationId)

        if (!childrenError) {
          const total = (children || []).reduce(
            (sum: number, row: any) => sum + (Number(row.estimated_hours) || 0),
            0
          )
          await db
            .from('tasks')
            .update({ estimated_hours: total })
            .eq('id', parentId)
            .eq('organization_id', organizationId)
        }
      }

      return true
    } catch (error) {
      console.error('Error deleting task in Supabase (falling back to localStorage):', error)
    }
  }

  const tasks = await getTasks(organizationId)
  const deletedTask = tasks.find(t => t.id === taskId)
  const updatedTasks = tasks.filter(task => task.id !== taskId)
  
  if (updatedTasks.length === tasks.length) {
    return false // Task not found
  }

  // If deleted task was a subtask, roll up parent estimatedHours
  if (deletedTask?.parentTaskId) {
    const parentId = deletedTask.parentTaskId
    const total = updatedTasks
      .filter(t => t.parentTaskId === parentId)
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    const parentIndex = updatedTasks.findIndex(t => t.id === parentId)
    if (parentIndex !== -1) {
      updatedTasks[parentIndex] = {
        ...updatedTasks[parentIndex],
        estimatedHours: total,
        updatedAt: new Date(),
      }
    }
  }
  
  await saveTasks(organizationId, updatedTasks)
  return true
}

/**
 * Get available users for task assignment
 */
export const getAvailableUsers = async (organizationId: string) => {
  return MOCK_USERS
}

/**
 * Get available projects for task assignment
 */
export const getAvailableProjects = async (organizationId: string) => {
  try {
    const projects = await getProjects(organizationId)
    return projects.map(project => ({
      id: project.id,
      title: project.title,
    }))
  } catch (error) {
    console.error('Error fetching projects for task assignment, falling back to mock projects:', error)
    return MOCK_PROJECTS
  }
}

/**
 * Get task statistics
 */
export const getTaskStats = async (organizationId: string) => {
  const tasks = await getTasks(organizationId)
  
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.dueDate && new Date() > t.dueDate && t.status !== 'completed'
    ).length,
  }
}

/**
 * Clear all tasks (for development/testing)
 */
export const clearAllTasks = async (organizationId: string): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(`tasks-${organizationId}`)
  } catch (error) {
    console.error('Error clearing tasks from localStorage:', error)
  }
}

/**
 * Reset to mock data (for development/testing)
 */
export const resetToMockData = async (organizationId: string): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(`tasks-${organizationId}`)
  } catch (error) {
    console.error('Error resetting to mock data:', error)
  }
}

/**
 * Create a subtask for a parent task
 */
export const createSubtask = async (
  organizationId: string, 
  parentTaskId: string, 
  subtaskData: Partial<Task>
): Promise<Task> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  if (!DEV_MODE) {
    try {
      const { db, auth } = await import('./platform')
      const { data: userResult } = await auth.getUser()
      const user = userResult?.user

      const { data: parentData, error: parentError } = await db
        .from('tasks')
        .select('*')
        .eq('id', parentTaskId)
        .eq('organization_id', organizationId)
        .single()

      if (parentError) throw parentError

      const inheritedStart = parentData.start_date ? new Date(parentData.start_date) : undefined
      const inheritedDue = parentData.due_date ? new Date(parentData.due_date) : undefined

      const insertPayload: any = {
        organization_id: organizationId,
        title: subtaskData.title || '',
        description: subtaskData.description || null,
        status: (subtaskData.status || 'todo') as TaskStatus,
        priority: (subtaskData.priority || parentData.priority || 'medium') as TaskPriority,
        // Subtasks inherit timeframe from parent task
        start_date: inheritedStart ? inheritedStart.toISOString() : null,
        due_date: inheritedDue ? inheritedDue.toISOString() : null,
        assigned_to: subtaskData.assignedTo || parentData.assigned_to || [],
        assigned_to_names: subtaskData.assignedToNames || parentData.assigned_to_names || [],
        created_by: subtaskData.createdBy || parentData.created_by || user?.id,
        created_by_name: subtaskData.createdByName || parentData.created_by_name || user?.email || 'Unknown',
        project_id: parentData.project_id || null,
        project_title: parentData.project_title || null,
        parent_task_id: parentTaskId,
        dependencies: subtaskData.dependencies || [],
        is_recurring: false,
        recurrence_pattern: 'none',
        recurrence_end_date: null,
        tags: subtaskData.tags || [],
        estimated_hours: subtaskData.estimatedHours || 0,
        actual_hours: subtaskData.actualHours || 0,
        completed_at: subtaskData.completedAt ? new Date(subtaskData.completedAt).toISOString() : null,
      }

      const { data, error } = await db
        .from('tasks')
        .insert(insertPayload)
        .select('*')
        .single()

      if (error) throw error

      // Keep parent estimated_hours as sum(subtask estimated_hours)
      try {
        const { data: children, error: childrenError } = await db
          .from('tasks')
          .select('estimated_hours')
          .eq('parent_task_id', parentTaskId)
          .eq('organization_id', organizationId)

        if (!childrenError) {
          const total = (children || []).reduce(
            (sum: number, row: any) => sum + (Number(row.estimated_hours) || 0),
            0
          )
          await db
            .from('tasks')
            .update({ estimated_hours: total })
            .eq('id', parentTaskId)
            .eq('organization_id', organizationId)
        }
      } catch (e) {
        console.error('Error rolling up parent estimated hours after subtask create:', e)
      }

      return {
        id: data.id,
        organizationId: data.organization_id,
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        assignedTo: data.assigned_to || [],
        assignedToNames: data.assigned_to_names || [],
        createdBy: data.created_by,
        createdByName: data.created_by_name,
        projectId: data.project_id,
        projectTitle: data.project_title,
        parentTaskId: data.parent_task_id,
        dependencies: data.dependencies || [],
        isRecurring: data.is_recurring || false,
        recurrencePattern: data.recurrence_pattern || 'none',
        recurrenceEndDate: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
        tags: data.tags || [],
        comments: [],
        attachments: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        estimatedHours: data.estimated_hours || 0,
        actualHours: data.actual_hours || 0,
      }
    } catch (error) {
      console.error('Error creating subtask in Supabase (falling back to localStorage):', error)
    }
  }

  const tasks = await getTasks(organizationId)
  const parentTask = tasks.find(t => t.id === parentTaskId)

  if (!parentTask) {
    throw new Error('Parent task not found')
  }

  // Create subtask with parent task context
  const newSubtask: Task = {
    id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    title: subtaskData.title || '',
    description: subtaskData.description || '',
    status: subtaskData.status || 'todo',
    priority: subtaskData.priority || parentTask.priority,
    // Subtasks inherit timeframe from parent task unless explicitly provided
    startDate: subtaskData.startDate ?? parentTask.startDate,
    dueDate: subtaskData.dueDate ?? parentTask.dueDate,
    assignedTo: subtaskData.assignedTo || parentTask.assignedTo,
    assignedToNames: subtaskData.assignedToNames || parentTask.assignedToNames,
    createdBy: subtaskData.createdBy || parentTask.createdBy,
    createdByName: subtaskData.createdByName || parentTask.createdByName,
    projectId: parentTask.projectId,
    projectTitle: parentTask.projectTitle,
    parentTaskId,
    dependencies: subtaskData.dependencies || [],
    isRecurring: subtaskData.isRecurring || false,
    recurrencePattern: subtaskData.recurrencePattern || 'none',
    recurrenceEndDate: subtaskData.recurrenceEndDate,
    tags: [],
    comments: subtaskData.comments || [],
    attachments: subtaskData.attachments || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: subtaskData.completedAt,
    estimatedHours: subtaskData.estimatedHours || 0,
    actualHours: subtaskData.actualHours || 0,
  }

  const updatedTasks = [newSubtask, ...tasks]

  // Keep parent estimatedHours as sum(subtask estimatedHours)
  const total = updatedTasks
    .filter(t => t.parentTaskId === parentTaskId)
    .reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
  const parentIndex = updatedTasks.findIndex(t => t.id === parentTaskId)
  if (parentIndex !== -1) {
    updatedTasks[parentIndex] = {
      ...updatedTasks[parentIndex],
      estimatedHours: total,
      updatedAt: new Date(),
    }
  }

  await saveTasks(organizationId, updatedTasks)
  
  return newSubtask
}

/**
 * Get subtasks for a parent task
 */
export const getSubtasks = async (organizationId: string, parentTaskId: string): Promise<Task[]> => {
  const tasks = await getTasks(organizationId)
  return tasks.filter(task => task.parentTaskId === parentTaskId)
}

/**
 * Get tasks with their subtasks organized hierarchically
 */
export const getTasksWithSubtasks = async (organizationId: string): Promise<Task[]> => {
  const tasks = await getTasks(organizationId)
  
  // Separate parent tasks and subtasks
  const parentTasks = tasks.filter(task => !task.parentTaskId)
  const subtasks = tasks.filter(task => task.parentTaskId)
  
  // Group subtasks by parent task ID
  const subtasksByParent = subtasks.reduce((acc, subtask) => {
    if (!subtask.parentTaskId) return acc
    if (!acc[subtask.parentTaskId]) {
      acc[subtask.parentTaskId] = []
    }
    acc[subtask.parentTaskId].push(subtask)
    return acc
  }, {} as Record<string, Task[]>)
  
  // Attach subtasks to their parent tasks
  return parentTasks.map(parentTask => ({
    ...parentTask,
    subtasks: subtasksByParent[parentTask.id] || []
  }))
}

/**
 * Delete a task and all its subtasks
 */
export const deleteTaskWithSubtasks = async (organizationId: string, taskId: string): Promise<boolean> => {
  const tasks = await getTasks(organizationId)
  
  // Find all subtasks of this task
  const subtaskIds = tasks
    .filter(task => task.parentTaskId === taskId)
    .map(task => task.id)
  
  // Remove the main task and all its subtasks
  const updatedTasks = tasks.filter(task => 
    task.id !== taskId && !subtaskIds.includes(task.id)
  )
  
  if (updatedTasks.length === tasks.length) {
    return false // Task not found
  }
  
  await saveTasks(organizationId, updatedTasks)
  return true
}

/**
 * Update parent task status based on subtask completion
 */
export const updateParentTaskStatus = async (organizationId: string, parentTaskId: string): Promise<void> => {
  const tasks = await getTasks(organizationId)
  const parentTask = tasks.find(t => t.id === parentTaskId)
  const subtasks = tasks.filter(t => t.parentTaskId === parentTaskId)
  
  if (!parentTask || subtasks.length === 0) return
  
  const completedSubtasks = subtasks.filter(t => t.status === 'completed')
  const totalSubtasks = subtasks.length
  
  // Auto-update parent task status based on subtask completion
  let newStatus = parentTask.status
  
  if (completedSubtasks.length === totalSubtasks) {
    // Move to Review when all subtasks are complete, but don't move backward from completed
    if (parentTask.status !== 'completed') {
      newStatus = 'review'
    }
  } else if (completedSubtasks.length > 0) {
    // If some subtasks are done, move to in-progress (but not if already completed)
    if (parentTask.status !== 'completed') {
      newStatus = 'in-progress'
    }
  }
  
  if (newStatus !== parentTask.status) {
    await updateTask(organizationId, parentTaskId, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined
    })
  }
}