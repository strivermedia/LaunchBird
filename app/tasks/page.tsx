'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/auth'
import { createTask, updateTask, deleteTask, createSubtask, getTasksWithSubtasks, updateParentTaskStatus, getAvailableUsers, getAvailableProjects } from '@/lib/tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckSquare, 
  List, 
  Plus,
  Search,
  Plus as PlusIcon,
  ChevronDown,
  Calendar,
  User,
  Clock,
  Edit,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pencil,
  X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import KanbanBoard from '@/components/Task/KanbanBoard'
import TaskList from '@/components/Task/TaskList'
import TaskForm from '@/components/Task/TaskForm'
import SubtaskDrawer, { type SubtaskDrawerFormData } from '@/components/Task/SubtaskDrawer'
import TaskDrawer, { type TaskDrawerFormData } from '@/components/Task/TaskDrawer'
import CalendarView from '@/components/Calendar/CalendarView'
import GanttChart from '@/components/Calendar/GanttChart'
import CalendarFilters from '@/components/Calendar/CalendarFilters'
import TaskFilters from '@/components/Task/TaskFilters'
import { filterTasksWithSubtasks } from '@/lib/task-filtering'
import { getCalendarEvents, updateTaskDates, updateProjectDates, transformTaskToEvent } from '@/lib/calendar'
import { getProjects } from '@/lib/projects'
import { getTimeEntries } from '@/lib/time-tracking'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, GanttChartSquare, CalendarDays, Filter } from 'lucide-react'
import type { Task, TaskFilter, TaskStatus, Project } from '@/types'
import type { UserProfile } from '@/lib/auth'
import type { CalendarEvent, CalendarFilters as CalendarFiltersType, CalendarView as CalendarViewType, GanttZoom } from '@/types/calendar'
import type { GanttTask } from '@/types/calendar'

/**
 * Task Manager Page Component
 * Provides Kanban board and list views for task management
 */
