/**
 * Task Management Utilities
 * Local storage implementation for development mode
 */

import type { Task, TaskStatus, TaskPriority, TaskRecurrence } from '@/types'

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
    tags: ['frontend', 'authentication', 'security'],
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
    tags: ['database', 'backend', 'architecture'],
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
    tags: ['testing', 'quality', 'automation'],
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
    tags: ['review', 'documentation', 'quality'],
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
export const getTasks = async (organizationId: string): Promise<Task[]> => {
  // Check if auth is disabled (dev mode)
  const DEV_MODE = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  
  if (DEV_MODE) {
    // Use localStorage in dev mode
    if (typeof window === 'undefined') {
      return MOCK_TASKS.filter(task => task.organizationId === organizationId)
    }

    try {
      const storedTasks = localStorage.getItem(`tasks-${organizationId}`)
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks)
        return tasks.map((task: any) => ({
          ...task,
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
    throw new Error('Failed to fetch tasks')
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
  const tasks = await getTasks(organizationId)
  
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    title: taskData.title || '',
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
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
    tags: taskData.tags || [],
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
  const tasks = await getTasks(organizationId)
  const taskIndex = tasks.findIndex(task => task.id === taskId)
  
  if (taskIndex === -1) {
    return null
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  }

  const updatedTasks = [...tasks]
  updatedTasks[taskIndex] = updatedTask
  
  await saveTasks(organizationId, updatedTasks)
  
  return updatedTask
}

/**
 * Delete a task
 */
export const deleteTask = async (organizationId: string, taskId: string): Promise<boolean> => {
  const tasks = await getTasks(organizationId)
  const updatedTasks = tasks.filter(task => task.id !== taskId)
  
  if (updatedTasks.length === tasks.length) {
    return false // Task not found
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
  return MOCK_PROJECTS
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
    dueDate: subtaskData.dueDate,
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
    tags: subtaskData.tags || parentTask.tags,
    comments: subtaskData.comments || [],
    attachments: subtaskData.attachments || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: subtaskData.completedAt,
    estimatedHours: subtaskData.estimatedHours || 0,
    actualHours: subtaskData.actualHours || 0,
  }

  const updatedTasks = [newSubtask, ...tasks]
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
    newStatus = 'completed'
  } else if (completedSubtasks.length > 0) {
    newStatus = 'in-progress'
  }
  
  if (newStatus !== parentTask.status) {
    await updateTask(organizationId, parentTaskId, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined
    })
  }
}