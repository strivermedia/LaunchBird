'use client'

import React, { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Clock,
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
  GripVertical
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

// Sortable Task Row Component
interface SortableTaskRowProps {
  task: Task
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
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
  userProfile,
  showSubtasks,
  onToggleSubtasks,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
  isOverdue,
  isDueSoon,
}) => {
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

  return (
    <React.Fragment>
      <TableRow 
        ref={setNodeRef} 
        style={style}
        className={`hover:bg-muted/50 ${isDragging ? 'opacity-50' : ''}`}
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
            {getStatusIcon(task.status)}
          </div>
        </TableCell>
        
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium text-sm">{task.title}</div>
            {task.description && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {task.description}
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getPriorityColor(task.priority)}`}
          >
            {task.priority.toUpperCase()}
          </Badge>
        </TableCell>
        
        <TableCell>
          <div className={`flex items-center space-x-2 ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="text-sm font-medium capitalize">
              {task.status.replace('-', ' ')}
            </span>
          </div>
        </TableCell>
        
        <TableCell>
          {task.dueDate ? (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className={`${
                isOverdue(task) ? 'text-red-600 dark:text-red-400 font-medium' :
                isDueSoon(task) ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
                'text-foreground'
              }`}>
                {isOverdue(task) ? 'Overdue' : 
                 isDueSoon(task) ? 'Due soon' : 
                 formatDistanceToNow(task.dueDate, { addSuffix: true })}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No due date</span>
          )}
        </TableCell>
        
        <TableCell>
          {task.assignedToNames && task.assignedToNames.length > 0 ? (
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
          ) : (
            <span className="text-muted-foreground text-sm">Unassigned</span>
          )}
        </TableCell>
        
        <TableCell>
          {task.subtasks && task.subtasks.length > 0 ? (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onToggleSubtasks?.(task.id)}
              >
                {showSubtasks?.has(task.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
              <span className="text-sm font-medium">
                {task.subtasks.length}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-green-600">
                  ({task.subtasks.filter(st => st.status === 'completed').length} completed)
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onCreateSubtask?.(task)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-sm">None</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onCreateSubtask?.(task)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </TableCell>
        
        <TableCell>
          {task.projectTitle ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-foreground truncate max-w-24">
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

      {/* Subtask Rows */}
      {showSubtasks?.has(task.id) && task.subtasks && task.subtasks.length > 0 && (
        <>
          {task.subtasks.map((subtask) => (
            <TableRow key={subtask.id} className="hover:bg-muted/30 bg-muted/20">
              <TableCell>
                <div className="flex items-center pl-6">
                  <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-sm mr-2"></div>
                  {getStatusIcon(subtask.status)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1 pl-6">
                  <div className="font-medium text-sm text-muted-foreground">{subtask.title}</div>
                  {subtask.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {subtask.description}
                    </div>
                  )}
                  {subtask.tags && subtask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {subtask.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {subtask.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{subtask.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getPriorityColor(subtask.priority)}`}
                >
                  {subtask.priority.toUpperCase()}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className={`flex items-center space-x-2 ${getStatusColor(subtask.status)}`}>
                  {getStatusIcon(subtask.status)}
                  <span className="text-sm font-medium capitalize">
                    {subtask.status.replace('-', ' ')}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {subtask.dueDate ? (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className={`${
                      isOverdue(subtask) ? 'text-red-600 dark:text-red-400 font-medium' :
                      isDueSoon(subtask) ? 'text-yellow-600 dark:text-yellow-400 font-medium' :
                      'text-foreground'
                    }`}>
                      {isOverdue(subtask) ? 'Overdue' : 
                       isDueSoon(subtask) ? 'Due soon' : 
                       formatDistanceToNow(subtask.dueDate, { addSuffix: true })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No due date</span>
                )}
              </TableCell>
              
              <TableCell>
                {subtask.assignedToNames && subtask.assignedToNames.length > 0 ? (
                  <div className="flex -space-x-1">
                    {subtask.assignedToNames.slice(0, 3).map((name, index) => (
                      <Avatar key={index} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {subtask.assignedToNames.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
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
                <span className="text-muted-foreground text-sm">—</span>
              </TableCell>
              
              <TableCell>
                {subtask.projectTitle ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-foreground truncate max-w-24">
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
  onReorder?: (reorderedTasks: Task[]) => void
  userProfile?: UserProfile | null
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
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
  onToggleSubtasks
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
          <Button 
            size="sm"
            onClick={() => onTaskEdit?.({} as Task)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>
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
                <TableHead>
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
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('dueDate')}
                    className="h-8 px-2 lg:px-3"
                  >
                    Due Date
                    {getSortIcon('dueDate')}
                  </Button>
                </TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Subtasks</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Actions</TableHead>
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
            <Button onClick={() => onTaskEdit?.({} as Task)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
