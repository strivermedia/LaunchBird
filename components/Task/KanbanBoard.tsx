'use client'

import React, { useState } from 'react'
import * as ReactDnD from 'react-dnd'
const { DndProvider, useDrag, useDrop } = ReactDnD as any
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle, Clock, CheckCircle2, Circle } from 'lucide-react'
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from '@/types'
import type { UserProfile } from '@/lib/auth'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateTask?: () => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: UserProfile | null
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
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
}

interface ColumnProps {
  status: TaskStatus
  title: string
  description: string
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onCreateTask?: () => void
  onCreateSubtask?: (parentTask: Task) => void
  userProfile?: UserProfile | null
  showSubtasks?: Set<string>
  onToggleSubtasks?: (taskId: string) => void
  icon: React.ReactNode
  color: string
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
  showSubtasks,
  onToggleSubtasks
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div ref={drag} className={isDragging ? 'opacity-50' : ''}>
      <TaskCard
        task={task}
        onTaskUpdate={onTaskUpdate}
        onTaskDelete={onTaskDelete}
        onTaskEdit={onTaskEdit}
        onCreateSubtask={onCreateSubtask}
        userProfile={userProfile}
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
  description,
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onCreateTask,
  onCreateSubtask,
  userProfile,
  showSubtasks,
  onToggleSubtasks,
  icon,
  color
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
      className={`flex-1 min-w-0 ${isOver ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${color}`}>
                {icon}
              </div>
              <div>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3 min-h-[400px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="text-muted-foreground mb-2">
                  {icon}
                </div>
                <p className="text-sm text-muted-foreground">
                  No tasks in {title.toLowerCase()}
                </p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="mt-2 text-xs"
                  onClick={() => onCreateTask?.()}
                >
                  <Plus className="h-3 w-3 mr-1" />
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
  showSubtasks,
  onToggleSubtasks
}) => {
  const [showCreateTask, setShowCreateTask] = useState(false)

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    review: tasks.filter(task => task.status === 'review'),
    completed: tasks.filter(task => task.status === 'completed'),
  }

  const columns = [
    {
      status: 'todo' as TaskStatus,
      title: 'To Do',
      description: 'Tasks that need to be started',
      icon: <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
      color: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      status: 'in-progress' as TaskStatus,
      title: 'In Progress',
      description: 'Tasks currently being worked on',
      icon: <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      status: 'review' as TaskStatus,
      title: 'Review',
      description: 'Tasks ready for review',
      icon: <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      status: 'completed' as TaskStatus,
      title: 'Completed',
      description: 'Finished tasks',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
      color: 'bg-green-100 dark:bg-green-900/20',
    },
  ]

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <Column
            key={column.status}
            status={column.status}
            title={column.title}
            description={column.description}
            tasks={tasksByStatus[column.status]}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
            onCreateTask={onCreateTask}
            onCreateSubtask={onCreateSubtask}
            userProfile={userProfile}
            showSubtasks={showSubtasks}
            onToggleSubtasks={onToggleSubtasks}
            icon={column.icon}
            color={column.color}
          />
        ))}
      </div>
    </DndProvider>
  )
}

export default KanbanBoard
