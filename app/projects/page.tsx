/**
 * Projects Page
 * Main projects management interface with list, creation wizard, and progress tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Search, Calendar, Users, Folder, BarChart3, TrendingUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/useAuth'
import { Project, ProjectType, ProjectStatus } from '@/types'
import ProjectList from '@/components/Projects/ProjectList'
import ProjectWizard from '@/components/Projects/ProjectWizard'
import ProgressView from '@/components/Projects/ProgressView'

/**
 * Projects page component
 * Displays project list, creation wizard, and progress tracking
 */
export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showWizard, setShowWizard] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'progress'>('list')

  // Mock data for development
  const mockProjects: Project[] = [
    {
      id: '1',
      organizationId: 'org-1',
      title: 'E-commerce Website Redesign',
      description: 'Complete redesign of client e-commerce platform with modern UI/UX',
      type: 'one-time',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      deadline: new Date('2024-03-15'),
      assignedTo: ['user-1', 'user-2'],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25'),
      clientId: 'client-1',
      budget: 15000,
      budgetSpent: 9750, // 65% of budget
      tags: ['web-design', 'e-commerce'],
      clientCode: 'AB12',
      assignedManagerId: 'user-1',
      assignedManagerName: 'John Doe',
      assignedManagerTitle: 'Senior Developer',
      assignedManagerEmail: 'john@launchbird.com',
      assignedManagerPhone: '+1-555-0123'
    },
    {
      id: '2',
      organizationId: 'org-1',
      title: 'PPC Campaign Management',
      description: 'Ongoing PPC campaign management and optimization',
      type: 'ongoing',
      status: 'in-progress',
      progress: 85,
      startDate: new Date('2024-01-01'),
      assignedTo: ['user-3'],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-25'),
      clientId: 'client-2',
      budget: 5000,
      budgetSpent: 4250, // 85% of budget
      tags: ['ppc', 'marketing'],
      clientCode: 'CD34',
      assignedManagerId: 'user-3',
      assignedManagerName: 'Jane Smith',
      assignedManagerTitle: 'Marketing Specialist',
      assignedManagerEmail: 'jane@launchbird.com',
      assignedManagerPhone: '+1-555-0456'
    },
    {
      id: '3',
      organizationId: 'org-1',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application for iOS and Android',
      type: 'one-time',
      status: 'planning',
      progress: 25,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-01'),
      deadline: new Date('2024-06-01'),
      assignedTo: ['user-1', 'user-4'],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25'),
      clientId: 'client-3',
      budget: 25000,
      budgetSpent: 6250, // 25% of budget
      tags: ['mobile', 'app-development'],
      clientCode: 'EF56',
      assignedManagerId: 'user-1',
      assignedManagerName: 'John Doe',
      assignedManagerTitle: 'Senior Developer',
      assignedManagerEmail: 'john@launchbird.com',
      assignedManagerPhone: '+1-555-0123'
    }
  ]

  // Mock client data for development
  const mockClients = {
    'client-1': { id: 'client-1', name: 'Acme Corporation', company: 'Acme Corp' },
    'client-2': { id: 'client-2', name: 'TechStart Inc', company: 'TechStart' },
    'client-3': { id: 'client-3', name: 'Global Solutions', company: 'Global Solutions LLC' }
  }

  useEffect(() => {
    // Simulate API call
    const loadProjects = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProjects(mockProjects)
      setLoading(false)
    }

    loadProjects()
  }, [])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesType = typeFilter === 'all' || project.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const canCreateProject = user?.role === 'admin' || user?.role === 'team_member'

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and track your projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'progress' : 'list')}
            className="hidden sm:flex"
          >
            {viewMode === 'list' ? (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress View
              </>
            ) : (
              <>
                <Folder className="h-4 w-4 mr-2" />
                List View
              </>
            )}
          </Button>
          
          {canCreateProject && (
            <Button
              onClick={() => setShowWizard(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold text-foreground">{projects.length}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <Folder className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-foreground">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-3xl font-bold text-foreground">
                  {new Set(projects.flatMap(p => p.assignedTo)).size}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-time">One Time</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Content */}
      {viewMode === 'list' ? (
        <ProjectList 
          projects={filteredProjects}
          onProjectUpdate={(updatedProject) => {
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
          }}
        />
      ) : (
        <ProgressView projects={filteredProjects} />
      )}

      {/* Project Creation Wizard */}
      {showWizard && (
        <ProjectWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          onProjectCreated={(newProject) => {
            setProjects(prev => [newProject, ...prev])
            setShowWizard(false)
          }}
        />
      )}
    </div>
  )
}
