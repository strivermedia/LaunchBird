'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  User, 
  Paperclip, 
  MessageSquare, 
  AlertCircle,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface TaskCardProps {
  task: Task
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: any
  isDragging?: boolean
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
  isDragging = false,
  showSubtasks = false,
  onToggleSubtasks
}: TaskCardProps) {
  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed'
  const isDueSoon = task.dueDate && 
    new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && 
    task.status !== 'completed'

  // Priority color mapping
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  // Status color mapping
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400'
      case 'review':
        return 'text-purple-600 dark:text-purple-400'
      case 'todo':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Status icon mapping
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
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

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${
        isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-950' : 
        isDueSoon ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
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
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Priority and Status */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getPriorityColor(task.priority)}`}
          >
            {task.priority.toUpperCase()}
          </Badge>
          
          <div className={`flex items-center space-x-1 ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="text-xs font-medium capitalize">
              {task.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-2 text-xs">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={`${
              isOverdue ? 'text-red-600 dark:text-red-400 font-medium' :
              isDueSoon ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
              'text-muted-foreground'
            }`}>
              {isOverdue ? 'Overdue' : 
               isDueSoon ? 'Due soon' : 
               'Due'} {formatDistanceToNow(task.dueDate, { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Project */}
        {task.projectTitle && (
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-muted-foreground truncate">
              {task.projectTitle}
            </span>
          </div>
        )}

        {/* Assignees */}
        {task.assignedToNames && task.assignedToNames.length > 0 && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <div className="flex -space-x-1">
              {task.assignedToNames.slice(0, 3).map((name, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedToNames.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{task.assignedToNames.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Comments and Attachments */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
          
          <span>
            {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
          </span>
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
                  <span className="text-xs text-green-600">
                    {task.subtasks.filter(st => st.status === 'completed').length} completed
                  </span>
                </div>
              </div>
            </div>
            
            {showSubtasks && (
              <div className="space-y-2 ml-4">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 ${
                        subtask.status === 'completed' ? 'text-green-600' : 
                        subtask.status === 'in-progress' ? 'text-blue-600' : 
                        'text-gray-600'
                      }`}>
                        {getStatusIcon(subtask.status)}
                        <span className="font-medium">{subtask.title}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(subtask.priority)}`}
                      >
                        {subtask.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {subtask.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(subtask.dueDate, { addSuffix: true })}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => onTaskEdit?.(subtask)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Subtask Button */}
        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => onCreateSubtask?.(task)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Subtask
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
