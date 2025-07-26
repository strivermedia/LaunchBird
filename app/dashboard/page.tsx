'use client'

import React, { useEffect, useState } from 'react'
import { getCurrentUserProfile, isDevMode } from '@/lib/auth'
import { 
  getProjects, 
  getTasks, 
  getRecentActivities, 
  getTimeSummary, 
  getTeamWorkload,
  getDashboardStats,
  subscribeToProjects,
  subscribeToActivities
} from '@/lib/dashboard'
import { getCurrentWeather } from '@/lib/weather'
import type { UserProfile } from '@/lib/auth'
import type { 
  Project, 
  Task, 
  Activity, 
  TimeSummary, 
  TeamMemberWorkload, 
  DashboardStats,
  WeatherData,
  Theme,
  QuickActionType
} from '@/types'

// Dashboard Components
import GreetingCard from '@/components/Dashboard/GreetingCard'
import QuickActions from '@/components/Dashboard/QuickActions'
import ActivityFeed from '@/components/Dashboard/ActivityFeed'
import ProjectsOverview from '@/components/Dashboard/ProjectsOverview'
import TeamWorkload from '@/components/Dashboard/TeamWorkload'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Home, 
  FolderOpen, 
  Users, 
  Settings, 
  Search,
  Bell,
  MessageSquare,
  Cloud,
  Plus,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

/**
 * Dashboard page component
 * Modern dashboard inspired by Designali Creative Suite with sidebar navigation
 */
