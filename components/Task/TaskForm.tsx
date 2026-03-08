'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Calendar as CalendarIcon, 
  X, 
  Plus, 
  User, 
  Clock,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Circle,
  Paperclip,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority, TaskRecurrence } from '@/types'
import type { UserProfile } from '@/lib/auth'
import { getPriorityColor as getPriorityBadgeColor } from '@/lib/status-utils'

// Form validation schema
const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.string()),
  projectId: z.string().optional(),
  parentTaskId: z.string().optional(),
  dependencies: z.array(z.string()),
  isRecurring: z.boolean(),
  recurrencePattern: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  recurrenceEndDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
})

type TaskFormData = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  task?: Task | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  userProfile?: UserProfile | null
  availableUsers?: Array<{ id: string; name: string; email: string }>
  availableProjects?: Array<{ id: string; title: string }>
  availableTasks?: Array<{ id: string; title: string }>
}

/**
 * Task Form Component
 * Handles task creation and editing with all required fields
 */
export default function TaskForm({
  task,
  isOpen,
  onClose,
  onSubmit,
  userProfile,
  availableUsers = [],
  availableProjects = [],
  availableTasks = []
}: TaskFormProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showRecurrenceCalendar, setShowRecurrenceCalendar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      startDate: undefined,
      dueDate: undefined,
      assignedTo: [],
      projectId: 'none',
      parentTaskId: undefined,
      dependencies: [],
      isRecurring: false,
      recurrencePattern: 'none',
      recurrenceEndDate: undefined,
      estimatedHours: 0,
    },
  })

  const watchedValues = watch()
  const hasSubtasks = (task?.subtasks?.length || 0) > 0
  const subtaskEstimatedTotal = hasSubtasks
    ? (task?.subtasks || []).reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    : 0

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      // Editing existing task
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        projectId: task.projectId || 'none',
        parentTaskId: task.parentTaskId,
        dependencies: task.dependencies,
        isRecurring: task.isRecurring,
        recurrencePattern: task.recurrencePattern || 'none',
        recurrenceEndDate: task.recurrenceEndDate,
        estimatedHours: hasSubtasks ? subtaskEstimatedTotal : task.estimatedHours || 0,
      })
    } else {
      // Creating new task - reset to default values
      reset()
    }
  }, [task, reset, hasSubtasks, subtaskEstimatedTotal])

  // Keep parent estimated hours synced to sum(subtasks) in the form (UI-level enforcement)
  useEffect(() => {
    if (task && hasSubtasks) {
      setValue('estimatedHours', subtaskEstimatedTotal, { shouldDirty: false })
    }
  }, [task, hasSubtasks, subtaskEstimatedTotal, setValue])

  // Reset form state when closed
  useEffect(() => {
    if (!isOpen) {
      setShowStartCalendar(false)
      setShowCalendar(false)
      setShowRecurrenceCalendar(false)
    }
  }, [isOpen])

  const handleAddAssignee = (userId: string) => {
    if (!watchedValues.assignedTo?.includes(userId)) {
      setValue('assignedTo', [...(watchedValues.assignedTo || []), userId])
    }
  }

  const handleRemoveAssignee = (userId: string) => {
    setValue('assignedTo', (watchedValues.assignedTo || []).filter(id => id !== userId))
  }

  const handleAddDependency = (taskId: string) => {
    if (!watchedValues.dependencies?.includes(taskId)) {
      setValue('dependencies', [...(watchedValues.dependencies || []), taskId])
    }
  }

  const handleRemoveDependency = (taskId: string) => {
    setValue('dependencies', (watchedValues.dependencies || []).filter(id => id !== taskId))
  }

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data)
      // Form will be closed by the parent component after successful submission
    } catch (error) {
      console.error('Error submitting form:', error)
      // Don't close the form if there's an error
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
        return <Circle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: TaskPriority) => getPriorityBadgeColor(priority)

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Update task details and assignments' : 'Add a new task to your project'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter task title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watchedValues.status}
                    onValueChange={(value) => setValue('status', value as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">
                        <div className="flex items-center space-x-2">
                          <Circle className="h-4 w-4" />
                          <span>To Do</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="review">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Review</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={watchedValues.priority}
                    onValueChange={(value) => setValue('priority', value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-[#5EEAD4] ring-1 ring-black/10 dark:ring-white/15" />
                          <span>Low</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-[#FBBF24] ring-1 ring-black/10 dark:ring-white/15" />
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-[#F97316] ring-1 ring-black/10 dark:ring-white/15" />
                          <span>High</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-[#EF4444] ring-1 ring-black/10 dark:ring-white/15" />
                          <span>Urgent</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date (optional)</Label>
                  <div className="space-y-2">
                    <Controller
                      name="startDate"
                      control={control}
                      key={task ? `edit-start-${task.id}` : 'new-start'}
                      render={({ field }) => (
                        <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date (optional)</span>
                              )}
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
                              onSelect={(date) => {
                                field.onChange(date)
                                setShowStartCalendar(false)
                              }}
                              onDayClick={(day, modifiers) => {
                                if (!modifiers.disabled && !modifiers.outside) {
                                  field.onChange(day)
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
                </div>

                <div className="space-y-2">
                  <Label>Due Date (optional)</Label>
                  <div className="space-y-2">
                    <Controller
                      name="dueDate"
                      control={control}
                      key={task ? `edit-due-${task.id}` : 'new-due'}
                      render={({ field }) => (
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date (optional)</span>
                              )}
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
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(date)
                                  setShowCalendar(false)
                                }
                              }}
                              onDayClick={(day, modifiers) => {
                                if (!modifiers.disabled && !modifiers.outside) {
                                  field.onChange(day)
                                  setShowCalendar(false)
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  disabled={!!task && hasSubtasks}
                  {...register('estimatedHours', { valueAsNumber: true })}
                  placeholder="0"
                />
                {task && hasSubtasks && (
                  <p className="text-xs text-muted-foreground">
                    Calculated from {task.subtasks?.length || 0} subtask
                    {(task.subtasks?.length || 0) === 1 ? '' : 's'}: {subtaskEstimatedTotal}h total.
                  </p>
                )}
              </div>

              {/* Recurring Task Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={watchedValues.isRecurring}
                    onCheckedChange={(checked) => setValue('isRecurring', !!checked)}
                  />
                  <Label htmlFor="isRecurring">Recurring Task</Label>
                </div>

                {watchedValues.isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label>Recurrence Pattern</Label>
                      <Select
                        value={watchedValues.recurrencePattern}
                        onValueChange={(value) => setValue('recurrencePattern', value as TaskRecurrence)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Recurrence End Date</Label>
                      <Controller
                        name="recurrenceEndDate"
                        control={control}
                        key={task ? `edit-recurrence-${task.id}` : 'new-recurrence'}
                        render={({ field }) => (
                          <Popover open={showRecurrenceCalendar} onOpenChange={setShowRecurrenceCalendar}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick end date</span>
                                )}
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
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date)
                                    setShowRecurrenceCalendar(false)
                                  }
                                }}
                                onDayClick={(day, modifiers) => {
                                  if (!modifiers.disabled && !modifiers.outside) {
                                    field.onChange(day)
                                    setShowRecurrenceCalendar(false)
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assignees</Label>
                <div className="space-y-2">
                  {watchedValues.assignedTo && watchedValues.assignedTo.map((userId) => {
                    const user = availableUsers.find(u => u.id === userId)
                    return user ? (
                      <div key={userId} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{user.name}</span>
                          <span className="text-xs text-muted-foreground">({user.email})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignee(userId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null
                  })}
                  
                  <Select onValueChange={handleAddAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers
                        .filter(user => !watchedValues.assignedTo?.includes(user.id))
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">({user.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={watchedValues.projectId}
                  onValueChange={(value) => setValue('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dependencies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dependencies</Label>
                <div className="space-y-2">
                  {watchedValues.dependencies && watchedValues.dependencies.map((taskId) => {
                    const dependencyTask = availableTasks.find(t => t.id === taskId)
                    return dependencyTask ? (
                      <div key={taskId} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{dependencyTask.title}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDependency(taskId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null
                  })}
                  
                  <Select onValueChange={handleAddDependency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add dependency" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks
                        .filter(t => !watchedValues.dependencies?.includes(t.id) && t.id !== task?.id)
                        .map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
