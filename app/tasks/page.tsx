'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getCurrentUserProfile } from '@/lib/auth'
import { getTasks, createTask, updateTask, deleteTask, createSubtask, getTasksWithSubtasks, updateParentTaskStatus, getAvailableUsers, getAvailableProjects } from '@/lib/tasks'
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
  Tag,
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
import SubtaskForm from '@/components/Task/SubtaskForm'
import type { Task, TaskFilter } from '@/types'
import type { UserProfile } from '@/lib/auth'

/**
 * Task Manager Page Component
 * Provides Kanban board and list views for task management
 */
export default function TasksPage() {
  // Component loaded
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCreateSubtask, setShowCreateSubtask] = useState(false)
  const [parentTask, setParentTask] = useState<Task | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; title: string }>>([])
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<TaskFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Array<{id: string, label: string, value: string, type: string}>>([])

  // Memoized function to refresh tasks data
  const refreshTasks = useCallback(async () => {
    const orgId = userProfile?.organizationId || 'dev-org-123'
    
    try {
      const tasksData = await getTasksWithSubtasks(orgId)
      setTasks(tasksData)
    } catch (error) {
      console.error('Error refreshing tasks:', error)
    }
  }, [userProfile?.organizationId])

  // Load user profile and tasks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Get user profile
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
        
        if (profile) {
          // Load tasks with subtasks from localStorage
          const tasksData = await getTasksWithSubtasks(profile.organizationId || 'dev-org-123')
          setTasks(tasksData)
          
          // Load available users and projects
          const users = await getAvailableUsers(profile.organizationId || 'dev-org-123')
          const projects = await getAvailableProjects(profile.organizationId || 'dev-org-123')
          
          setAvailableUsers(users)
          setAvailableProjects(projects)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      
      // Fix: Remove pointer-events blocking that prevents navigation
      const body = document.body
      if (body.style.pointerEvents === 'none') {
        body.style.pointerEvents = 'auto'
        body.style.removeProperty('pointer-events')
      }
      
      // Persistent fix: Monitor and remove pointer-events blocking
      const fixPointerEvents = () => {
        if (body.style.pointerEvents === 'none') {
          body.style.pointerEvents = 'auto'
          body.style.removeProperty('pointer-events')
        }
      }
      
      // Check immediately and then every 100ms for 5 seconds
      fixPointerEvents()
      const interval = setInterval(fixPointerEvents, 100)
      setTimeout(() => clearInterval(interval), 5000)
      
    } catch (error) {
      console.error('Error in task operation:', error)
      throw error
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(
        userProfile?.organizationId || 'dev-org-123',
        taskId,
        updates
      )
      
      if (updatedTask) {
        // If this is a subtask update, update parent task status
        const parentTask = tasks.find(t => t.subtasks?.some(st => st.id === taskId))
        if (parentTask) {
          await updateParentTaskStatus(
            userProfile?.organizationId || 'dev-org-123',
            parentTask.id
          )
        }
        
        // Refresh tasks data
        const orgId = userProfile?.organizationId || 'dev-org-123'
        const tasksData = await getTasksWithSubtasks(orgId)
        setTasks(tasksData)
        
        // Fix: Remove pointer-events blocking that prevents navigation
        const body = document.body
        if (body.style.pointerEvents === 'none') {
          body.style.pointerEvents = 'auto'
          body.style.removeProperty('pointer-events')
        }
        
        // Persistent fix: Monitor and remove pointer-events blocking
        const fixPointerEvents = () => {
          if (body.style.pointerEvents === 'none') {
            body.style.pointerEvents = 'auto'
            body.style.removeProperty('pointer-events')
          }
        }
        
        // Check immediately and then every 100ms for 5 seconds
        fixPointerEvents()
        const interval = setInterval(fixPointerEvents, 100)
        setTimeout(() => clearInterval(interval), 5000)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const success = await deleteTask(
        userProfile?.organizationId || 'dev-org-123',
        taskId
      )
      
      if (success) {
        // Refresh tasks data
        const orgId = userProfile?.organizationId || 'dev-org-123'
        const tasksData = await getTasksWithSubtasks(orgId)
        setTasks(tasksData)
        
        // Fix: Remove pointer-events blocking that prevents navigation
        const body = document.body
        if (body.style.pointerEvents === 'none') {
          body.style.pointerEvents = 'auto'
          body.style.removeProperty('pointer-events')
        }
        
        // Persistent fix: Monitor and remove pointer-events blocking
        const fixPointerEvents = () => {
          if (body.style.pointerEvents === 'none') {
            body.style.pointerEvents = 'auto'
            body.style.removeProperty('pointer-events')
          }
        }
        
        // Check immediately and then every 100ms for 5 seconds
        fixPointerEvents()
        const interval = setInterval(fixPointerEvents, 100)
        setTimeout(() => clearInterval(interval), 5000)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSubtaskSubmit = async (formData: any) => {
    try {
      if (parentTask) {
        await createSubtask(
          userProfile?.organizationId || 'dev-org-123',
          parentTask.id,
          formData
        )
        
        // Refresh tasks data
        const orgId = userProfile?.organizationId || 'dev-org-123'
        const tasksData = await getTasksWithSubtasks(orgId)
        setTasks(tasksData)
        
        // Reset form state
        setShowCreateSubtask(false)
        setParentTask(null)
        
        // Fix: Remove pointer-events blocking that prevents navigation
        const body = document.body
        if (body.style.pointerEvents === 'none') {
          body.style.pointerEvents = 'auto'
          body.style.removeProperty('pointer-events')
        }
        
        // Persistent fix: Monitor and remove pointer-events blocking
        const fixPointerEvents = () => {
          if (body.style.pointerEvents === 'none') {
            body.style.pointerEvents = 'auto'
            body.style.removeProperty('pointer-events')
          }
        }
        
        // Check immediately and then every 100ms for 5 seconds
        fixPointerEvents()
        const interval = setInterval(fixPointerEvents, 100)
        setTimeout(() => clearInterval(interval), 5000)
      }
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

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!task.title.toLowerCase().includes(query) && 
          !task.description?.toLowerCase().includes(query) &&
          !task.tags?.some(tag => tag.toLowerCase().includes(query))) {
        return false
      }
    }

    // Status filter
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(task.status)) {
        return false
      }
    }

    // Priority filter
    if (filter.priority && filter.priority.length > 0) {
      if (!filter.priority.includes(task.priority)) {
        return false
      }
    }

    // Assigned to filter
    if (filter.assignedTo && filter.assignedTo.length > 0) {
      if (!task.assignedTo?.some(assignee => filter.assignedTo!.includes(assignee))) {
        return false
      }
    }

    // Project filter
    if (filter.projectId && task.projectId !== filter.projectId) {
      return false
    }

    // Created by filter
    if (filter.createdBy && task.createdBy !== filter.createdBy) {
      return false
    }

    // Date filters
    if (filter.startDateFrom && task.startDate && new Date(task.startDate) < new Date(filter.startDateFrom)) {
      return false
    }
    if (filter.startDateTo && task.startDate && new Date(task.startDate) > new Date(filter.startDateTo)) {
      return false
    }
    if (filter.dueDateFrom && task.dueDate && new Date(task.dueDate) < new Date(filter.dueDateFrom)) {
      return false
    }
    if (filter.dueDateTo && task.dueDate && new Date(task.dueDate) > new Date(filter.dueDateTo)) {
      return false
    }
    if (filter.createdDateFrom && task.createdAt && new Date(task.createdAt) < new Date(filter.createdDateFrom)) {
      return false
    }
    if (filter.createdDateTo && task.createdAt && new Date(task.createdAt) > new Date(filter.createdDateTo)) {
      return false
    }
    if (filter.modifiedDateFrom && task.updatedAt && new Date(task.updatedAt) < new Date(filter.modifiedDateFrom)) {
      return false
    }
    if (filter.modifiedDateTo && task.updatedAt && new Date(task.updatedAt) > new Date(filter.modifiedDateTo)) {
      return false
    }
    if (filter.completedDateFrom && task.completedAt && new Date(task.completedAt) < new Date(filter.completedDateFrom)) {
      return false
    }
    if (filter.completedDateTo && task.completedAt && new Date(task.completedAt) > new Date(filter.completedDateTo)) {
      return false
    }

    // Task type filter
    if (filter.taskType && task.taskType !== filter.taskType) {
      return false
    }

    // Overdue filter
    if (filter.isOverdue && task.dueDate) {
      const isOverdue = new Date() > task.dueDate && task.status !== 'completed'
      if (!isOverdue) {
        return false
      }
    }

    return true
  })

  // Add active filter
  const addActiveFilter = (id: string, label: string, value: string, type: string) => {
    setActiveFilters(prev => {
      // Remove existing filter of same type if it exists
      const filtered = prev.filter(f => f.type !== type)
      return [...filtered, { id, label, value, type }]
    })
  }

  // Remove active filter
  const removeActiveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId))
    
    // Update the actual filter state
    const filterToRemove = activeFilters.find(f => f.id === filterId)
    if (filterToRemove) {
      if (filterToRemove.type === 'status') {
        setFilter(prev => ({ ...prev, status: prev.status?.filter(s => s !== filterToRemove.value) }))
      } else if (filterToRemove.type === 'priority') {
        setFilter(prev => ({ ...prev, priority: prev.priority?.filter(p => p !== filterToRemove.value) }))
      } else if (filterToRemove.type === 'project') {
        setFilter(prev => ({ ...prev, projectId: undefined }))
      }
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilter({})
    setSearchQuery('')
    setActiveFilters([])
  }

  // Get active filter count
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
    return count
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>



      {/* View Toggle and Task Display */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4" />
              <span>Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filter</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Active Filters Section */}
                {activeFilters.length > 0 && (
                  <>
                    <div className="px-2 py-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">All filters</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {activeFilters.map((filter) => (
                          <div
                            key={filter.id}
                            className="flex items-center space-x-2 p-2 border rounded bg-background"
                          >
                            {/* Filter Icon and Label */}
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              {filter.type === 'status' && <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {filter.type === 'priority' && <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {filter.type === 'project' && <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {filter.type === 'date' && <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {filter.type === 'user' && <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              {filter.type === 'type' && <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              <span className="text-xs font-medium">{filter.label}</span>
                            </div>

                            {/* Condition */}
                            <span className="text-xs text-muted-foreground">is</span>

                            {/* Value Display */}
                            <div className="flex items-center space-x-1 min-w-0 flex-1">
                              <div className={`px-1.5 py-0.5 rounded text-xs ${
                                filter.type === 'priority' && filter.value === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                filter.type === 'priority' && filter.value === 'high' ? 'bg-red-100 text-red-800' :
                                filter.type === 'priority' && filter.value === 'urgent' ? 'bg-red-100 text-red-800' :
                                filter.type === 'priority' && filter.value === 'medium' ? 'bg-orange-100 text-orange-800' :
                                'bg-muted'
                              }`}>
                                {filter.value === 'completed' ? 'Incomplete tasks' : 
                                 filter.value === 'incomplete' ? 'Incomplete tasks' :
                                 filter.value === 'today' ? 'Today' :
                                 filter.value === 'low' ? 'Low' :
                                 filter.value === 'high' ? 'High' :
                                 filter.value === 'urgent' ? 'Urgent' :
                                 filter.value === 'medium' ? 'Medium' :
                                 filter.value === 'milestones' ? 'Milestones' :
                                 filter.value === '' ? 'Select user...' :
                                 filter.value}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-muted-foreground/20 flex-shrink-0"
                              onClick={() => removeActiveFilter(filter.id)}
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Completion Status */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    const currentStatus = filter.status || []
                    if (currentStatus.includes('completed')) {
                      setFilter({ ...filter, status: currentStatus.filter(s => s !== 'completed') })
                      setActiveFilters(prev => prev.filter(f => f.type !== 'status' || f.value !== 'completed'))
                    } else {
                      setFilter({ ...filter, status: [...currentStatus, 'completed'] })
                      addActiveFilter('status-completed', 'Completion status', 'completed', 'status')
                    }
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completion status</span>
                  </div>
                  {(filter.status?.includes('completed') || false) && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </DropdownMenuItem>

                {/* Start Date */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('start-date', 'Start date', 'today', 'date')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Start date</span>
                </DropdownMenuItem>

                {/* Due Date */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('due-date', 'Due date', 'today', 'date')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Due date</span>
                </DropdownMenuItem>

                {/* Created By */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('created-by', 'Created by', '', 'user')
                  }}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Created by</span>
                </DropdownMenuItem>

                {/* Created On */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('created-on', 'Created on', 'today', 'date')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Created on</span>
                </DropdownMenuItem>

                {/* Last Modified On */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('last-modified', 'Last modified on', 'today', 'date')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Last modified on</span>
                </DropdownMenuItem>

                {/* Task Type */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('task-type', 'Task type', 'milestones', 'type')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Circle className="h-4 w-4" />
                  <span>Task type</span>
                </DropdownMenuItem>

                {/* Priority */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    addActiveFilter('priority', 'Priority', 'low', 'priority')
                  }}
                  className="flex items-center space-x-2"
                >
                  <Tag className="h-4 w-4" />
                  <span>Priority</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                {/* Add Filter Button */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    // You can implement add filter logic here
                    console.log('Add filter clicked')
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add filter</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuItem>
                
                {/* Clear All Filters */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={clearFilters}
                  className="text-red-600 dark:text-red-400"
                >
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={() => {
                setEditingTask(null)
                setShowCreateTask(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard 
            tasks={filteredTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={(task) => {
              setEditingTask(task)
              setShowCreateTask(true)
            }}
            onCreateTask={() => {
              setEditingTask(null)
              setShowCreateTask(true)
            }}
            onCreateSubtask={(task) => {
              setParentTask(task)
              setShowCreateSubtask(true)
            }}
            userProfile={userProfile}
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
              setEditingTask(task)
              setShowCreateTask(true)
            }}
            onCreateSubtask={(task) => {
              setParentTask(task)
              setShowCreateSubtask(true)
            }}
            onReorder={handleTaskReorder}
            userProfile={userProfile}
            showSubtasks={expandedTasks}
            onToggleSubtasks={handleToggleSubtasks}
          />
        </TabsContent>
      </Tabs>

      {/* Task Form Modal */}
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

      {/* Subtask Form Modal */}
      <SubtaskForm
        parentTask={parentTask}
        isOpen={showCreateSubtask}
        onClose={() => {
          setShowCreateSubtask(false)
          setParentTask(null)
        }}
        onSubmit={handleSubtaskSubmit}
        userProfile={userProfile}
        availableUsers={availableUsers}
      />
    </div>
  )
}