'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  PlayCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import type { UserProfile } from '@/lib/auth'
import type { Project } from '@/types'
import { createProject } from '@/lib/projects'
import { getPriorityColor as getPriorityBadgeColor } from '@/lib/status-utils'

// Validation schema reused from TaskForm but focused on drawer use
const taskDrawerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.string()),
  projectId: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).optional(),
})

export type TaskDrawerFormData = z.infer<typeof taskDrawerSchema>

interface TaskDrawerProps {
  isOpen: boolean
  task?: Task | null
  organizationId: string
  userProfile?: UserProfile | null
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  availableProjects?: Array<{ id: string; title: string }>
  availableTasks?: Array<{ id: string; title: string }>
  initialDates?: { start?: Date; end?: Date }
  projectPlaceholderLabel?: string
  initialStatus?: TaskStatus
  onClose: () => void
  onSubmit: (data: TaskDrawerFormData) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  onProjectCreated?: (project: Project) => void | Promise<void>
}

/**
 * Task Drawer
 * Right-slide panel used as the single source of truth for task create/edit
 * with inline project creation.
 */
export default function TaskDrawer({
  isOpen,
  task,
  organizationId,
  userProfile,
  availableUsers = [],
  availableProjects = [],
  availableTasks = [],
  initialDates,
  projectPlaceholderLabel,
  initialStatus,
  onClose,
  onSubmit,
  onDelete,
  onProjectCreated,
}: TaskDrawerProps) {
  const [showDueCalendar, setShowDueCalendar] = useState(false)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [isCreatingProjectInline, setIsCreatingProjectInline] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<TaskDrawerFormData>({
    resolver: zodResolver(taskDrawerSchema),
    defaultValues: {
      title: '',
      description: '',
      status: initialStatus || 'todo',
      priority: 'medium',
      startDate: initialDates?.start,
      dueDate: initialDates?.end || initialDates?.start,
      assignedTo: [],
      projectId: undefined,
      dependencies: [],
      estimatedHours: 0,
    },
  })

  const watchedValues = watch()
  const hasSubtasks = (task?.subtasks?.length || 0) > 0
  const subtaskEstimatedTotal = hasSubtasks
    ? (task?.subtasks || []).reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    : 0

  // Reset when task / initialDates change
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo || [],
        projectId: task.projectId,
        dependencies: task.dependencies || [],
        estimatedHours: hasSubtasks ? subtaskEstimatedTotal : task.estimatedHours || 0,
      })
    } else {
      reset({
        title: '',
        description: '',
        status: initialStatus || 'todo',
        priority: 'medium',
        startDate: initialDates?.start,
        dueDate: initialDates?.end || initialDates?.start,
        assignedTo: [],
        projectId: undefined,
        dependencies: [],
        estimatedHours: 0,
      })
    }
  }, [task, initialDates, reset, hasSubtasks, subtaskEstimatedTotal])

  // Keep parent estimated hours synced to sum(subtasks) in the form (UI-level enforcement)
  useEffect(() => {
    if (task && hasSubtasks) {
      setValue('estimatedHours', subtaskEstimatedTotal, { shouldDirty: false })
    }
  }, [task, hasSubtasks, subtaskEstimatedTotal, setValue])

  // Close side-effects cleanup
  useEffect(() => {
    if (!isOpen) {
      setIsCreatingProjectInline(false)
      setNewProjectName('')
      setShowDueCalendar(false)
      setShowStartCalendar(false)
    }
  }, [isOpen])

  const handleAddAssignee = (userId: string) => {
    if (watchedValues.assignedTo?.includes(userId)) return
    setValue('assignedTo', [...(watchedValues.assignedTo || []), userId])
  }

  const handleRemoveAssignee = (userId: string) => {
    setValue(
      'assignedTo',
      (watchedValues.assignedTo || []).filter(id => id !== userId)
    )
  }

  const handleInlineProjectCreate = async () => {
    if (!newProjectName.trim()) return
    try {
      setIsCreatingProject(true)

      const now = new Date()
      const startDate = watchedValues.startDate || initialDates?.start || now
      const endDate = watchedValues.dueDate || initialDates?.end

      const projectData: import('@/lib/projects').CreateProjectData = {
        title: newProjectName.trim(),
        description: '',
        type: 'one-time',
        status: 'planning',
        progress: 0,
        startDate,
        endDate,
        deadline: endDate,
        assignedTo: userProfile?.uid ? [userProfile.uid] : [],
        createdBy: userProfile?.uid || 'dev-user-123',
        organizationId,
        clientId: undefined,
        budget: undefined,
        tags: [],
        clientCode: undefined,
        assignedManagerId: userProfile?.uid,
        assignedManagerName: userProfile?.email || 'Owner',
        assignedManagerTitle: undefined,
        assignedManagerEmail: userProfile?.email,
        assignedManagerPhone: undefined,
        createdAt: now,
        updatedAt: now,
      }

      const project: Project = await createProject(projectData)

      // Assign newly created project to task
      setValue('projectId', project.id)
      setIsCreatingProjectInline(false)
      setNewProjectName('')

      // Let parent refresh any dependent views (e.g. calendar banners)
      if (onProjectCreated) {
        await onProjectCreated(project)
      }
    } catch (error) {
      console.error('Error creating project from task drawer:', error)
    } finally {
      setIsCreatingProject(false)
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in-progress':
        return <PlayCircle className="h-4 w-4" />
      case 'review':
        return <AlertCircle className="h-4 w-4" />
      case 'todo':
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const handleFormSubmit = async (data: TaskDrawerFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting task drawer form:', error)
      throw error
    }
  }

  const hasSelectedProject = !!watchedValues.projectId
  const selectedProject =
    watchedValues.projectId &&
    availableProjects.find(p => p.id === watchedValues.projectId)

  // Smart suggestion: if title looks like a project, surface helper text
  const projectSuggestionLabel = (() => {
    const title = watchedValues.title || ''
    if (!title.trim()) return ''
    if (/project|launch|website|campaign/i.test(title)) {
      return `Create new project “${title.trim()}”?`
    }
    return ''
  })()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed top-16 bottom-0 inset-x-0 z-40 bg-transparent backdrop-blur-sm transition-opacity duration-300 will-change-opacity',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed top-16 bottom-0 right-0 z-50 w-full sm:w-[420px] bg-background shadow-xl border-l border-border',
          'transform transition-transform duration-300 ease-out will-change-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={task ? 'Edit Task' : 'New Task'}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {task ? 'Edit Task' : 'New Task'}
                </span>
                {hasSelectedProject && selectedProject && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {selectedProject.title}
                  </span>
                )}
              </div>
              <Input
                autoFocus={!task}
                placeholder="Task title"
                className={cn(
                  'border-0 px-0 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0',
                  errors.title && 'border-b border-destructive'
                )}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-0.5">{errors.title.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-6"
          >
            {/* Project Field with inline creation */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Project
              </Label>
              <div className="space-y-2">
                <Select
                  value={watchedValues.projectId || ''}
                  onValueChange={value =>
                    setValue('projectId', value === '' || value === 'none' ? undefined : value)
                  }
                >
                  <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue
                      placeholder={
                        projectPlaceholderLabel || 'Attach to a project (optional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {availableProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="__create_new__" disabled>
                      {/* This acts as a visual separator; inline creator below */}
                      + Create new project…
                    </SelectItem>
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  onClick={() => setIsCreatingProjectInline(prev => !prev)}
                >
                  <Plus className="h-3 w-3" />
                  {isCreatingProjectInline ? 'Cancel new project' : 'Create new project…'}
                </button>

                {isCreatingProjectInline && (
                  <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/40 p-3">
                    <Input
                      placeholder={
                        projectPlaceholderLabel || 'Project name (e.g. Acme Website Launch)'
                      }
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Start and due dates will be prefilled from this task.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCreatingProject || !newProjectName.trim()}
                        onClick={handleInlineProjectCreate}
                      >
                        {isCreatingProject ? 'Creating…' : 'Create Project'}
                      </Button>
                    </div>
                  </div>
                )}

                {projectSuggestionLabel && !hasSelectedProject && !isCreatingProjectInline && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900 shadow-sm hover:bg-amber-100"
                    onClick={() => {
                      setIsCreatingProjectInline(true)
                      setNewProjectName(watchedValues.title || '')
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    {projectSuggestionLabel}
                  </button>
                )}
              </div>
            </section>

            {/* Assignment & Status */}
            <section className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={value => setValue('status', value as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3" />
                        <span>To Do</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="review">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>Review</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Priority
                </Label>
                <Select
                  value={watchedValues.priority}
                  onValueChange={value => setValue('priority', value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-[#5EEAD4] ring-1 ring-black/10 dark:ring-white/15" />
                        <span>Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-[#FBBF24] ring-1 ring-black/10 dark:ring-white/15" />
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-[#F97316] ring-1 ring-black/10 dark:ring-white/15" />
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-[#EF4444] ring-1 ring-black/10 dark:ring-white/15" />
                        <span>Urgent</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Dates */}
            <section className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Start (optional)
                </Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left text-xs font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick date (optional)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverPrimitive.Portal>
                        <PopoverContent
                          className="w-auto p-0 z-[60] pointer-events-auto"
                          align="start"
                          side="bottom"
                          sideOffset={4}
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={date => {
                              if (date) {
                                field.onChange(date)
                                setShowStartCalendar(false)
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </PopoverPrimitive.Portal>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Due (optional)
                </Label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Popover open={showDueCalendar} onOpenChange={setShowDueCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left text-xs font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick date (optional)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverPrimitive.Portal>
                        <PopoverContent
                          className="w-auto p-0 z-[60] pointer-events-auto"
                          align="start"
                          side="bottom"
                          sideOffset={4}
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={date => {
                              if (date) {
                                field.onChange(date)
                                setShowDueCalendar(false)
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </PopoverPrimitive.Portal>
                    </Popover>
                  )}
                />
              </div>
            </section>

            {/* Estimated Hours */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estimated Hours
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    disabled={!!task && hasSubtasks}
                    {...register('estimatedHours', { valueAsNumber: true })}
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {task && hasSubtasks ? (
                  <p className="text-[11px] text-muted-foreground">
                    Calculated from {task.subtasks?.length || 0} subtask
                    {(task.subtasks?.length || 0) === 1 ? '' : 's'}: {subtaskEstimatedTotal}h total.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Set a top-level estimate. If this task has subtasks, the total will be calculated automatically.
                  </p>
                )}
              </div>
            </section>

            {/* Assignees */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assignees
              </Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {watchedValues.assignedTo?.map(userId => {
                    const user = availableUsers.find(u => u.id === userId)
                    if (!user) return null
                    const initials = user.name
                      .split(' ')
                      .map(part => part[0])
                      .join('')
                      .slice(0, 2)

                    return (
                      <div
                        key={userId}
                        className="inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {initials}
                        </div>
                        <span>{user.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignee(userId)}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted-foreground/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <Select onValueChange={handleAddAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers
                      .filter(user => !watchedValues.assignedTo?.includes(user.id))
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{user.name}</span>
                            {user.email && (
                              <span className="text-[11px] text-muted-foreground">
                                ({user.email})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Description */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </Label>
              <Textarea
                rows={3}
                placeholder="Add more context or notes that keep everyone aligned."
                {...register('description')}
              />
            </section>

            {/* Lightweight meta row */}
            <section className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                {getStatusIcon(watchedValues.status as TaskStatus)}
                <span className="capitalize">{watchedValues.status.replace('-', ' ')}</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        getPriorityBadgeColor(watchedValues.priority as TaskPriority)
                  )}
                >
                  {watchedValues.priority}
                </span>
              </div>
            </section>
          </form>

          {/* Footer actions */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-3">
            <div>
              {task && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save & Close'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


