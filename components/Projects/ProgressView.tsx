/**
 * ProgressView Component
 * Visual progress tracking with charts and activity log
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Activity,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { Project, Activity as ActivityType } from '@/types'

interface ProgressViewProps {
  projects: Project[]
}

// Mock activity data
const mockActivities: ActivityType[] = [
  {
    id: '1',
    organizationId: 'org-1',
    type: 'project_update',
    title: 'Project milestone completed',
    description: 'E-commerce Website Redesign reached 65% completion',
    userId: 'user-1',
    userName: 'John Doe',
    userTitle: 'Senior Developer',
    projectId: '1',
    timestamp: new Date('2024-01-25T10:30:00'),
    metadata: { progress: 65 }
  },
  {
    id: '2',
    organizationId: 'org-1',
    type: 'task_completed',
    title: 'Task completed',
    description: 'Homepage design mockups finalized',
    userId: 'user-2',
    userName: 'Jane Smith',
    userTitle: 'UI/UX Designer',
    projectId: '1',
    timestamp: new Date('2024-01-25T09:15:00'),
    metadata: { taskName: 'Homepage Design' }
  },
  {
    id: '3',
    organizationId: 'org-1',
    type: 'client_feedback',
    title: 'Client feedback received',
    description: 'Positive feedback on PPC campaign performance',
    userId: 'user-3',
    userName: 'Mike Johnson',
    userTitle: 'Marketing Specialist',
    projectId: '2',
    timestamp: new Date('2024-01-24T16:45:00'),
    metadata: { rating: 5 }
  },
  {
    id: '4',
    organizationId: 'org-1',
    type: 'deadline_reminder',
    title: 'Deadline reminder',
    description: 'Mobile App Development deadline approaching',
    userId: 'user-1',
    userName: 'John Doe',
    userTitle: 'Senior Developer',
    projectId: '3',
    timestamp: new Date('2024-01-24T14:20:00'),
    metadata: { daysUntilDeadline: 5 }
  }
]

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

// Chart colors using CSS custom properties
const chartColors = {
  primary: 'oklch(var(--chart-1))',
  secondary: 'oklch(var(--chart-2))',
  success: 'oklch(var(--chart-3))',
  warning: 'oklch(var(--chart-4))',
  danger: 'oklch(var(--chart-5))',
  info: 'oklch(var(--primary))'
}

/**
 * Format date for display
 */
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Get activity icon based on type
 */
const getActivityIcon = (type: ActivityType['type']) => {
  switch (type) {
    case 'project_update':
      return <TrendingUp className="h-4 w-4 text-primary" />
    case 'task_completed':
      return <BarChart3 className="h-4 w-4 text-green-600" />
    case 'client_feedback':
      return <MessageSquare className="h-4 w-4 text-purple-600" />
    case 'deadline_reminder':
      return <Clock className="h-4 w-4 text-orange-600" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

/**
 * ProgressView component
 * Visual progress tracking with charts and activity log
 */
export default function ProgressView({ projects }: ProgressViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [selectedChart, setSelectedChart] = useState('progress')

  // Prepare chart data
  const progressData = {
    labels: projects.map(project => project.title),
    datasets: [
      {
        label: 'Progress (%)',
        data: projects.map(project => project.progress),
        backgroundColor: 'oklch(var(--primary))',
        borderColor: 'oklch(var(--primary))',
        borderWidth: 1
      }
    ]
  }

  const statusData = {
    labels: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'],
    datasets: [
      {
        data: [
          projects.filter(p => p.status === 'planning').length,
          projects.filter(p => p.status === 'in-progress').length,
          projects.filter(p => p.status === 'review').length,
          projects.filter(p => p.status === 'completed').length,
          projects.filter(p => p.status === 'on-hold').length
        ],
        backgroundColor: [
          'oklch(var(--chart-1))',
          'oklch(var(--chart-2))',
          'oklch(var(--chart-3))',
          'oklch(var(--chart-4))',
          'oklch(var(--chart-5))'
        ],
        borderWidth: 1
      }
    ]
  }

  const typeData = {
    labels: ['One-time', 'Ongoing'],
    datasets: [
      {
        data: [
          projects.filter(p => p.type === 'one-time').length,
          projects.filter(p => p.type === 'ongoing').length
        ],
        backgroundColor: ['oklch(var(--chart-1))', 'oklch(var(--chart-2))'],
        borderWidth: 1
      }
    ]
  }

  const timelineData = {
    labels: projects.map(project => project.title),
    datasets: [
      {
        label: 'Progress (%)',
        data: projects.map(project => project.progress),
        borderColor: 'oklch(var(--primary))',
        backgroundColor: 'oklch(var(--primary) / 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Calculate statistics
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'in-progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
              </div>
                             <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
              </div>
                             <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedProjects}</p>
              </div>
                             <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-foreground">{averageProgress}%</p>
              </div>
                             <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Project Analytics
              </h3>
              <p className="text-muted-foreground">
                Visual insights into project progress and performance
              </p>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedChart} onValueChange={setSelectedChart}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress Overview</SelectItem>
                  <SelectItem value="status">Status Distribution</SelectItem>
                  <SelectItem value="type">Project Types</SelectItem>
                  <SelectItem value="timeline">Timeline View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {selectedChart === 'progress' && 'Project Progress Overview'}
              {selectedChart === 'status' && 'Project Status Distribution'}
              {selectedChart === 'type' && 'Project Types'}
              {selectedChart === 'timeline' && 'Project Timeline'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {selectedChart === 'progress' && (
                <Bar 
                  data={progressData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              )}

              {selectedChart === 'status' && (
                <Pie 
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              )}

              {selectedChart === 'type' && (
                <Pie 
                  data={typeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              )}

              {selectedChart === 'timeline' && (
                <Line 
                  data={timelineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                                     <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                                                 <p className="text-sm font-medium text-foreground">
                           {activity.title}
                         </p>
                         <span className="text-xs text-muted-foreground">
                           {formatDate(activity.timestamp)}
                         </span>
                      </div>
                                               <p className="text-sm text-muted-foreground mt-1">
                           {activity.description}
                         </p>
                         <div className="flex items-center gap-2 mt-2">
                           <span className="text-xs text-muted-foreground">
                             {activity.userName}
                           </span>
                           {activity.userTitle && (
                             <>
                               <span className="text-xs text-muted-foreground/60">•</span>
                               <span className="text-xs text-muted-foreground">
                                 {activity.userTitle}
                               </span>
                             </>
                           )}
                         </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Cards */}
      <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-foreground">
           Individual Project Progress
         </h3>
        
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                                       <h4 className="font-semibold text-foreground">
                     {project.title}
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     {project.description}
                   </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {project.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                                     <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">Progress</span>
                     <span className="font-medium">{project.progress}%</span>
                   </div>
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />

                                     <div className="flex items-center justify-between text-sm text-muted-foreground">
                     <div className="flex items-center gap-1">
                       <Calendar className="h-4 w-4" />
                       <span>
                         {formatDate(project.startDate)}
                         {project.endDate && ` - ${formatDate(project.endDate)}`}
                       </span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Users className="h-4 w-4" />
                       <span>{project.assignedTo.length} members</span>
                     </div>
                   </div>

                                     {project.budget && (
                     <div className="text-sm text-muted-foreground">
                       Budget: <span className="font-medium">${project.budget.toLocaleString()}</span>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
