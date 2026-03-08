'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import {
  X,
  User,
  Clock,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import type { UserProfile } from '@/lib/auth'
import { getPriorityColor as getPriorityBadgeColor } from '@/lib/status-utils'

// Validation schema for subtask
const subtaskDrawerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.array(z.string()),
  estimatedHours: z.number().min(0).optional(),
})

export type SubtaskDrawerFormData = z.infer<typeof subtaskDrawerSchema>

interface SubtaskDrawerProps {
  isOpen: boolean
  parentTask: Task | null
  subtask?: Task | null
  userProfile?: UserProfile | null
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  onClose: () => void
  onSubmit: (data: SubtaskDrawerFormData) => Promise<void>
  onDelete?: (subtaskId: string) => Promise<void>
}

/**
 * Subtask Drawer
 * Right-slide panel for creating subtasks, following the same pattern as TaskDrawer
 */
export default function SubtaskDrawer({
  isOpen,
  parentTask,
  subtask,
  userProfile,
  availableUsers = [],
  onClose,
  onSubmit,
  onDelete,
}: SubtaskDrawerProps) {
  const [isMounted, setIsMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SubtaskDrawerFormData>({
    resolver: zodResolver(subtaskDrawerSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: parentTask?.priority || 'medium',
      assignedTo: parentTask?.assignedTo || [],
      estimatedHours: 0,
    },
  })

  const watchedValues = watch()

  // Handle smooth animation on open - ensure element mounts in hidden state first
  useEffect(() => {
    if (isOpen && parentTask) {
      // Reset mounted state when opening
      setIsMounted(false)
      // Use requestAnimationFrame to ensure DOM update happens first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMounted(true)
        })
      })
    } else {
      setIsMounted(false)
    }
  }, [isOpen, parentTask])

  // Reset when parent task changes or drawer opens
  useEffect(() => {
    if (!isOpen) return

    // Edit mode (subtask provided)
    if (subtask) {
      reset({
        title: subtask.title || '',
        description: subtask.description || '',
        status: (subtask.status || 'todo') as TaskStatus,
        priority: (subtask.priority || 'medium') as TaskPriority,
        assignedTo: subtask.assignedTo || [],
        estimatedHours: subtask.estimatedHours || 0,
      })
      return
    }

    // Create mode (parent task required for inherited defaults)
    if (parentTask) {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: parentTask.priority || 'medium',
        assignedTo: parentTask.assignedTo || [],
        estimatedHours: 0,
      })
    }
  }, [parentTask, subtask, isOpen, reset])

  // Close side-effects cleanup
  useEffect(() => {
    if (!isOpen) {
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

  const handleFormSubmit = async (data: SubtaskDrawerFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting subtask drawer form:', error)
      throw error
    }
  }

  if (!parentTask && !subtask) return null

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

  const inheritedStartDate = parentTask?.startDate ?? subtask?.startDate
  const inheritedDueDate = parentTask?.dueDate ?? subtask?.dueDate

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed top-16 bottom-0 inset-x-0 z-40 bg-transparent backdrop-blur-sm transition-opacity duration-300 will-change-opacity',
          isMounted && isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed top-16 bottom-0 right-0 z-50 w-full sm:w-[420px] bg-background shadow-xl border-l border-border',
          'transform transition-transform duration-300 ease-out will-change-transform',
          isMounted && isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={subtask ? 'Edit Subtask' : 'New Subtask'}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {subtask ? 'Edit Subtask' : 'New Subtask'}
                </span>
              </div>
              {parentTask?.title ? (
                <div className="text-xs text-muted-foreground">For: {parentTask.title}</div>
              ) : subtask?.parentTaskId ? (
                <div className="text-xs text-muted-foreground">For: {subtask.parentTaskId}</div>
              ) : null}
              <Input
                autoFocus={!subtask}
                placeholder="Subtask title"
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
            {/* Dates (inherited from parent) */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Timeframe (inherited)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Start
                  </div>
                  <div className="text-xs text-foreground mt-1">
                    {inheritedStartDate ? format(inheritedStartDate, 'PPP') : 'Not set on parent'}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Due
                  </div>
                  <div className="text-xs text-foreground mt-1">
                    {inheritedDueDate ? format(inheritedDueDate, 'PPP') : 'Not set on parent'}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Subtasks inherit the parent task&apos;s start and due dates.
              </p>
            </section>

            {/* Status */}
            <section className="space-y-2">
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
            </section>

            {/* Priority */}
            <section className="space-y-2">
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
            </section>

            {/* Estimated Hours */}
            <section className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estimated Hours
              </Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                {...register('estimatedHours', { valueAsNumber: true })}
              />
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
                placeholder="Add more context or notes..."
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
              <div className="inline-flex items-center gap-2">
                {watchedValues.estimatedHours && watchedValues.estimatedHours > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{watchedValues.estimatedHours}h</span>
                  </span>
                )}
              </div>
            </section>
          </form>

          {/* Footer actions */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-3">
            <div>
              {subtask && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(subtask.id)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
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
                {isSubmitting ? (subtask ? 'Saving…' : 'Creating…') : subtask ? 'Save & Close' : 'Create & Close'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

