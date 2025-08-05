'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Calendar, Clock, FileText, Download, Send, CheckCircle, AlertCircle, Info, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ProjectStatus from './ProjectStatus'
import FeedbackForm from './FeedbackForm'
import { logClientAccess } from '@/lib/client-view'
import { getDynamicGradient, getGradientColors } from '@/lib/dashboard'
import type { Project, Activity } from '@/types'

interface ClientViewContentProps {
  project: Project
  activities: Activity[]
  code: string
  password?: string
}

/**
 * Main Client View Content Component
 * Displays project details, milestones, shared files, and feedback forms
 */
export default function ClientViewContent({ 
  project, 
  activities, 
  code, 
  password 
}: ClientViewContentProps) {
  const [isLoading, setIsLoading] = useState(false)
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
          await logClientAccess(code, project.id, project.organizationId)
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
  }, [code, project.id, project.organizationId, accessLogged])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Simple Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 dark:border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#6d28d9] dark:bg-[#7c3aed] rounded-2xl">
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
                <div className="w-10 h-10 bg-[#6d28d9] dark:bg-[#7c3aed] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {project.assignedManagerName?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-white truncate">
                    {project.assignedManagerName || 'Project Manager'}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {project.assignedManagerTitle || 'Your Project Manager'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-[#6d28d9] text-[#6d28d9] hover:bg-[#6d28d9] hover:text-white dark:border-[#7c3aed] dark:text-[#7c3aed] dark:hover:bg-[#7c3aed] dark:hover:text-white"
                    onClick={() => window.open(`mailto:${project.assignedManagerEmail || 'manager@launchbird.com'}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-[#6d28d9] text-[#6d28d9] hover:bg-[#6d28d9] hover:text-white dark:border-[#7c3aed] dark:text-[#7c3aed] dark:hover:bg-[#7c3aed] dark:hover:text-white"
                    onClick={() => window.open(`sms:${project.assignedManagerPhone || '+1234567890'}`, '_blank')}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card className="border-0 shadow-lg overflow-hidden" style={{
              background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`
            }}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {project.status.replace('-', ' ')}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {project.type.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Progress */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Progress
                          </p>
                          <p className="text-sm text-white/80">
                            Current status
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {project.progress}%
                        </p>
                      </div>
                      <Progress 
                        value={project.progress} 
                        className="h-2 bg-white/20"
                        style={{
                          '--progress-background': 'rgba(255, 255, 255, 0.3)',
                          '--progress-foreground': 'rgba(255, 255, 255, 0.8)',
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Timeline
                          </p>
                          <p className="text-sm text-white/80">
                            Project dates
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            Start Date
                          </p>
                          <p className="text-sm text-white/80">
                            {formatDate(project.startDate)}
                          </p>
                        </div>
                        {project.endDate && (
                          <div>
                            <p className="text-sm font-medium text-white">
                              End Date
                            </p>
                            <p className="text-sm text-white/80">
                              {formatDate(project.endDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Info className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Details
                          </p>
                          <p className="text-sm text-white/80">
                            Project info
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-white">
                            Type
                          </p>
                          <p className="text-sm text-white/80 capitalize">
                            {project.type.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Status
                          </p>
                          <p className="text-sm text-white/80 capitalize">
                            {project.status.replace('-', ' ')}
                          </p>
                        </div>
                        {project.budget && (
                          <div>
                            <p className="text-sm font-medium text-white">
                              Budget
                            </p>
                            <p className="text-sm text-white/80">
                              ${project.budget.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Status Component */}
            <ProjectStatus project={project} activities={activities} />

            {/* Shared Files */}
            <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
                  <span>Shared Files</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground">
                  Download project files and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock shared files - in real implementation, these would come from Firestore */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
                      <div>
                        <p className="font-medium text-foreground dark:text-white">
                          Project Brief.pdf
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          2.4 MB • Updated 2 days ago
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#6d28d9] hover:bg-[#5b21b6] dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
                      <div>
                        <p className="font-medium text-foreground dark:text-white">
                          Design Mockups.zip
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          15.7 MB • Updated 1 week ago
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#6d28d9] hover:bg-[#5b21b6] dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center space-x-2">
                  <Info className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
                  <span>Project Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-white">
                    Project ID
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground font-mono">
                    {project.id.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-white">
                    Created
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                {project.budget && (
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-white">
                      Budget
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-white mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#7c3aed]/10 dark:text-[#7c3aed]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <FeedbackForm projectId={project.id} />
          </div>
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
              Access Code: {code} • Last updated: {formatDate(project.updatedAt)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 