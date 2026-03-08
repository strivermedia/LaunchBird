'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar as CalendarIcon,
  Clock,
  PlayCircle,
  Paperclip,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Circle,
  Folder,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  User,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { getPriorityColor as getPriorityBadgeColor, getTaskStageTheme } from '@/lib/status-utils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: any
  availableProjects?: Array<{ id: string; title: string }>
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  isDragging?: boolean
  dragPreview?: boolean
  showSubtasks?: boolean
  onToggleSubtasks?: (taskId: string) => void
}

/**
 * TaskCard Component
 * Displays individual task information with priority indicators and actions
 */
export default function TaskCard({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit,
  onCreateSubtask,
  userProfile,
  availableProjects = [],
  availableUsers = [],
  isDragging = false,
  dragPreview = false,
  showSubtasks = false,
  onToggleSubtasks
}: TaskCardProps) {
  const [isDueDateOpen, setIsDueDateOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title || '')
  const [draftDescription, setDraftDescription] = useState(task.description || '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Inline editing state for subtasks: { subtaskId: { isEditingTitle: bool, isEditingDescription: bool, draftTitle: string, draftDescription: string } }
  const [subtaskEditingState, setSubtaskEditingState] = useState<Record<string, {
    isEditingTitle: boolean
    isEditingDescription: boolean
    draftTitle: string
    draftDescription: string
  }>>({})

  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentDraft, setEditingCommentDraft] = useState('')

  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [isAssigneesOpen, setIsAssigneesOpen] = useState(false)
  const [subtaskAssigneesOpen, setSubtaskAssigneesOpen] = useState<string | null>(null)

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed'
  const isDueSoon =
    task.dueDate &&
    new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    task.status !== 'completed'

  // Keep drafts in sync when switching tasks
  React.useEffect(() => {
    setDraftTitle(task.title || '')
    setDraftDescription(task.description || '')
    setIsEditingTitle(false)
    setIsEditingDescription(false)
    setEditingCommentId(null)
    setEditingCommentDraft('')
    setNewComment('')
    setUploadError(null)
    setIsUploadingFiles(false)
    setSubtaskEditingState({})
    setIsAssigneesOpen(false)
    setSubtaskAssigneesOpen(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [task.id])

  const totalSubtasks = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(st => st.status === 'completed').length || 0
  const progressValue = (() => {
    // Completed always shows 100%.
    if (task.status === 'completed') return 100

    // Base progress follows the Kanban stage.
    const stageBase = (() => {
      switch (task.status) {
      case 'todo':
        return 0
      case 'in-progress':
        return 33
      case 'review':
        return 66
      default:
        return 0
      }
    })()

    // If subtasks exist, raise progress to match % complete (never lower than stage base).
    if (totalSubtasks > 0) {
      const subtaskPct = Math.round((completedSubtasks / totalSubtasks) * 100)
      const calculatedProgress = Math.max(stageBase, subtaskPct)
      // Cap at 66% only when in Review stage
      return task.status === 'review' ? Math.min(66, calculatedProgress) : calculatedProgress
    }

    return stageBase
  })()

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

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onTaskUpdate) {
      onTaskUpdate(task.id, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : undefined
      })
    }
  }

  const handlePriorityChange = (newPriority: TaskPriority) => {
    if (onTaskUpdate) {
      onTaskUpdate(task.id, { priority: newPriority })
    }
  }

  // Subtask inline editing helpers
  const startEditingSubtaskTitle = (subtaskId: string, currentTitle: string) => {
    const subtask = task.subtasks?.find(st => st.id === subtaskId)
    setSubtaskEditingState(prev => ({
      ...prev,
      [subtaskId]: {
        isEditingTitle: true,
        draftTitle: currentTitle,
        isEditingDescription: false,
        draftDescription: prev[subtaskId]?.draftDescription || subtask?.description || ''
      }
    }))
  }

  const startEditingSubtaskDescription = (subtaskId: string, currentDescription: string) => {
    const subtask = task.subtasks?.find(st => st.id === subtaskId)
    setSubtaskEditingState(prev => ({
      ...prev,
      [subtaskId]: {
        isEditingDescription: true,
        draftDescription: currentDescription,
        isEditingTitle: false,
        draftTitle: prev[subtaskId]?.draftTitle || subtask?.title || ''
      }
    }))
  }

  const commitSubtaskTitle = (subtaskId: string) => {
    const state = subtaskEditingState[subtaskId]
    if (!state) return
    
    const trimmed = state.draftTitle.trim()
    setSubtaskEditingState(prev => ({
      ...prev,
      [subtaskId]: { ...prev[subtaskId], isEditingTitle: false }
    }))
    
    const subtask = task.subtasks?.find(st => st.id === subtaskId)
    if (!trimmed || trimmed === subtask?.title || !onTaskUpdate) {
      return
    }
    
    onTaskUpdate(subtaskId, { title: trimmed })
  }

  const commitSubtaskDescription = (subtaskId: string) => {
    const state = subtaskEditingState[subtaskId]
    if (!state) return
    
    const trimmed = state.draftDescription.trim()
    setSubtaskEditingState(prev => ({
      ...prev,
      [subtaskId]: { ...prev[subtaskId], isEditingDescription: false }
    }))
    
    const subtask = task.subtasks?.find(st => st.id === subtaskId)
    if ((trimmed === (subtask?.description || '')) || !onTaskUpdate) {
      return
    }
    
    onTaskUpdate(subtaskId, { description: trimmed || undefined })
  }

  const commitTitle = () => {
    const trimmed = draftTitle.trim()
    setIsEditingTitle(false)
    if (!trimmed || trimmed === task.title) {
      setDraftTitle(task.title || '')
      return
    }
    onTaskUpdate?.(task.id, { title: trimmed })
  }

  const commitDescription = () => {
    const trimmed = draftDescription.trim()
    setIsEditingDescription(false)
    if (trimmed === (task.description || '')) return
    onTaskUpdate?.(task.id, { description: trimmed || undefined })
  }

  const handleProjectChange = (projectId: string) => {
    if (projectId === 'none') {
      onTaskUpdate?.(task.id, { projectId: undefined, projectTitle: undefined })
      return
    }
    const title = availableProjects.find(p => p.id === projectId)?.title
    onTaskUpdate?.(task.id, { projectId, projectTitle: title })
  }

  const handleAssigneeToggle = (userId: string, isAssigned: boolean) => {
    if (!onTaskUpdate) return
    
    const currentAssignedTo = task.assignedTo || []
    const currentAssignedToNames = task.assignedToNames || []
    
    let newAssignedTo: string[]
    let newAssignedToNames: string[]
    
    if (isAssigned) {
      // Remove assignee
      newAssignedTo = currentAssignedTo.filter(id => id !== userId)
      const user = availableUsers.find(u => u.id === userId)
      newAssignedToNames = currentAssignedToNames.filter(name => name !== user?.name)
    } else {
      // Add assignee
      const user = availableUsers.find(u => u.id === userId)
      if (!user) return
      newAssignedTo = [...currentAssignedTo, userId]
      newAssignedToNames = [...currentAssignedToNames, user.name]
    }
    
    onTaskUpdate(task.id, {
      assignedTo: newAssignedTo,
      assignedToNames: newAssignedToNames
    })
  }

  const handleSubtaskAssigneeToggle = (subtaskId: string, userId: string, isAssigned: boolean) => {
    if (!onTaskUpdate) return
    
    const subtask = task.subtasks?.find(st => st.id === subtaskId)
    if (!subtask) return
    
    const currentAssignedTo = subtask.assignedTo || []
    const currentAssignedToNames = subtask.assignedToNames || []
    
    let newAssignedTo: string[]
    let newAssignedToNames: string[]
    
    if (isAssigned) {
      // Remove assignee
      newAssignedTo = currentAssignedTo.filter(id => id !== userId)
      const user = availableUsers.find(u => u.id === userId)
      newAssignedToNames = currentAssignedToNames.filter(name => name !== user?.name)
    } else {
      // Add assignee
      const user = availableUsers.find(u => u.id === userId)
      if (!user) return
      newAssignedTo = [...currentAssignedTo, userId]
      newAssignedToNames = [...currentAssignedToNames, user.name]
    }
    
    onTaskUpdate(subtaskId, {
      assignedTo: newAssignedTo,
      assignedToNames: newAssignedToNames
    })
  }

  const authorName = useMemo(() => {
    return userProfile?.fullName || userProfile?.name || userProfile?.email || 'You'
  }, [userProfile])

  const assigneeNames = useMemo(() => {
    const names = task.assignedToNames || []
    // Dedupe while preserving order (prevents accidental duplicates after updates)
    return Array.from(new Set(names.filter(Boolean)))
  }, [task.assignedToNames])

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  const addComment = () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    const now = new Date()
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      taskId: task.id,
      content: trimmed,
      authorId: userProfile?.id || 'local-user',
      authorName,
      authorTitle: userProfile?.title,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
    }
    onTaskUpdate?.(task.id, { comments: [...(task.comments || []), comment] as any })
    setNewComment('')
  }

  const startEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    setEditingCommentDraft(content)
  }

  const commitEditComment = () => {
    if (!editingCommentId) return
    const trimmed = editingCommentDraft.trim()
    const updated = (task.comments || []).map((c: any) => {
      if (c.id !== editingCommentId) return c
      return {
        ...c,
        content: trimmed,
        updatedAt: new Date(),
        isEdited: true,
      }
    })
    onTaskUpdate?.(task.id, { comments: updated as any })
    setEditingCommentId(null)
    setEditingCommentDraft('')
  }

  const deleteComment = (commentId: string) => {
    const updated = (task.comments || []).filter((c: any) => c.id !== commentId)
    onTaskUpdate?.(task.id, { comments: updated as any })
  }

  const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024 // 2MB (localStorage-friendly)

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

  const addAttachmentsFromFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)
    setIsUploadingFiles(true)

    try {
      const now = new Date()
      const existing = task.attachments || []
      const next: any[] = [...existing]

      for (const file of Array.from(files)) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          setUploadError(`"${file.name}" is too large. Max upload size is 2MB for now.`)
          continue
        }

        const dataUrl = await readFileAsDataUrl(file)
        next.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          taskId: task.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          fileUrl: dataUrl,
          uploadedBy: userProfile?.id || 'local-user',
          uploadedByName: authorName,
          createdAt: now,
        })
      }

      onTaskUpdate?.(task.id, { attachments: next as any })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const deleteAttachment = (attachmentId: string) => {
    const updated = (task.attachments || []).filter((a: any) => a.id !== attachmentId)
    onTaskUpdate?.(task.id, { attachments: updated as any })
  }

  return (
    <Card 
      data-testid="task-card"
      className={`transition-all duration-200 hover:shadow-md ${
        isDragging
          ? dragPreview
            ? 'opacity-95 shadow-lg rotate-0'
            : 'opacity-60 rotate-1'
          : ''
      } ${
        isOverdue
          ? 'border-[#EF4444]/20 bg-[#EF4444]/10 ring-1 ring-inset ring-[#EF4444]/25 dark:border-[#EF4444]/25 dark:bg-[#EF4444]/15 dark:ring-[#EF4444]/30'
          : isDueSoon
            ? 'border-[#FBBF24]/20 bg-[#FBBF24]/10 ring-1 ring-inset ring-[#FBBF24]/25 dark:border-[#FBBF24]/25 dark:bg-[#FBBF24]/15 dark:ring-[#FBBF24]/30'
            : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                autoFocus
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitTitle()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingTitle(false)
                    setDraftTitle(task.title || '')
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="h-8 px-2 text-sm font-semibold"
              />
            ) : (
              <button
                type="button"
                className="w-full text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditingTitle(true)
                }}
              >
                <h3 className="font-semibold text-sm text-foreground hover:underline underline-offset-2 break-words">
              {task.title}
            </h3>
              </button>
            )}

            {isEditingDescription ? (
              <Textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                autoFocus
                rows={2}
                onBlur={commitDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingDescription(false)
                    setDraftDescription(task.description || '')
                  } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    commitDescription()
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="mt-1 text-xs"
              />
            ) : (
              <button
                type="button"
                className="w-full text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditingDescription(true)
                }}
              >
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hover:text-foreground/80">
                  {task.description || 'Add description…'}
                </p>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {task.status === 'todo' && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange('in-progress')
                }}
              >
                Start
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid="task-menu">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Open details
                </DropdownMenuItem>
                {task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="delete-task"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Priority + Status */}
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 rounded-full hover:bg-muted/60 hover:text-foreground"
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
              <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#5EEAD4] ring-1 ring-black/10 dark:ring-white/15" />
                Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#FBBF24] ring-1 ring-black/10 dark:ring-white/15" />
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#F97316] ring-1 ring-black/10 dark:ring-white/15" />
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('urgent')}>
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#EF4444] ring-1 ring-black/10 dark:ring-white/15" />
                Urgent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 rounded-full hover:bg-muted/60 hover:text-foreground ${getStatusColor(task.status)}`}
              >
                <div className="flex items-center space-x-1">
                  {getStatusIcon(task.status)}
                  <span className="text-xs font-medium capitalize">
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className="sr-only">{task.status}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                To do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                In progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('review')}>
                Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Due + Project */}
        <div className="flex items-start justify-between gap-2">
        <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
                className="w-auto min-h-7 h-auto items-start justify-start px-2 py-1 text-xs font-normal rounded-full hover:bg-muted/60 hover:text-foreground"
            >
                <div className="flex items-start gap-1.5 min-w-0">
                <CalendarIcon className="mt-[2px] h-3 w-3 text-muted-foreground" />
                {task.dueDate ? (
                  <span
                      className={`leading-[1.2] ${
                      isOverdue
                        ? 'text-destructive font-medium'
                        : isDueSoon
                        ? 'text-[#FBBF24] font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-muted-foreground leading-[1.2]">No due date</span>
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
                onTaskUpdate?.(task.id, { dueDate: date })
                setIsDueDateOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

          <div className="min-w-0 flex-1 flex justify-end">
            <div className="inline-flex max-w-[210px]" onMouseDown={(e) => e.stopPropagation()}>
              <Select value={task.projectId || 'none'} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-auto min-h-7 h-auto items-start justify-start gap-1.5 px-2 py-1 text-left text-xs font-normal rounded-full border-0 bg-transparent shadow-none hover:bg-muted/60 hover:text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <Folder className="mt-[2px] h-3 w-3 shrink-0 text-muted-foreground" />
                    <span
                      className={cn(
                        'min-w-0 flex-1 whitespace-normal break-words leading-[1.2] text-left',
                        task.projectId ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {task.projectTitle || 'No project'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="none">No project</SelectItem>
                  {availableProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} done` : 'Progress'}
            </span>
            <span className="font-medium text-foreground/80">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-1.5" indicatorClassName="bg-primary" />
        </div>

        {/* Bottom row: meta + assignees */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Popover open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.comments?.length || 0}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[320px] p-3">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comments</div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(task.comments || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground">No comments yet.</div>
                    ) : (
                      (task.comments || []).map((c: any) => (
                        <div key={c.id} className="rounded-md border border-border p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground/90">
                                {c.authorName || 'Someone'}
                                {c.isEdited ? (
                                  <span className="ml-1 text-[10px] text-muted-foreground">(edited)</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px]"
                                onClick={() => startEditComment(c.id, c.content)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                                onClick={() => deleteComment(c.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {editingCommentId === c.id ? (
                            <Textarea
                              value={editingCommentDraft}
                              onChange={(e) => setEditingCommentDraft(e.target.value)}
                              className="mt-2 text-xs"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  e.preventDefault()
                                  commitEditComment()
                                } else if (e.key === 'Escape') {
                                  e.preventDefault()
                                  setEditingCommentId(null)
                                  setEditingCommentDraft('')
                                }
                              }}
                            />
                          ) : (
                            <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                              {c.content}
          </div>
        )}

                          {editingCommentId === c.id && (
                            <div className="mt-2 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditingCommentDraft('')
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={commitEditComment}
                              >
                                Save
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Add a comment</Label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="text-xs"
                      placeholder="Write a comment…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          addComment()
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <Button type="button" size="sm" className="h-7 px-2 text-[11px]" onClick={addComment}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={isAttachmentsOpen} onOpenChange={setIsAttachmentsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachments?.length || 0}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[320px] p-3">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Attachments</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(task.attachments || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground">No attachments yet.</div>
                    ) : (
                      (task.attachments || []).map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {typeof a.fileType === 'string' && a.fileType.startsWith('image/') && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.fileUrl}
                                alt={a.fileName || 'attachment'}
                                className="h-8 w-8 rounded object-cover border border-border"
                              />
                            )}
                            <a
                              href={a.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="min-w-0 text-xs text-primary hover:underline truncate"
                              title={a.fileName}
                              download={a.fileName}
                            >
                              {a.fileName || 'Attachment'}
                            </a>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                            onClick={() => deleteAttachment(a.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Upload files</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => addAttachmentsFromFiles(e.target.files)}
                      className="h-9 text-xs"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        Max 2MB per file (local dev storage)
                      </div>
                      {isUploadingFiles && (
                        <div className="text-[11px] text-muted-foreground">Uploading…</div>
                      )}
                    </div>
                    {uploadError && (
                      <div className="text-[11px] text-destructive">{uploadError}</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <span className="hidden sm:inline">
              {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
            </span>
          </div>

          <Popover open={isAssigneesOpen} onOpenChange={setIsAssigneesOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex -space-x-1 hover:opacity-80 transition-opacity"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {assigneeNames.length > 0 ? (
                  <>
                    {assigneeNames.slice(0, 3).map((name, index) => (
                      <Avatar key={index} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className="text-[10px] font-semibold">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assigneeNames.length > 3 && (
                      <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{assigneeNames.length - 3}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-muted/80">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2" onMouseDown={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Assignees</div>
                {availableUsers.length === 0 ? (
                  <div className="px-2 py-1 text-xs text-muted-foreground">No users available</div>
                ) : (
                  availableUsers.map((user) => {
                    const isAssigned = task.assignedTo?.includes(user.id) || false
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleAssigneeToggle(user.id, isAssigned)}
                      >
                        <Checkbox checked={isAssigned} />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{user.name}</div>
                            {user.email && (
                              <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Subtasks Section */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onToggleSubtasks?.(task.id)}
                >
                  {showSubtasks ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-[#22C55E]">
                    {task.subtasks.filter(st => st.status === 'completed').length} completed
                  </span>
                </div>
              </div>
            </div>
            
            {showSubtasks && (
              <div className="space-y-2 ml-4">
                {task.subtasks.map((subtask) => {
                  const isCompleted = subtask.status === 'completed'
                  const editingState = subtaskEditingState[subtask.id] || {
                    isEditingTitle: false,
                    isEditingDescription: false,
                    draftTitle: subtask.title || '',
                    draftDescription: subtask.description || ''
                  }
                  
                  const handleToggleComplete = () => {
                    if (onTaskUpdate) {
                      const newStatus: TaskStatus = isCompleted ? 'todo' : 'completed'
                      onTaskUpdate(subtask.id, {
                        status: newStatus,
                        completedAt: newStatus === 'completed' ? new Date() : undefined
                      })
                    }
                  }

                  return (
                    <div key={subtask.id} className="p-2 bg-muted/50 rounded text-xs">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={handleToggleComplete}
                          className="mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {editingState.isEditingTitle ? (
                              <Input
                                value={editingState.draftTitle}
                                onChange={(e) => setSubtaskEditingState(prev => ({
                                  ...prev,
                                  [subtask.id]: { ...prev[subtask.id], draftTitle: e.target.value }
                                }))}
                                autoFocus
                                onBlur={() => commitSubtaskTitle(subtask.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    commitSubtaskTitle(subtask.id)
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setSubtaskEditingState(prev => ({
                                      ...prev,
                                      [subtask.id]: { ...prev[subtask.id], isEditingTitle: false, draftTitle: subtask.title || '' }
                                    }))
                                  }
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="h-6 px-2 text-xs font-medium"
                              />
                            ) : (
                              <button
                                type="button"
                                className="text-left"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditingSubtaskTitle(subtask.id, subtask.title || '')
                                }}
                              >
                                <span className={cn(
                                  "font-medium break-words hover:underline underline-offset-2",
                                  isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {subtask.title || 'Untitled subtask'}
                                </span>
                              </button>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(subtask.priority)}`}
                            >
                              {subtask.priority}
                            </Badge>
                            {subtask.estimatedHours && subtask.estimatedHours > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{subtask.estimatedHours}h</span>
                              </span>
                            )}
                          </div>
                          {editingState.isEditingDescription ? (
                            <Textarea
                              value={editingState.draftDescription}
                              onChange={(e) => setSubtaskEditingState(prev => ({
                                ...prev,
                                [subtask.id]: { ...prev[subtask.id], draftDescription: e.target.value }
                              }))}
                              autoFocus
                              rows={2}
                              onBlur={() => commitSubtaskDescription(subtask.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.preventDefault()
                                  setSubtaskEditingState(prev => ({
                                    ...prev,
                                    [subtask.id]: { ...prev[subtask.id], isEditingDescription: false, draftDescription: subtask.description || '' }
                                  }))
                                } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  e.preventDefault()
                                  commitSubtaskDescription(subtask.id)
                                }
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="mt-1 text-xs"
                              placeholder="Add description..."
                            />
                          ) : (
                            <button
                              type="button"
                              className="text-left w-full mt-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingSubtaskDescription(subtask.id, subtask.description || '')
                              }}
                            >
                              {subtask.description ? (
                                <p className="text-xs text-muted-foreground break-words hover:text-foreground/80">
                                  {subtask.description}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  Add description…
                                </p>
                              )}
                            </button>
                          )}
                          {subtask.dueDate && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{formatDistanceToNow(subtask.dueDate, { addSuffix: true })}</span>
                            </div>
                          )}
                          {/* Subtask Assignees */}
                          {(subtask.assignedToNames?.length > 0 || availableUsers.length > 0) && (
                            <Popover 
                              open={subtaskAssigneesOpen === subtask.id} 
                              onOpenChange={(open) => setSubtaskAssigneesOpen(open ? subtask.id : null)}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="flex -space-x-1 mt-1.5 hover:opacity-80 transition-opacity"
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  {subtask.assignedToNames && subtask.assignedToNames.length > 0 ? (
                                    <>
                                      {subtask.assignedToNames.slice(0, 2).map((name, index) => (
                                        <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                          <AvatarFallback className="text-[9px] font-semibold">
                                            {getInitials(name)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {subtask.assignedToNames.length > 2 && (
                                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                          <span className="text-[9px] text-muted-foreground">
                                            +{subtask.assignedToNames.length - 2}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-muted/80">
                                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                                    </div>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-56 p-2" onMouseDown={(e) => e.stopPropagation()}>
                                <div className="space-y-1">
                                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Assignees</div>
                                  {availableUsers.length === 0 ? (
                                    <div className="px-2 py-1 text-xs text-muted-foreground">No users available</div>
                                  ) : (
                                    availableUsers.map((user) => {
                                      const isAssigned = subtask.assignedTo?.includes(user.id) || false
                                      return (
                                        <div
                                          key={user.id}
                                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                                          onClick={() => handleSubtaskAssigneeToggle(subtask.id, user.id, isAssigned)}
                                        >
                                          <Checkbox checked={isAssigned} />
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Avatar className="h-5 w-5">
                                              <AvatarFallback className="text-[10px]">
                                                {getInitials(user.name)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-xs font-medium truncate">{user.name}</div>
                                              {user.email && (
                                                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskEdit?.(subtask)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Subtask Button */}
        <div className="pt-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
            onClick={() => onCreateSubtask?.(task)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Subtask
          </Button>
        </div>
      </CardContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="confirm-delete"
              variant="destructive"
              onClick={() => {
                onTaskDelete?.(task.id)
                setDeleteDialogOpen(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
