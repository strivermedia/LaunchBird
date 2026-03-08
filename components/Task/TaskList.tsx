'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  Clock,
  PlayCircle,
  User,
  Paperclip,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Maximize2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task, TaskStatus, TaskPriority, TaskSort } from '@/types'
import type { UserProfile } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { getPriorityColor as getPriorityBadgeColor, getTaskStageTheme } from '@/lib/status-utils'

interface InlineEditableTitleProps {
  value: string
  onSave: (newValue: string) => void
  className?: string
  onExpand?: () => void
}

const InlineEditableTitle: React.FC<InlineEditableTitleProps> = ({
  value,
  onSave,
  className,
  onExpand,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!isEditing) {
      setDraft(value)
    }
  }, [value, isEditing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    }
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        className={`h-8 text-sm px-2 ${className || ''}`}
      />
    )
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`group flex min-w-0 flex-1 items-center rounded-md border border-transparent px-2 py-1 hover:border-border hover:bg-muted/60 cursor-text ${className || ''}`}
        onClick={() => setIsEditing(true)}
      >
        <span className="min-w-0 flex-1 font-medium text-sm text-left truncate text-foreground group-hover:text-foreground">
          {value}
        </span>
      </div>
      {onExpand && (
        <button
          type="button"
          className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          aria-label="Open details"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

interface InlineEditableDescriptionProps {
  value?: string
  onSave: (newValue?: string) => void
  className?: string
}

const InlineEditableDescription: React.FC<InlineEditableDescriptionProps> = ({
  value,
  onSave,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  useEffect(() => {
    if (!isEditing) setDraft(value || '')
  }, [value, isEditing])

  const commit = () => {
    const trimmed = draft.trim()
    const next = trimmed.length ? trimmed : undefined
    const prev = value?.trim() ? value.trim() : undefined
    if (next !== prev) onSave(next)
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(value || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        rows={2}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            commit()
          }
        }}
        className={`mt-1 w-full resize-none text-xs ${className || ''}`}
      />
    )
  }

  return (
    <button
      type="button"
      className={`mt-1 w-full text-left ${className || ''}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="text-xs text-muted-foreground line-clamp-1 break-all hover:text-foreground/80">
        {value?.trim() ? value : 'Add description…'}
      </div>
    </button>
  )
}

// Sortable Task Row Component
interface SortableTaskRowProps {
  task: Task
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
  onQuickCreateSubtask?: (parentTaskId: string, title: string) => void
  userProfile?: UserProfile | null
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
  getPriorityColor: (priority: TaskPriority) => string
  getStatusColor: (status: TaskStatus) => string
  getStatusIcon: (status: TaskStatus) => React.ReactNode
  isOverdue: (task: Task) => boolean
  isDueSoon: (task: Task) => boolean
}

const SortableTaskRow: React.FC<SortableTaskRowProps> = ({
  task,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateSubtask,
  onQuickCreateSubtask,
  userProfile,
  showSubtasks,
  onToggleSubtasks,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  isOverdue,
  isDueSoon,
}) => {
  const [isTaskDueDateOpen, setIsTaskDueDateOpen] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleQuickAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim()
    if (!trimmed) return

    if (onQuickCreateSubtask) {
      onQuickCreateSubtask(task.id, trimmed)
    } else if (onCreateSubtask) {
      onCreateSubtask(task)
    }

    setNewSubtaskTitle('')
  }

  return (
    <React.Fragment>
      <TableRow 
        ref={setNodeRef} 
        style={style}
        className={`group hover:bg-muted/50 ${isDragging ? 'opacity-50' : ''}`}
      >
        <TableCell>
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mr-2 p-1 hover:bg-muted rounded border border-transparent hover:border-border"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-start space-x-2">
            {(task.subtasks?.length || 0) > 0 && (
              <button
                type="button"
                className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/10 transition-opacity opacity-100"
                onClick={() => onToggleSubtasks?.(task.id)}
                aria-label={showSubtasks?.has(task.id) ? 'Collapse subtasks' : 'Expand subtasks'}
              >
                {showSubtasks?.has(task.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <InlineEditableTitle
                value={task.title}
                onSave={(newTitle) => onTaskUpdate(task.id, { title: newTitle })}
                onExpand={onTaskEdit ? () => onTaskEdit(task) : undefined}
              />
              <InlineEditableDescription
                value={task.description}
                onSave={(newDesc) => onTaskUpdate(task.id, { description: newDesc })}
              />
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
              >
                <Badge
                  variant="secondary"
                  className={`text-xs ${getPriorityColor(task.priority)}`}
                >
                  {task.priority.toUpperCase()}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { priority: 'low' })}>
                  <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#5EEAD4] ring-1 ring-black/10 dark:ring-white/15" />
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { priority: 'medium' })}>
                  <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#FBBF24] ring-1 ring-black/10 dark:ring-white/15" />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { priority: 'high' })}>
                  <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#F97316] ring-1 ring-black/10 dark:ring-white/15" />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { priority: 'urgent' })}>
                  <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#EF4444] ring-1 ring-black/10 dark:ring-white/15" />
                  Urgent
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
        
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 ${getStatusColor(task.status)}`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium capitalize">
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'todo' })}>
                To do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'in-progress' })}>
                In progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'review' })}>
                Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTaskUpdate(task.id, { status: 'completed' })}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
        
        <TableCell className="overflow-hidden max-w-[128px]">
          <Popover open={isTaskDueDateOpen} onOpenChange={setIsTaskDueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto min-h-7 px-2 py-1 text-sm font-normal min-w-0 w-full justify-start whitespace-normal text-left"
              >
                <div className="flex items-start space-x-2 min-w-0 flex-1 w-full">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                  {task.dueDate ? (
                    <span
                      className={`min-w-0 break-words text-left ${
                        isOverdue(task)
                          ? 'text-red-600 dark:text-red-400 font-medium'
                          : isDueSoon(task)
                          ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {isOverdue(task)
                        ? 'Overdue'
                        : isDueSoon(task)
                        ? 'Due soon'
                        : (() => {
                            const formatted = formatDistanceToNow(task.dueDate, { addSuffix: true })
                            return formatted.charAt(0).toUpperCase() + formatted.slice(1)
                          })()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground min-w-0 break-words text-left">No due date</span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <DatePicker
                mode="single"
                selected={task.dueDate}
                onSelect={(date) => {
                  if (!date) return
                  onTaskUpdate(task.id, { dueDate: date })
                  setIsTaskDueDateOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </TableCell>
        
        <TableCell>
          {task.assignedToNames && task.assignedToNames.length > 0 ? (
            <div className="flex -space-x-1">
              {task.assignedToNames.slice(0, 3).map((name, index) => (
                <Avatar key={index} className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedToNames.length > 3 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{task.assignedToNames.length - 3}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Unassigned</span>
          )}
        </TableCell>
        
        <TableCell>
          {task.projectTitle ? (
            <div className="flex items-start space-x-2 min-w-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
              <span className="text-sm text-foreground break-words min-w-0">
                {task.projectTitle}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No project</span>
          )}
        </TableCell>
        
        <TableCell>
          <div className="flex items-center space-x-2">
            {/* Comments and Attachments */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {task.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {task.attachments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                {task.status !== 'completed' && (
                  <DropdownMenuItem 
                    onClick={() => onTaskUpdate(task.id, { status: 'completed' })}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onTaskDelete?.(task.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Subtask inline section (add + list) */}
      {showSubtasks?.has(task.id) && (
        <>
          {/* Existing subtasks list */}
          {task.subtasks && task.subtasks.length > 0 && task.subtasks.map((subtask) => (
            <TableRow
              key={subtask.id}
              className="relative hover:bg-muted/40 bg-muted/30"
            >
              <TableCell className="relative">
                <div className="flex items-center pl-10">
                  <div className="w-4 h-4 border-l-2 border-b-2 border-primary/40 rounded-bl-sm mr-2" />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1 pl-10">
                  <InlineEditableTitle
                    value={subtask.title}
                    onSave={(newTitle) => onTaskUpdate(subtask.id, { title: newTitle })}
                    className="text-muted-foreground"
                    onExpand={onTaskEdit ? () => onTaskEdit(subtask) : undefined}
                  />
                  <InlineEditableDescription
                    value={subtask.description}
                    onSave={(newDesc) => onTaskUpdate(subtask.id, { description: newDesc })}
                  />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPriorityColor(subtask.priority)}`}
                  >
                    {subtask.priority.toUpperCase()}
                  </Badge>
                  {subtask.estimatedHours && subtask.estimatedHours > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{subtask.estimatedHours}h</span>
                    </span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className={`flex items-center space-x-2 ${getStatusColor(subtask.status)}`}>
                  {getStatusIcon(subtask.status)}
                  <span className="text-sm font-medium capitalize">
                    {subtask.status.replace('-', ' ')}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="overflow-hidden max-w-[128px]">
                {subtask.dueDate ? (
                  <div className="flex items-start space-x-2 text-sm min-w-0 w-full text-left">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span
                      className={`min-w-0 break-words text-left ${
                        isOverdue(subtask)
                          ? 'text-red-600 dark:text-red-400 font-medium'
                          : isDueSoon(subtask)
                          ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {isOverdue(subtask)
                        ? 'Overdue'
                        : isDueSoon(subtask)
                        ? 'Due soon'
                        : (() => {
                            const formatted = formatDistanceToNow(subtask.dueDate, { addSuffix: true })
                            return formatted.charAt(0).toUpperCase() + formatted.slice(1)
                          })()}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm min-w-0 break-words text-left">No due date</span>
                )}
              </TableCell>
              
              <TableCell>
                {subtask.assignedToNames && subtask.assignedToNames.length > 0 ? (
                  <div className="flex -space-x-1">
                    {subtask.assignedToNames.slice(0, 3).map((name, index) => (
                      <Avatar key={index} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {subtask.assignedToNames.length > 3 && (
                      <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{subtask.assignedToNames.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Unassigned</span>
                )}
              </TableCell>
              
              <TableCell>
                {subtask.projectTitle ? (
                  <div className="flex items-start space-x-2 min-w-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-foreground break-words min-w-0">
                      {subtask.projectTitle}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No project</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  {/* Comments and Attachments */}
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {subtask.comments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{subtask.comments.length}</span>
                      </div>
                    )}
                    {subtask.attachments.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{subtask.attachments.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskEdit?.(subtask)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Subtask
                      </DropdownMenuItem>
                      {subtask.status !== 'completed' && (
                        <DropdownMenuItem 
                          onClick={() => onTaskUpdate(subtask.id, { status: 'completed' })}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onTaskDelete?.(subtask.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Subtask
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Inline "Add subtask" row (always last) */}
          <TableRow className="relative bg-transparent">
            <TableCell className="relative">
              <div className="flex items-center pl-10">
                <div className="w-4 h-4 border-l-2 border-b-2 border-primary/30 rounded-bl-sm mr-2" />
              </div>
            </TableCell>
            <TableCell colSpan={7}>
              <div className="flex items-center gap-2 pl-10 py-2 rounded-md border border-primary/10 bg-primary/5">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask"
                  className="h-8 text-sm max-w-sm bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleQuickAddSubtask()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setNewSubtaskTitle('')
                    }
                  }}
                  onBlur={() => {
                    handleQuickAddSubtask()
                  }}
                />
              </div>
            </TableCell>
          </TableRow>
        </>
      )}
    </React.Fragment>
  )
}

interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
  onQuickCreateSubtask?: (parentTaskId: string, title: string) => void
  onReorder?: (reorderedTasks: Task[]) => void
  userProfile?: UserProfile | null
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
  onCreateTask?: () => void
}

/**
 * Task List Component
 * Displays tasks in a sortable table format
 */
export default function TaskList({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateSubtask,
  onReorder,
  userProfile,
  showSubtasks,
  onToggleSubtasks,
  onCreateTask,
  onQuickCreateSubtask,
}: TaskListProps) {
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' })
  const [isManualOrder, setIsManualOrder] = useState(false)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log('Drag end:', { activeId: active.id, overId: over?.id })

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over.id)

      console.log('Reordering:', { oldIndex, newIndex })

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
        setIsManualOrder(true)
        onReorder?.(reorderedTasks)
        console.log('Tasks reordered:', reorderedTasks.length)
      }
    }
  }

  // Handle sort change
  const handleSort = (field: TaskSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
    setIsManualOrder(false)
  }

  // Sort tasks based on current sort settings (only if not manually ordered)
  const sortedTasks = isManualOrder ? tasks : [...tasks].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sort.field) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'dueDate':
        aValue = a.dueDate?.getTime() || 0
        bValue = b.dueDate?.getTime() || 0
        break
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
        break
      case 'createdAt':
        aValue = a.createdAt.getTime()
        bValue = b.createdAt.getTime()
        break
      case 'updatedAt':
        aValue = a.updatedAt.getTime()
        bValue = b.updatedAt.getTime()
        break
      default:
        return 0
    }

    if (sort.direction === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getSortIcon = (field: TaskSort['field']) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sort.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  // Priority color mapping
  const getPriorityColor = (priority: TaskPriority) => {
    return getPriorityBadgeColor(priority)
  }

  // Status color mapping
  const getStatusColor = (status: TaskStatus) => {
    return getTaskStageTheme(status).text
  }

  // Status icon mapping
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

  const isOverdue = (task: Task) => {
    return !!(task.dueDate && new Date() > task.dueDate && task.status !== 'completed')
  }

  const isDueSoon = (task: Task) => {
    return !!(task.dueDate && 
      new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && 
      task.status !== 'completed')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg">Task List</CardTitle>
            {isManualOrder && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Manual Order
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsManualOrder(false)}
                  className="h-6 px-2 text-xs"
                >
                  Reset to Sort
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-[320px] md:w-[420px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('title')}
                    className="h-8 px-2 lg:px-3"
                  >
                    Task
                    {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead className="w-28">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('priority')}
                    className="h-8 px-2 lg:px-3"
                  >
                    Priority
                    {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead className="w-32">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('dueDate')}
                    className="h-8 px-2 lg:px-3 justify-start"
                  >
                    Due Date
                    {getSortIcon('dueDate')}
                  </Button>
                </TableHead>
                <TableHead className="w-32">Assignees</TableHead>
                <TableHead className="w-36">Project</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {sortedTasks.map((task) => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      onTaskUpdate={onTaskUpdate}
                      onTaskDelete={onTaskDelete}
                      onTaskEdit={onTaskEdit}
                      onCreateSubtask={onCreateSubtask}
                      onQuickCreateSubtask={onQuickCreateSubtask}
                      userProfile={userProfile}
                      showSubtasks={showSubtasks}
                      onToggleSubtasks={onToggleSubtasks}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      isOverdue={isOverdue}
                      isDueSoon={isDueSoon}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        </div>
        
        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <CheckSquare className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first task
            </p>
            <Button
              onClick={() => {
                if (onCreateTask) {
                  onCreateTask()
                } else {
                  onTaskEdit?.({} as Task)
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
