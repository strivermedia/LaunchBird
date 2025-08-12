'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Calendar, Clock, FileText, Download, Send, CheckCircle, AlertCircle, Info, Building2, Mail, Phone, ExternalLink, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { logClientAccess } from '@/lib/client-view'
import { getDynamicGradient, getGradientColors } from '@/lib/dashboard'
import type { Client, Project } from '@/types'

interface ClientDashboardViewProps {
  client: Client
  projects: Project[]
  code: string
}

/**
 * Client Dashboard View Component
 * Displays all projects for a specific client
 */
export default function ClientDashboardView({ 
  client, 
  projects, 
  code 
}: ClientDashboardViewProps) {
  const [accessLogged, setAccessLogged] = useState(false)
  const [gradient, setGradient] = useState(getDynamicGradient())
  const [gradientColors, setGradientColors] = useState(getGradientColors())

  /**
   * Log client access for tracking and update gradient
   */
  useEffect(() => {
    const logAccess = async () => {
      if (!accessLogged) {
        try {
          await logClientAccess(code, client.id, client.organizationId)
          setAccessLogged(true)
        } catch (error) {
          console.error('Error logging client access:', error)
        }
      }
    }

    logAccess()
    
    // Update gradient every minute
    const gradientInterval = setInterval(() => {
      setGradient(getDynamicGradient())
      setGradientColors(getGradientColors())
    }, 60000)

    return () => clearInterval(gradientInterval)
  }, [code, client.id, client.organizationId, accessLogged])

  /**
   * Format date for display
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not set'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Get status color for badges
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'on-hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  /**
   * Get type color for badges
   */
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'one-time':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ongoing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  /**
   * Calculate client statistics
   */
  const getClientStats = () => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'in-progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0

    return { totalProjects, activeProjects, completedProjects, totalProgress }
  }

  const stats = getClientStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Simple Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 dark:border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white">
                  LaunchBird
                </h1>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Client View
                </p>
              </div>
            </div>
            
            {/* Manager Contact Card */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 dark:border-border/50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {client.assignedManagerName?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-white truncate">
                    {client.assignedManagerName || 'Project Manager'}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {client.assignedManagerTitle || 'Your Project Manager'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(`mailto:${client.assignedManagerEmail || 'manager@launchbird.com'}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(`sms:${client.assignedManagerPhone || '+1234567890'}`, '_blank')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Client Information */}
        <Card className="border-0 shadow-lg mb-8 overflow-hidden bg-primary">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-white">
                  Welcome, {client.name}
                </CardTitle>
                <CardDescription className="text-white/80">
                  View all your projects and track progress
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Company
                      </p>
                      <p className="text-sm text-white/80">
                        {client.company || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Email
                      </p>
                      <p className="text-sm text-white/80">
                        {client.email}
                      </p>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Phone
                        </p>
                        <p className="text-sm text-white/80">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Statistics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalProjects}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-white/70">
                        Active
                      </p>
                      <p className="text-sm font-semibold text-green-300">
                        {stats.activeProjects}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">
                        Completed
                      </p>
                      <p className="text-sm font-semibold text-blue-300">
                        {stats.completedProjects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Overall Progress
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(stats.totalProgress)}%
                    </p>
                  </div>
                  <Progress 
                    value={stats.totalProgress} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
              Your Projects
            </h2>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {projects.length === 0 ? (
            <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-muted/50 dark:bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Your projects will appear here once they are created and assigned to you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getTypeColor(project.type)}>
                          {project.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground dark:text-white">
                          Progress
                        </span>
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                      <Progress 
                        value={project.progress} 
                        className="h-2 bg-muted dark:bg-muted"
                        style={{
                          '--progress-background': '#6d28d9',
                          '--progress-foreground': '#7c3aed',
                        } as React.CSSProperties}
                      />
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                          Started {formatDate(project.startDate)}
                        </span>
                      </div>
                      {project.endDate && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                            Due {formatDate(project.endDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => window.open(`/view/${project.clientCode}`, '_blank')}
                      disabled={!project.clientCode}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 dark:border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              © 2024 LaunchBird. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70 mt-1">
              Access Code: {code} • Last updated: {formatDate(client.updatedAt)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 