'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CreateSubtaskForm as CreateSubtaskFormType, TaskPriority } from '@/types'
import type { UserProfile } from '@/lib/auth'
import { getPriorityColor as getPriorityBadgeColor } from '@/lib/status-utils'

// Form validation schema
const subtaskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.string()),
  estimatedHours: z.number().min(0).optional(),
})

type SubtaskFormData = z.infer<typeof subtaskFormSchema>

interface SubtaskFormProps {
  parentTask: any // Task object
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SubtaskFormData) => Promise<void>
  userProfile?: UserProfile | null
  availableUsers?: Array<{ id: string; name: string; email: string }>
}

/**
 * Subtask Form Component
 * Simplified form for creating subtasks with inherited context from parent task
 */
export default function SubtaskForm({
  parentTask,
  isOpen,
  onClose,
  onSubmit,
  userProfile,
  availableUsers = []
}: SubtaskFormProps) {
  const [showCalendar, setShowCalendar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: parentTask?.priority || 'medium',
      assignedTo: parentTask?.assignedTo || [],
      estimatedHours: 0,
    },
  })

  const watchedValues = watch()

  // Reset form when parent task changes
  useEffect(() => {
    if (parentTask) {
      reset({
        title: '',
        description: '',
        priority: parentTask.priority || 'medium',
        assignedTo: parentTask.assignedTo || [],
        estimatedHours: 0,
      })
    }
  }, [parentTask, reset])

  const handleAddAssignee = (userId: string) => {
    if (!watchedValues.assignedTo?.includes(userId)) {
      setValue('assignedTo', [...(watchedValues.assignedTo || []), userId])
    }
  }

  const handleRemoveAssignee = (userId: string) => {
    setValue('assignedTo', (watchedValues.assignedTo || []).filter(id => id !== userId))
  }

  const onFormSubmit = async (data: SubtaskFormData) => {
    try {
      await onSubmit(data)
      // Form will be closed by the parent component after successful submission
    } catch (error) {
      console.error('Error submitting subtask form:', error)
      // Don't close the form if there's an error
    }
  }

  const getPriorityColor = (priority: TaskPriority) => getPriorityBadgeColor(priority)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subtask</DialogTitle>
          <DialogDescription>
            Add a subtask to &quot;{parentTask?.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Subtask Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter subtask title"
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
                  placeholder="Enter subtask description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...register('estimatedHours', { valueAsNumber: true })}
                    placeholder="0"
                  />
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
              <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedValues.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.dueDate ? (
                        format(watchedValues.dueDate, "PPP")
                      ) : (
                        <span>Pick a date (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedValues.dueDate}
                      onSelect={(date) => {
                        setValue('dueDate', date)
                        setShowCalendar(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Subtask'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
