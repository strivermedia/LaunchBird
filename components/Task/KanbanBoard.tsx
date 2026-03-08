'use client'

import React from 'react'
import * as ReactDnD from 'react-dnd'
const { DndProvider, useDrag, useDrop, useDragLayer } = ReactDnD as any
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus,
} from 'lucide-react'
// (Column actions menu removed; + button is the single action)
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from '@/types'
import type { UserProfile } from '@/lib/auth'
import { getTaskStageTheme } from '@/lib/status-utils'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateTask?: (status?: TaskStatus) => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: UserProfile | null
  availableProjects?: Array<{ id: string; title: string }>
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
}

interface TaskItemProps {
  task: Task
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: UserProfile | null
  availableProjects?: Array<{ id: string; title: string }>
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
}

interface ColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateTask?: (status?: TaskStatus) => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: UserProfile | null
  availableProjects?: Array<{ id: string; title: string }>
  availableUsers?: Array<{ id: string; name: string; email?: string }>
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
  accent: string
  hoverBg: string
}

const DragOverlay: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor: any) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
  }))

  if (!isDragging || !item || !currentOffset) return null

  const task = tasks.find(t => t.id === item.id)
  if (!task) return null

  const { x, y } = currentOffset

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        style={{
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        <div className="w-[320px]">
          <TaskCard task={task} isDragging dragPreview />
        </div>
      </div>
    </div>
  )
}

/**
 * Draggable Task Item Component
 */
const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit,
  onCreateSubtask,
  userProfile,
  availableProjects,
  availableUsers,
  showSubtasks,
  onToggleSubtasks
}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Disable the browser's default HTML5 drag preview to avoid "ghost" duplicates.
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div ref={drag} className={isDragging ? 'opacity-60' : ''}>
      <TaskCard
        task={task}
        onTaskUpdate={onTaskUpdate}
        onTaskDelete={onTaskDelete}
        onTaskEdit={onTaskEdit}
        onCreateSubtask={onCreateSubtask}
        userProfile={userProfile}
        availableProjects={availableProjects}
        availableUsers={availableUsers}
        isDragging={isDragging}
        showSubtasks={showSubtasks?.has(task.id) || false}
        onToggleSubtasks={onToggleSubtasks}
      />
    </div>
  )
}

/**
 * Kanban Column Component
 */
const Column: React.FC<ColumnProps> = ({
  status,
  title,
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateTask,
  onCreateSubtask,
  userProfile,
  availableProjects,
  availableUsers,
  showSubtasks,
  onToggleSubtasks,
  accent,
  hoverBg
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        onTaskUpdate(item.id, { status })
      }
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div 
      ref={drop}
      className={`flex-1 min-w-0 ${isOver ? hoverBg : ''}`}
    >
      <Card className="h-full overflow-hidden">
        {/* Stage accent bar */}
        <div className={`h-1.5 w-full ${accent}`} />

        <CardHeader className="pb-3 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
                <Badge
                  variant="secondary"
                  className="h-5 rounded-full px-2 text-[11px] font-medium"
                >
                  {tasks.length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={`Add task to ${title}`}
                onClick={() => onCreateTask?.(status)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3 min-h-[400px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-base text-muted-foreground">
                  No tasks
                </p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="mt-2 text-sm"
                  onClick={() => onCreateTask?.(status)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onTaskEdit={onTaskEdit}
                  onCreateSubtask={onCreateSubtask}
                  userProfile={userProfile}
                  availableProjects={availableProjects}
                  availableUsers={availableUsers}
                  showSubtasks={showSubtasks}
                  onToggleSubtasks={onToggleSubtasks}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Kanban Board Component
 * Provides drag-and-drop task management with status columns
 */
const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateTask,
  onCreateSubtask,
  userProfile,
  availableProjects,
  availableUsers,
  showSubtasks,
  onToggleSubtasks
}) => {
  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    review: tasks.filter(task => task.status === 'review'),
    completed: tasks.filter(task => task.status === 'completed'),
  }

  const todoTheme = getTaskStageTheme('todo')
  const inProgressTheme = getTaskStageTheme('in-progress')
  const reviewTheme = getTaskStageTheme('review')
  const completedTheme = getTaskStageTheme('completed')

  const columns = [
    {
      status: 'todo' as TaskStatus,
      title: 'To Do',
      accent: todoTheme.accent,
      hoverBg: todoTheme.columnHover,
    },
    {
      status: 'in-progress' as TaskStatus,
      title: 'In Progress',
      accent: inProgressTheme.accent,
      hoverBg: inProgressTheme.columnHover,
    },
    {
      status: 'review' as TaskStatus,
      title: 'Review',
      accent: reviewTheme.accent,
      hoverBg: reviewTheme.columnHover,
    },
    {
      status: 'completed' as TaskStatus,
      title: 'Completed',
      accent: completedTheme.accent,
      hoverBg: completedTheme.columnHover,
    },
  ]

  return (
    <DndProvider backend={HTML5Backend}>
      <DragOverlay tasks={tasks} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasksByStatus[column.status]}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
            onCreateTask={onCreateTask}
            onCreateSubtask={onCreateSubtask}
            userProfile={userProfile}
            availableProjects={availableProjects}
            availableUsers={availableUsers}
            showSubtasks={showSubtasks}
            onToggleSubtasks={onToggleSubtasks}
            accent={column.accent}
            hoverBg={column.hoverBg}
          />
        ))}
      </div>
    </DndProvider>
  )
}

export default KanbanBoard