export default function TasksPage() {
  // Component loaded
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban')
  // Calendar and Gantt state
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month')
  const [ganttZoom, setGanttZoom] = useState<GanttZoom>('week')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([])
  const [calendarFilters, setCalendarFilters] = useState<CalendarFiltersType>({})
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCreateSubtask, setShowCreateSubtask] = useState(false)
  const [parentTask, setParentTask] = useState<Task | null>(null)
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; title: string }>>([])
  // Unified Task Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTask, setDrawerTask] = useState<Task | null>(null)
  const [drawerInitialStatus, setDrawerInitialStatus] = useState<TaskStatus | undefined>(undefined)
  const [drawerInitialDates, setDrawerInitialDates] = useState<{ start?: Date; end?: Date } | undefined>()

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<TaskFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [availableTeamMembers, setAvailableTeamMembers] = useState<Array<{ id: string; name: string }>>([])

  const searchParams = useSearchParams()

  // Check for view parameter from URL (e.g., /tasks?view=calendar)
  useEffect(() => {
    const viewParam = searchParams?.get('view')
    if (viewParam && ['kanban', 'list', 'calendar', 'gantt'].includes(viewParam)) {
      setViewMode(viewParam as 'kanban' | 'list' | 'calendar' | 'gantt')
    }
  }, [searchParams])

  // Memoized function to refresh tasks data
  const refreshTasks = useCallback(async () => {
    const orgId = userProfile?.organizationId || 'dev-org-123'
    
    try {
      const tasksData = await getTasksWithSubtasks(orgId)
      setTasks(tasksData)
      
      // Also refresh calendar and gantt data if those views are active
      if (viewMode === 'calendar' || viewMode === 'gantt') {
        await loadCalendarAndGanttData(orgId)
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error)
    }
  }, [userProfile?.organizationId, viewMode])

  // Load calendar events and gantt tasks
  const loadCalendarAndGanttData = useCallback(async (orgId: string, sourceTasks?: Task[]) => {
    try {
      // Load tasks (use provided list if available, otherwise fetch)
      const tasksToUse = sourceTasks && sourceTasks.length > 0
        ? sourceTasks
        : await getTasksWithSubtasks(orgId)
      // Parents already include their subtasks; keep both shapes for different uses.
      const parentTasks = tasksToUse
      const allTasks = tasksToUse.flatMap(task => [task, ...(task.subtasks || [])])

      // Prepare fallback events derived from current tasks
      const fallbackEvents = allTasks
        .map(task => transformTaskToEvent(task))
        .filter((event): event is NonNullable<ReturnType<typeof transformTaskToEvent>> => Boolean(event))

      // Load calendar events
      try {
        let events = await getCalendarEvents(orgId, calendarFilters)
        if (!events || events.length === 0) {
          events = fallbackEvents
        }
        setCalendarEvents(events)
      } catch (error) {
        console.error('Error loading calendar events, falling back to local data:', error)
        setCalendarEvents(fallbackEvents)
      }

      // Load projects for Gantt chart context
      let projects: Project[] = []
      try {
        projects = await getProjects(orgId)
      } catch (projectError) {
        console.error('Error loading projects for Gantt:', projectError)
        projects = []
      }

      const formatGanttDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      }

      const progressFromStatus = (status: string | undefined): number => {
        switch (status) {
          case 'completed':
            return 100
          case 'review':
            return 75
          case 'in-progress':
            return 50
          case 'todo':
          default:
            return 0
        }
      }

      const normalizeRange = (start: Date, end: Date, minDays: number) => {
        const safeStart = start instanceof Date ? start : new Date(start)
        const safeEnd = end instanceof Date ? end : new Date(end)
        if (Number.isNaN(safeStart.getTime())) {
          const now = new Date()
          return { start: now, end: new Date(now.getTime() + minDays * 24 * 60 * 60 * 1000) }
        }
        if (Number.isNaN(safeEnd.getTime()) || safeEnd.getTime() < safeStart.getTime()) {
          return { start: safeStart, end: new Date(safeStart.getTime() + minDays * 24 * 60 * 60 * 1000) }
        }
        // Ensure a minimum visible bar length for non-milestones
        const minEnd = new Date(safeStart.getTime() + minDays * 24 * 60 * 60 * 1000)
        return { start: safeStart, end: safeEnd.getTime() < minEnd.getTime() ? minEnd : safeEnd }
      }

      // Transform to Gantt tasks
      const ganttTasksData: GanttTask[] = []

      // Build a clean project hierarchy:
      // - Only render project rows that actually have tasks
      // - Tasks without a project appear at the root (no synthetic "Unassigned" bucket)
      const projectById = new Map(projects.map((p) => [p.id, p]))
      const usedProjectIds = new Set<string>()
      for (const t of parentTasks || []) {
        if (t.projectId) usedProjectIds.add(t.projectId)
        for (const st of Array.isArray(t.subtasks) ? t.subtasks : []) {
          if (st.projectId) usedProjectIds.add(st.projectId)
        }
      }

      const taskBaseRange = (t: any) => {
        const start = t.startDate || t.dueDate || t.createdAt || new Date()
        const end =
          t.dueDate ||
          (t.startDate ? new Date(t.startDate.getTime() + 24 * 60 * 60 * 1000) : new Date(start.getTime() + 24 * 60 * 60 * 1000))
        return normalizeRange(start, end, 1)
      }

      for (const projectId of Array.from(usedProjectIds)) {
        const project = projectById.get(projectId)

        // If we don't have a project record (rare), still show a parent row if tasks reference it.
        const label =
          project?.title ||
          (allTasks.find(t => t.projectId === projectId)?.projectTitle ?? `Project ${projectId}`)

        // Compute a sensible range:
        // - Prefer project dates when present
        // - Otherwise derive from the min/max of task ranges in that project
        let start = project?.startDate
        let end = project?.endDate || project?.deadline
        if (!start || !end) {
          const ranges: Array<{ start: Date; end: Date }> = []
          for (const t of parentTasks || []) {
            if (t.projectId === projectId) ranges.push(taskBaseRange(t))
            for (const st of Array.isArray(t.subtasks) ? t.subtasks : []) {
              if (st.projectId === projectId) ranges.push(taskBaseRange(st))
            }
          }
          if (ranges.length) {
            const minStart = new Date(Math.min(...ranges.map(r => r.start.getTime())))
            const maxEnd = new Date(Math.max(...ranges.map(r => r.end.getTime())))
            start = start || minStart
            end = end || maxEnd
          }
        }
        const safeStart = start || new Date()
        const safeEnd = end || new Date(safeStart.getTime() + 30 * 24 * 60 * 60 * 1000)
        const range = normalizeRange(safeStart, safeEnd, 1)

        ganttTasksData.push({
          id: `project-${projectId}`,
          text: label,
          start_date: formatGanttDate(range.start),
          end_date: formatGanttDate(range.end),
          type: 'project',
          status: project?.status || 'planning',
          progress: typeof project?.progress === 'number' ? project.progress : undefined,
          open: true,
          projectId,
          extendedProps: {
            projectId,
            navigateTo: project ? `/projects/${projectId}` : undefined,
            description: project?.description
          }
        })
      }

      // Add parent tasks + subtasks (hierarchy)
      // Add parent tasks + subtasks (hierarchy)
      for (const task of parentTasks) {
        const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []

        const taskStartBase = task.startDate || task.dueDate || task.createdAt || new Date()
        const taskEndBase =
          task.dueDate ||
          (task.startDate
            ? new Date(task.startDate.getTime() + 24 * 60 * 60 * 1000)
            : new Date(taskStartBase.getTime() + 24 * 60 * 60 * 1000))

        // If subtasks exist, use their min/max dates to make the parent bar meaningful
        const subStarts: Date[] = []
        const subEnds: Date[] = []
        for (const st of subtasks) {
          const stStart = st.startDate || st.dueDate || st.createdAt || taskStartBase
          const stEnd =
            st.dueDate ||
            (st.startDate
              ? new Date(st.startDate.getTime() + 24 * 60 * 60 * 1000)
              : new Date(stStart.getTime() + 24 * 60 * 60 * 1000))
          subStarts.push(stStart)
          subEnds.push(stEnd)
        }

        const minStart = subStarts.length ? new Date(Math.min(taskStartBase.getTime(), ...subStarts.map(d => d.getTime()))) : taskStartBase
        const maxEnd = subEnds.length ? new Date(Math.max(taskEndBase.getTime(), ...subEnds.map(d => d.getTime()))) : taskEndBase
        const taskRange = normalizeRange(minStart, maxEnd, 1)

        // Dependencies are stored as task IDs in our Task model; keep IDs stable in the Gantt.
        const ganttDependencies = (task.dependencies || []).map(String)

        const parentRowId = task.projectId ? `project-${task.projectId}` : undefined

        // Parent row for task (use "project" type when it has children so Gantt renders a rollup bar)
        const parentTaskId = String(task.id)
        const completedChildren = subtasks.filter(st => st.status === 'completed').length
        const childProgress = subtasks.length ? Math.round((completedChildren / subtasks.length) * 100) : undefined
        const parentProgress = subtasks.length ? childProgress : progressFromStatus(task.status)

        ganttTasksData.push({
          id: parentTaskId,
          text: task.title || 'Untitled task',
          start_date: formatGanttDate(taskRange.start),
          end_date: formatGanttDate(taskRange.end),
          type: subtasks.length ? 'project' : 'task',
          priority: task.priority,
          status: task.status,
          progress: parentProgress,
          assignees: task.assignedTo,
          projectId: task.projectId,
          parent: parentRowId,
          open: true,
          dependencies: ganttDependencies,
          extendedProps: {
            taskId: task.id,
            projectId: task.projectId,
            navigateTo: `/tasks?taskId=${task.id}`,
            description: task.description,
          }
        })

        // Child rows for subtasks
        for (const st of subtasks) {
          const stStartBase = st.startDate || st.dueDate || st.createdAt || taskRange.start
          const stEndBase =
            st.dueDate ||
            (st.startDate
              ? new Date(st.startDate.getTime() + 24 * 60 * 60 * 1000)
              : new Date(stStartBase.getTime() + 24 * 60 * 60 * 1000))
          const stRange = normalizeRange(stStartBase, stEndBase, 1)
          const stDeps = (st.dependencies || []).map(String)

          ganttTasksData.push({
            id: String(st.id),
            text: st.title || 'Untitled subtask',
            start_date: formatGanttDate(stRange.start),
            end_date: formatGanttDate(stRange.end),
            type: 'task',
            priority: st.priority,
            status: st.status,
            progress: progressFromStatus(st.status),
            assignees: st.assignedTo,
            projectId: st.projectId || task.projectId,
            parent: parentTaskId,
            open: true,
            dependencies: stDeps,
            extendedProps: {
              taskId: st.id,
              projectId: st.projectId || task.projectId,
              navigateTo: `/tasks?taskId=${st.id}`,
              description: st.description,
            }
          })
        }
      }

      setGanttTasks(ganttTasksData)
    } catch (error) {
      console.error('Error loading calendar/gantt data:', error)
    }
  }, [calendarFilters])

  const getOrganizationId = () => userProfile?.organizationId || 'dev-org-123'

  const resetPointerEventsSafely = () => {
    if (typeof document === 'undefined') return
    const body = document.body
    if (body.style.pointerEvents === 'none') {
      body.style.pointerEvents = 'auto'
      body.style.removeProperty('pointer-events')
    }
    const fixPointerEvents = () => {
      if (body.style.pointerEvents === 'none') {
        body.style.pointerEvents = 'auto'
        body.style.removeProperty('pointer-events')
      }
    }
    fixPointerEvents()
    const interval = setInterval(fixPointerEvents, 100)
    setTimeout(() => clearInterval(interval), 5000)
  }

  // Load user profile and tasks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Get user profile
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
        const orgId = profile?.organizationId || 'dev-org-123'
        
        // Load tasks with subtasks from localStorage/Supabase
        const tasksData = await getTasksWithSubtasks(orgId)
        setTasks(tasksData)
        
        // Load available users and projects
        const users = await getAvailableUsers(orgId)
        const projects = await getAvailableProjects(orgId)
        
        setAvailableUsers(users)
        setAvailableProjects(projects)
        setAvailableTeamMembers(users.map(u => ({ id: u.id, name: u.name })))
        
        // Load calendar and gantt data if those views are active
        if (viewMode === 'calendar' || viewMode === 'gantt') {
          await loadCalendarAndGanttData(orgId, tasksData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Keep calendar and Gantt data in sync with tasks/filters/view changes
  useEffect(() => {
    const orgId = getOrganizationId()
    if (!orgId) return

    if (viewMode === 'calendar' || viewMode === 'gantt') {
      loadCalendarAndGanttData(orgId, tasks)
    } else if (calendarFilters && Object.keys(calendarFilters).length === 0 && tasks.length) {
      // Even when not viewing calendar/gantt, ensure data is prepared once tasks exist
      loadCalendarAndGanttData(orgId, tasks)
    }
  }, [viewMode, calendarFilters, tasks, loadCalendarAndGanttData])

  // When coming from Calendar or elsewhere with ?taskId=..., open that task in the drawer
  const taskIdFromQuery = searchParams?.get('taskId')

  useEffect(() => {
    if (!taskIdFromQuery || !tasks || tasks.length === 0) return

    // Look for task or subtask with this id
    let target: Task | undefined = tasks.find(t => t.id === taskIdFromQuery)
    if (!target) {
      for (const task of tasks) {
        const sub = task.subtasks?.find(st => st.id === taskIdFromQuery)
        if (sub) {
          target = sub as Task
          break
        }
      }
    }

    if (target) {
      openExistingTaskInDrawer(target)
    }
  }, [taskIdFromQuery, tasks])

  // Open drawer helpers
  const openNewTaskDrawer = (status?: TaskStatus) => {
    setDrawerTask(null)
    setDrawerInitialStatus(status)
    setDrawerInitialDates(undefined)
    setIsDrawerOpen(true)
  }

  const openExistingTaskInDrawer = (task: Task) => {
    setDrawerTask(task)
    setDrawerInitialStatus(undefined)
    setDrawerInitialDates({ start: task.startDate, end: task.dueDate })
    setIsDrawerOpen(true)
  }

  // Handle task form submission
  const handleTaskSubmit = async (formData: any) => {
    try {
      if (editingTask) {
        await updateTask(
          userProfile?.organizationId || 'dev-org-123',
          editingTask.id,
          formData
        )
      } else {
        await createTask(
          userProfile?.organizationId || 'dev-org-123',
          formData
        )
      }
      
      // Refresh tasks data and reset component state
      const orgId = userProfile?.organizationId || 'dev-org-123'
      const tasksData = await getTasksWithSubtasks(orgId)
      setTasks(tasksData)
      
      // Reset form states
      setShowCreateTask(false)
      setEditingTask(null)
      setShowCreateSubtask(false)
      setParentTask(null)
      resetPointerEventsSafely()
      
    } catch (error) {
      console.error('Error in task operation:', error)
      throw error
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(
        getOrganizationId(),
        taskId,
        updates
      )
      
      if (updatedTask) {
        // If this is a subtask update, update parent task status
        const parentTask = tasks.find(t => t.subtasks?.some(st => st.id === taskId))
        if (parentTask) {
          await updateParentTaskStatus(
            getOrganizationId(),
            parentTask.id
          )
        }
        
        await refreshTasks()
        resetPointerEventsSafely()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const success = await deleteTask(
        getOrganizationId(),
        taskId
      )
      
      if (success) {
        await refreshTasks()
        resetPointerEventsSafely()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSubtaskSubmit = async (formData: any) => {
    try {
      const orgId = getOrganizationId()

      const effectiveParentTask =
        parentTask ||
        (editingSubtask?.parentTaskId
          ? tasks.find(t => t.id === editingSubtask.parentTaskId) || null
          : null)

      // Map assignedTo ids to names for display on cards/rows
      const assignedToNames = (
        formData.assignedTo
          ?.map((id: string) => availableUsers.find(u => u.id === id)?.name)
          .filter((name: string | undefined): name is string => Boolean(name)) || []
      )

      const payload: Partial<Task> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        // Subtasks inherit timeframe from parent task
        startDate: effectiveParentTask?.startDate,
        dueDate: effectiveParentTask?.dueDate,
        assignedTo: formData.assignedTo,
        assignedToNames,
        estimatedHours: formData.estimatedHours,
      }

      if (editingSubtask) {
        await updateTask(orgId, editingSubtask.id, payload)
      } else if (parentTask) {
        await createSubtask(orgId, parentTask.id, payload)
      } else {
        return
      }

      await refreshTasks()

      // Reset form state
      setShowCreateSubtask(false)
      setParentTask(null)
      setEditingSubtask(null)
      resetPointerEventsSafely()
    } catch (error) {
      console.error('Error creating subtask:', error)
      throw error
    }
  }

  // Simple toggle functions
  const handleToggleSubtasks = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleTaskReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks)
  }

  // Unified Task Drawer submit handler
  const handleTaskDrawerSubmit = async (data: TaskDrawerFormData) => {
    try {
      const orgId = getOrganizationId()

      // Map assignedTo ids to names for display on cards/rows
      const assignedToNames = (
        data.assignedTo
          ?.map(id => availableUsers.find(u => u.id === id)?.name)
          .filter((name): name is string => Boolean(name)) || []
      )

      const projectTitle = data.projectId
        ? availableProjects.find(p => p.id === data.projectId)?.title
        : undefined

      const payload: Partial<Task> = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
        assignedToNames,
        projectId: data.projectId,
        projectTitle,
        dependencies: data.dependencies || [],
        // tags removed (intentionally)
        estimatedHours: data.estimatedHours,
      }

      if (drawerTask) {
        await updateTask(orgId, drawerTask.id, {
          ...payload,
          completedAt:
            data.status === 'completed'
              ? drawerTask.completedAt || new Date()
              : undefined,
        })
      } else {
        await createTask(orgId, payload)
      }

      await refreshTasks()
      setIsDrawerOpen(false)
      setDrawerTask(null)
      setDrawerInitialStatus(undefined)
      setDrawerInitialDates(undefined)
      resetPointerEventsSafely()
    } catch (error) {
      console.error('Error in task drawer submit:', error)
      throw error
    }
  }

  // Filter/search tasks (includes subtasks)
  const filteredTasks = useMemo(() => {
    return filterTasksWithSubtasks(tasks, filter, searchQuery, { parentStatusOnly: true })
  }, [tasks, filter, searchQuery])

  // Clear all filters
  const clearFilters = () => {
    setFilter({})
    setSearchQuery('')
  }

  // Active chips (kanban/list task filtering)
  const taskFilterChips = useMemo(() => {
    const chips: Array<{
      key: string
      label: string
      onRemove: () => void
    }> = []

    if (searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }

    for (const status of filter.status || []) {
      chips.push({
        key: `status:${status}`,
        label: `Status: ${status.replace('-', ' ')}`,
        onRemove: () =>
          setFilter(prev => ({
            ...prev,
            status: (prev.status || []).filter(s => s !== status),
          })),
      })
    }

    for (const priority of filter.priority || []) {
      chips.push({
        key: `priority:${priority}`,
        label: `Priority: ${priority}`,
        onRemove: () =>
          setFilter(prev => ({
            ...prev,
            priority: (prev.priority || []).filter(p => p !== priority),
          })),
      })
    }

    for (const id of filter.assignedTo || []) {
      const name = availableUsers.find(u => u.id === id)?.name || id
      chips.push({
        key: `assignee:${id}`,
        label: `Assignee: ${name}`,
        onRemove: () =>
          setFilter(prev => ({
            ...prev,
            assignedTo: (prev.assignedTo || []).filter(a => a !== id),
          })),
      })
    }

    if (filter.projectId) {
      const title = availableProjects.find(p => p.id === filter.projectId)?.title || filter.projectId
      chips.push({
        key: `project:${filter.projectId}`,
        label: `Project: ${title}`,
        onRemove: () => setFilter(prev => ({ ...prev, projectId: undefined })),
      })
    }

    if (filter.dueDateFrom || filter.dueDateTo) {
      const from = filter.dueDateFrom ? format(filter.dueDateFrom, 'MMM d') : '…'
      const to = filter.dueDateTo ? format(filter.dueDateTo, 'MMM d') : '…'
      chips.push({
        key: 'dueRange',
        label: `Due: ${from} – ${to}`,
        onRemove: () => setFilter(prev => ({ ...prev, dueDateFrom: undefined, dueDateTo: undefined })),
      })
    }

    if (filter.isOverdue) {
      chips.push({
        key: 'overdue',
        label: 'Overdue',
        onRemove: () => setFilter(prev => ({ ...prev, isOverdue: undefined })),
      })
    }

    return chips
  }, [searchQuery, filter, availableUsers, availableProjects])

  // Get active filter count (for both task filters and calendar filters)
  const getActiveFilterCount = () => {
    let count = 0
    if (searchQuery) count++
    if (filter.status?.length) count++
    if (filter.priority?.length) count++
    if (filter.assignedTo?.length) count++
    if (filter.projectId) count++
    if (filter.createdBy) count++
    if (filter.startDateFrom || filter.startDateTo) count++
    if (filter.dueDateFrom || filter.dueDateTo) count++
    if (filter.createdDateFrom || filter.createdDateTo) count++
    if (filter.modifiedDateFrom || filter.modifiedDateTo) count++
    if (filter.completedDateFrom || filter.completedDateTo) count++
    if (filter.taskType) count++
    if (filter.isOverdue) count++
    // Calendar filters
    if (calendarFilters.projects?.length) count++
    if (calendarFilters.teamMembers?.length) count++
    if (calendarFilters.taskTypes?.length) count++
    if (calendarFilters.status?.length) count++
    if (calendarFilters.dateRange) count++
    return count
  }

  // Calendar event handlers
  const handleCalendarEventClick = (event: CalendarEvent) => {
    if (event.type === 'task') {
      const taskId = event.extendedProps.taskId || event.id.replace(/^task-/, '')
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        openExistingTaskInDrawer(task)
        return
      }
    }
    // For other event types, navigate if there's a navigateTo
    if (event.extendedProps.navigateTo) {
      window.location.href = event.extendedProps.navigateTo
    }
  }

  const handleCalendarEventDrop = async (eventId: string, newStart: Date, newEnd?: Date) => {
    const orgId = getOrganizationId()
    try {
      if (eventId.startsWith('task-')) {
        const taskId = eventId.replace('task-', '')
        await updateTaskDates(orgId, taskId, newStart, newEnd || newStart)
      } else if (eventId.startsWith('project-')) {
        let projectId = eventId.replace('project-', '')
        projectId = projectId.replace(/^(start-|deadline-|end-)/, '')
        await updateProjectDates(projectId, newStart, newEnd, newEnd)
      }
      await refreshTasks()
    } catch (error) {
      console.error('Error updating event dates:', error)
    }
  }

  const handleCalendarDateSelect = (start: Date, end: Date) => {
    setDrawerTask(null)
    setDrawerInitialDates({ start, end: end || start })
    const label = start && end && start.getTime() !== end.getTime()
      ? `New project for ${format(start, 'MMM d')}–${format(end, 'MMM d')}`
      : `New project for ${format(start, 'MMM d')}`
    setIsDrawerOpen(true)
  }

  // Gantt handlers
  const handleGanttTaskUpdate = async (taskId: string, startDate: Date, endDate?: Date) => {
    const orgId = getOrganizationId()
    try {
      // Projects (phases) are read-only in the custom Gantt, but keep this for safety.
      if (taskId.startsWith('project-')) {
        const projectId = taskId.replace('project-', '')
        await updateProjectDates(projectId, startDate, endDate, endDate)
      } else {
        // Task IDs are passed through without extra prefixes.
        await updateTaskDates(orgId, taskId, startDate, endDate || startDate)
      }
      await refreshTasks()
    } catch (error) {
      console.error('Error updating Gantt task:', error)
    }
  }

  const handleGanttDependencyCreate = async (fromTaskId: string, toTaskId: string) => {
    // Persist FS dependency: "to" depends on "from"
    const orgId = getOrganizationId()
    try {
      // Ignore phase rows
      if (fromTaskId.startsWith('project-') || toTaskId.startsWith('project-')) return

      const parent = tasks.find(t => t.id === toTaskId)
      const sub = tasks.flatMap(t => t.subtasks || []).find(st => st.id === toTaskId)
      const target = parent || sub
      if (!target) return

      const nextDeps = Array.from(new Set([...(target.dependencies || []), fromTaskId]))
      await updateTask(orgId, toTaskId, { dependencies: nextDeps })
      await refreshTasks()
    } catch (error) {
      console.error('Error creating dependency:', error)
    }
  }

  const handleGanttTaskClick = (taskId: string) => {
    if (taskId.startsWith('project-')) {
      const projectId = taskId.replace('project-', '')
      window.location.href = `/projects/${projectId}`
      return
    }

    // Task or subtask
    const parent = tasks.find(t => t.id === taskId)
    const sub = tasks.flatMap(t => t.subtasks || []).find(st => st.id === taskId)
    const task = parent || sub
    if (task) {
      openExistingTaskInDrawer(task)
    }
  }

  // Get FullCalendar view based on calendar view type
  const getFullCalendarView = () => {
    switch (calendarView) {
      case 'day':
        return 'timeGridDay'
      case 'week':
        return 'timeGridWeek'
      case 'month':
        return 'dayGridMonth'
      default:
        return 'dayGridMonth'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
          <p className="text-muted-foreground">
            Manage and track your team&apos;s tasks and projects
          </p>
        </div>
      </div>

      {/* View Toggle and Task Display */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list' | 'calendar' | 'gantt')}>
        <div className="flex items-center justify-between">
          <TabsList data-testid="view-toggle">
            <TabsTrigger value="kanban" className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Kanban</span>
              </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
              </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center space-x-2">
                <GanttChartSquare className="h-4 w-4" />
                <span>Gantt</span>
              </TabsTrigger>
            </TabsList>

          {/* Search */}
          <div className="relative w-[320px] md:w-[420px] lg:w-[520px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted border-border"
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary text-primary-foreground border-primary' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <span className="text-sm leading-none">●</span>
                  <span>{getActiveFilterCount()}</span>
                </span>
              )}
            </Button>
            
            <Button 
              data-testid="create-task-button"
              onClick={() => {
                setEditingTask(null)
                setShowCreateTask(false)
                openNewTaskDrawer()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
          </div>

        {/* Active filter chips (kanban/list) */}
        {(viewMode === 'kanban' || viewMode === 'list') && taskFilterChips.length > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {taskFilterChips.map(chip => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                >
                  <span className="truncate max-w-[240px]">{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/10"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        <TabsContent value="kanban" className="mt-6">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskEdit={(task) => {
                if (task?.parentTaskId) {
                  // Subtask edit: use SubtaskDrawer so fields match create-subtask
                  const parent = tasks?.find(t => t.id === task.parentTaskId) || null
                  setParentTask(parent)
                  setEditingSubtask(task)
                  setShowCreateSubtask(true)
                  return
                }

                setEditingTask(task)
                setShowCreateTask(false)
                openExistingTaskInDrawer(task)
              }}
              onCreateTask={(status) => {
                setEditingTask(null)
              setShowCreateTask(false)
              openNewTaskDrawer(status)
              }}
              onCreateSubtask={(task) => {
                setParentTask(task)
                setEditingSubtask(null)
                setShowCreateSubtask(true)
              }}
              userProfile={userProfile}
              availableProjects={availableProjects}
              availableUsers={availableUsers}
              showSubtasks={expandedTasks}
              onToggleSubtasks={handleToggleSubtasks}
            />
          </TabsContent>

        <TabsContent value="list" className="mt-6">
            <TaskList
              tasks={filteredTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskEdit={(task) => {
              if (task && task.id) {
                if (task?.parentTaskId) {
                  const parent = tasks?.find(t => t.id === task.parentTaskId) || null
                  setParentTask(parent)
                  setEditingSubtask(task)
                  setShowCreateSubtask(true)
                  return
                }

                setEditingTask(task)
                setShowCreateTask(false)
                openExistingTaskInDrawer(task)
              } else {
                setEditingTask(null)
                setShowCreateTask(false)
                openNewTaskDrawer()
              }
              }}
              onCreateSubtask={(task) => {
                setParentTask(task)
                setEditingSubtask(null)
                setShowCreateSubtask(true)
              }}
              onQuickCreateSubtask={async (parentTaskId, title) => {
                try {
                  await createSubtask(
                    getOrganizationId(),
                    parentTaskId,
                    { title }
                  )
                  await refreshTasks()
                } catch (error) {
                  console.error('Error creating inline subtask:', error)
                }
              }}
            onReorder={handleTaskReorder}
              userProfile={userProfile}
              showSubtasks={expandedTasks}
              onToggleSubtasks={handleToggleSubtasks}
            onCreateTask={() => {
              setEditingTask(null)
              setShowCreateTask(false)
              openNewTaskDrawer()
            }}
            />
          </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                {/* Calendar sub-view toggle */}
                <div className="mb-4">
                  <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as CalendarViewType)}>
                    <TabsList>
                      <TabsTrigger value="day">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Day
                      </TabsTrigger>
                      <TabsTrigger value="week">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Month
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CalendarView
                  key={calendarView}
                  events={calendarEvents}
                  onEventClick={handleCalendarEventClick}
                  onEventDrop={handleCalendarEventDrop}
                  onDateSelect={handleCalendarDateSelect}
                  initialView={getFullCalendarView()}
                  height={650}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt" className="mt-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <GanttChart
                  tasks={ganttTasks}
                  onTaskUpdate={handleGanttTaskUpdate}
                  onTaskClick={handleGanttTaskClick}
                  onDependencyCreate={handleGanttDependencyCreate}
                  zoom={ganttZoom}
                  onZoomChange={setGanttZoom}
                  height={650}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        {/* Backdrop for filter panel */}
        {showFilters && (
          <div
            className="fixed inset-0 top-16 z-20 bg-transparent backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowFilters(false)}
            aria-hidden="true"
          />
        )}

        {/* CalendarFilters right-slide panel */}
        <div
          className={`fixed right-0 top-16 bottom-0 z-30 w-full max-w-[320px] border-l border-border bg-background shadow-lg transform transition-transform duration-300 ${
            showFilters ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full">
            {(viewMode === 'calendar' || viewMode === 'gantt') ? (
              <CalendarFilters
                filters={calendarFilters}
                onFiltersChange={setCalendarFilters}
                availableProjects={availableProjects}
                availableTeamMembers={availableTeamMembers}
                onClose={() => setShowFilters(false)}
              />
            ) : (
              <TaskFilters
                filters={filter}
                onFiltersChange={setFilter}
                availableProjects={availableProjects}
                availableTeamMembers={availableTeamMembers}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onClear={clearFilters}
              />
            )}
          </div>
        </div>

      {/* Task Form Modal (kept for compatibility, no longer primary entry) */}
      <TaskForm
        task={editingTask}
        isOpen={showCreateTask}
        onClose={() => {
          setShowCreateTask(false)
          setEditingTask(null)
        }}
        onSubmit={handleTaskSubmit}
        userProfile={userProfile}
        availableUsers={availableUsers}
        availableProjects={availableProjects}
        availableTasks={tasks?.map(t => ({ id: t.id, title: t.title })) || []}
      />

      {/* Subtask Drawer */}
      <SubtaskDrawer
        parentTask={parentTask}
        subtask={editingSubtask}
        isOpen={showCreateSubtask}
        onClose={() => {
          setShowCreateSubtask(false)
          setParentTask(null)
          setEditingSubtask(null)
        }}
        onSubmit={handleSubtaskSubmit}
        onDelete={async (taskId: string) => {
          await handleTaskDelete(taskId)
          setShowCreateSubtask(false)
          setParentTask(null)
          setEditingSubtask(null)
        }}
        userProfile={userProfile}
        availableUsers={availableUsers}
      />

      {/* Unified Task Drawer */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        task={drawerTask}
        organizationId={getOrganizationId()}
        userProfile={userProfile}
        availableUsers={availableUsers}
        availableProjects={availableProjects}
        availableTasks={tasks?.map(t => ({ id: t.id, title: t.title })) || []}
        initialDates={drawerInitialDates}
        initialStatus={drawerInitialStatus}
        onClose={() => {
          setIsDrawerOpen(false)
          setDrawerTask(null)
          setDrawerInitialStatus(undefined)
          setDrawerInitialDates(undefined)
        }}
        onSubmit={handleTaskDrawerSubmit}
        onDelete={async (taskId: string) => {
          await handleTaskDelete(taskId)
          setIsDrawerOpen(false)
          setDrawerTask(null)
        }}
        onProjectCreated={async () => {
          // Refresh projects list so newly created project appears in pickers
          try {
            const orgId = getOrganizationId()
            const projects = await getAvailableProjects(orgId)
            setAvailableProjects(projects)
          } catch (error) {
            console.error('Error refreshing projects after inline project creation:', error)
          }
        }}
      />
    </div>
  )
}