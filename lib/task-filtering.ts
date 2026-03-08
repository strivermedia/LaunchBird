import type { Task, TaskFilter, TaskStatus } from '@/types'

const toSafeLower = (value: unknown) => String(value ?? '').toLowerCase()

const tokenize = (query: string) =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

const matchesAllTokens = (haystack: string, tokens: string[]) => {
  if (tokens.length === 0) return true
  const h = haystack.toLowerCase()
  return tokens.every(t => h.includes(t))
}

const taskSearchHaystack = (task: Task) => {
  const parts: string[] = []
  parts.push(task.title || '')
  parts.push(task.description || '')
  parts.push(task.projectTitle || '')
  parts.push(...(task.assignedToNames || []))
  parts.push(...(task.assignedTo || []))
  parts.push(task.createdByName || '')
  parts.push(task.createdBy || '')
  return parts.filter(Boolean).join(' ')
}

const asDate = (value: unknown): Date | undefined => {
  if (!value) return undefined
  if (value instanceof Date) return value
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? undefined : d
}

const isOverdueTask = (task: Task, now: Date) => {
  const due = asDate(task.dueDate)
  if (!due) return false
  return due.getTime() < now.getTime() && task.status !== 'completed'
}

type MatchOptions = {
  /** Status filtering should be applied to parent tasks (Kanban columns) */
  parentStatusOnly?: boolean
}

const matchesFilter = (task: Task, filter: TaskFilter, now: Date, options: MatchOptions) => {
  // Status
  if (filter.status && filter.status.length > 0) {
    const allowed = filter.status as TaskStatus[]
    if (!allowed.includes(task.status)) return false
  }

  // Priority
  if (filter.priority && filter.priority.length > 0) {
    if (!filter.priority.includes(task.priority)) return false
  }

  // Assigned to (ids)
  if (filter.assignedTo && filter.assignedTo.length > 0) {
    const assigned = task.assignedTo || []
    const hasIntersection = assigned.some(id => filter.assignedTo!.includes(id))
    if (!hasIntersection) return false
  }

  // Project
  if (filter.projectId) {
    if (task.projectId !== filter.projectId) return false
  }

  // Created by
  if (filter.createdBy) {
    if (task.createdBy !== filter.createdBy) return false
  }

  // Due date range (From/To)
  if (filter.dueDateFrom || filter.dueDateTo) {
    const due = asDate(task.dueDate)
    if (!due) return false
    if (filter.dueDateFrom) {
      const from = asDate(filter.dueDateFrom)
      if (from && due.getTime() < from.getTime()) return false
    }
    if (filter.dueDateTo) {
      const to = asDate(filter.dueDateTo)
      if (to && due.getTime() > to.getTime()) return false
    }
  }

  // Overdue
  if (filter.isOverdue) {
    if (!isOverdueTask(task, now)) return false
  }

  // Task type
  if (filter.taskType) {
    if (task.taskType !== filter.taskType) return false
  }

  // (Other date filters exist in TaskFilter type but aren’t used by the UI yet.)
  return true
}

/**
 * Filters parent tasks, but searches and filters subtasks too:
 * - A parent task is included if it matches filters/search itself OR any subtask matches.
 * - Subtasks are narrowed down to only those that match (useful for search results).
 */
export function filterTasksWithSubtasks(
  tasks: Task[],
  filter: TaskFilter,
  searchQuery: string,
  options: MatchOptions = { parentStatusOnly: true }
): Task[] {
  const tokens = tokenize(searchQuery)
  const now = new Date()

  const result: Task[] = []

  for (const parent of tasks || []) {
    const parentMatchesFilter = matchesFilter(parent, filter, now, options)
    const parentMatchesSearch = matchesAllTokens(taskSearchHaystack(parent), tokens)

    const subtasks = Array.isArray(parent.subtasks) ? parent.subtasks : []

    // For Kanban UX: status filter applies to parents (columns).
    // Subtasks still participate in search/other filters, but cannot “pull in” a parent
    // that is outside the selected status.
    const allowSubtasksToIncludeParent =
      !(options.parentStatusOnly && filter.status && filter.status.length > 0) || parentMatchesFilter

    const matchingSubtasks = subtasks.filter((st) => {
      // Subtasks should *not* be required to match parent-only status filtering logic.
      const stFilter = allowSubtasksToIncludeParent
        ? matchesFilter(st, { ...filter, status: undefined }, now, options)
        : false
      const stSearch = matchesAllTokens(taskSearchHaystack(st), tokens)
      return stFilter && stSearch
    })

    const includeParent =
      (parentMatchesFilter && parentMatchesSearch) ||
      (allowSubtasksToIncludeParent && matchingSubtasks.length > 0)

    if (!includeParent) continue

    // If there’s an active search, show only matching subtasks to reduce noise.
    // Otherwise keep all subtasks (normal browsing).
    const nextSubtasks = tokens.length > 0 ? matchingSubtasks : subtasks

    result.push({
      ...parent,
      subtasks: nextSubtasks,
    })
  }

  return result
}