export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [devMode] = useState(isDevMode())
  
  // Dashboard data
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [timeSummary, setTimeSummary] = useState<TimeSummary | null>(null)
  const [teamWorkload, setTeamWorkload] = useState<TeamMemberWorkload[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Load user profile and initialize dashboard
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
        
        if (profile) {
          // Load dashboard data
          await loadDashboardData(profile.uid, profile.role)
          
          // Set up real-time subscriptions
          const unsubscribeProjects = subscribeToProjects(
            profile.uid,
            profile.role,
            setProjects
          )
          
          const unsubscribeActivities = subscribeToActivities(
            profile.uid,
            profile.role,
            setActivities
          )
          
          return () => {
            unsubscribeProjects()
            unsubscribeActivities()
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  // Load dashboard data
  const loadDashboardData = async (userId: string, userRole: string) => {
    try {
      const [
        projectsData,
        tasksData,
        activitiesData,
        timeSummaryData,
        teamWorkloadData,
        statsData,
        weatherData
      ] = await Promise.all([
        getProjects(userId, userRole),
        getTasks(userId, userRole),
        getRecentActivities(userId, userRole, 10),
        getTimeSummary(userId),
        getTeamWorkload(userRole),
        getDashboardStats(userId, userRole),
        getCurrentWeather()
      ])

      setProjects(projectsData)
      setTasks(tasksData)
      setActivities(activitiesData)
      setTimeSummary(timeSummaryData)
      setTeamWorkload(teamWorkloadData)
      setStats(statsData)
      setWeather(weatherData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Theme management
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  // Handle quick actions
  const handleQuickAction = (actionType: QuickActionType) => {
    console.log('Quick action triggered:', actionType)
    // TODO: Implement action handlers
    switch (actionType) {
      case 'create_project':
        // Open project creation modal
        break
      case 'create_task':
        // Open task creation modal
        break
      case 'create_shoutout':
        // Open shoutout creation modal
        break
      case 'send_message':
        // Open message creation modal
        break
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-card border-r border-border p-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9844fc] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Unable to load user profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#9844fc] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg text-foreground">LaunchBird</span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9844fc] focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-2">
          <Button
            onClick={() => setActiveSection('home')}
            variant="ghost"
            className={`w-full justify-start ${
              activeSection === 'home'
                ? 'bg-[#9844fc]/10 text-[#9844fc]'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Home className="h-4 w-4 mr-3" />
            {!sidebarCollapsed && <span>Home</span>}
          </Button>

          <Button
            onClick={() => setActiveSection('projects')}
            variant="ghost"
            className={`w-full justify-between ${
              activeSection === 'projects'
                ? 'bg-[#9844fc]/10 text-[#9844fc]'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FolderOpen className="h-4 w-4" />
              {!sidebarCollapsed && <span>Projects</span>}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <span className="bg-[#9844fc] text-white text-xs px-2 py-1 rounded-full">
                  {projects.length}
                </span>
                <ChevronDown className="h-3 w-3" />
              </div>
            )}
          </Button>

          {userProfile.role === 'admin' && (
            <Button
              onClick={() => setActiveSection('team')}
              variant="ghost"
              className={`w-full justify-start ${
                activeSection === 'team'
                  ? 'bg-[#9844fc]/10 text-[#9844fc]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && <span>Team</span>}
            </Button>
          )}

          <Button
            onClick={() => setActiveSection('settings')}
            variant="ghost"
            className={`w-full justify-start ${
              activeSection === 'settings'
                ? 'bg-[#9844fc]/10 text-[#9844fc]'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4 mr-3" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#9844fc]/20 rounded-full flex items-center justify-center">
              <span className="text-[#9844fc] font-medium text-sm">
                {userProfile.title?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userProfile.title || userProfile.email.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userProfile.role.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">LaunchBird Dashboard</h1>
            {devMode && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                🚀 Dev Mode
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className="h-8 w-8 p-0"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('system')}
                className="h-8 w-8 p-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="h-8 w-8 p-0"
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Cloud Sync */}
            <Button variant="ghost" size="sm">
              <Cloud className="h-5 w-5" />
            </Button>

            {/* New Project Button */}
            <Button className="bg-[#9844fc] hover:bg-[#7b33cc] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#9844fc] to-[#b366ff] rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    Premium
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to LaunchBird Dashboard
                </h2>
                <p className="text-white/90 mb-4">
                  Manage your projects, track team performance, and stay organized with our comprehensive project management suite.
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#9844fc]">
                    Explore Features
                  </Button>
                  <Button className="bg-white text-[#9844fc] hover:bg-white/90">
                    Take a Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Greeting Card */}
              <GreetingCard 
                userName={userProfile.title || userProfile.email.split('@')[0]}
                userLocation={userProfile.location}
              />

              {/* Quick Actions */}
              <QuickActions 
                userRole={userProfile.role}
                onAction={handleQuickAction}
              />

              {/* Projects Overview */}
              <ProjectsOverview 
                projects={projects}
                loading={loading}
              />

              {/* Team Workload (Admin Only) */}
              {userProfile.role === 'admin' && (
                <TeamWorkload 
                  teamWorkload={teamWorkload}
                  loading={loading}
                />
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <ActivityFeed 
                activities={activities}
                loading={loading}
              />

              {/* Time Tracking Summary */}
              {timeSummary && (
                <Card className="border-[#9844fc]/20 bg-gradient-to-br from-[#9844fc]/5 to-[#9844fc]/10 dark:from-[#9844fc]/10 dark:to-[#9844fc]/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[#9844fc] dark:text-[#9844fc]/90">
                      Time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-[#9844fc] dark:text-[#9844fc]/90">
                          {timeSummary.todayHours}
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                          Today
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-2xl font-bold text-[#9844fc] dark:text-[#9844fc]/90">
                          {timeSummary.thisWeekHours}
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                          This Week
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="text-3xl font-bold text-[#9844fc] dark:text-[#9844fc]/90">
                        {timeSummary.totalHours}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                        Total Hours
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dashboard Stats */}
              {stats && (
                <Card className="border-[#9844fc]/20 bg-gradient-to-br from-[#9844fc]/5 to-[#9844fc]/10 dark:from-[#9844fc]/10 dark:to-[#9844fc]/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[#9844fc] dark:text-[#9844fc]/90">
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                          Active Projects
                        </span>
                        <span className="font-semibold text-[#9844fc] dark:text-[#9844fc]/90">
                          {stats.activeProjects}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                          Pending Tasks
                        </span>
                        <span className="font-semibold text-[#9844fc] dark:text-[#9844fc]/90">
                          {stats.totalTasks - stats.completedTasks}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                          Overdue Tasks
                        </span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {stats.overdueTasks}
                        </span>
                      </div>
                      {userProfile.role === 'admin' && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                            Team Members
                          </span>
                          <span className="font-semibold text-[#9844fc] dark:text-[#9844fc]/90">
                            {stats.teamMembers}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 