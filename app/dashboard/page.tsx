'use client'

import React, { useEffect, useState } from 'react'
import { getCurrentUserProfile } from '@/lib/auth'
import { 
  getProjects, 
  getTasks, 
  getRecentActivities, 
  getTimeSummary, 
  getTeamWorkload,
  getDashboardStats,
  subscribeToProjects,
  subscribeToActivities,
  getGreeting,
  getDynamicGradient,
  getGradientColors
} from '@/lib/dashboard'
import { getCurrentWeather, getWeatherEmoji, getSkylineSVG } from '@/lib/weather'
import { Clock, Sun, Cloud, CloudRain } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard page component
 * Displays the main dashboard content with statistics and overview
 */
export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Dashboard data
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [timeSummary, setTimeSummary] = useState<TimeSummary | null>(null)
  const [teamWorkload, setTeamWorkload] = useState<TeamMemberWorkload[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [localTime, setLocalTime] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning')
  const [gradient, setGradient] = useState(getGradientColors())

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

  // Theme management and time/weather updates
  useEffect(() => {
    // Set initial time, greeting, and time of day
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      setLocalTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }))
      
      // Update time of day based on current hour
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon')
      } else if (hour >= 17 && hour < 22) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }
    
    const updateGreeting = () => {
      const userName = userProfile?.title || userProfile?.email.split('@')[0] || 'Developer'
      setGreeting(getGreeting(userName))
    }
    
    updateTime()
    updateGreeting()
    setGradient(getGradientColors())
    const timeInterval = setInterval(() => {
      updateTime()
      setGradient(getGradientColors())
    }, 60000) // Update every minute
    const greetingInterval = setInterval(() => {
      updateGreeting()
      setGradient(getGradientColors())
    }, 3600000) // Update greeting every hour

    // Fetch weather data
    const fetchWeather = async () => {
      try {
        const weatherData = await getCurrentWeather()
        setWeather(weatherData)
      } catch (error) {
        console.error('Error fetching weather:', error)
        // Set fallback weather data
        setWeather({
          temperature: 72,
          condition: 'Clear',
          icon: '01d',
          location: 'Unknown Location',
          humidity: 65,
          windSpeed: 5,
          feelsLike: 74,
          lastUpdated: new Date(),
        })
      }
    }

    fetchWeather()

    return () => {
      clearInterval(timeInterval)
      clearInterval(greetingInterval)
    }
  }, [userProfile])

  // Handle quick actions
  const handleQuickAction = (actionType: QuickActionType) => {
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Unable to load user profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" style={{
      background: `linear-gradient(135deg, ${gradient.from}10, ${gradient.to}05)`,
      minHeight: 'calc(100vh - 4rem)'
    }}>
      {/* Welcome Banner with Dynamic Gradient */}
      <div className="mb-8">
        <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{
          minHeight: '200px',
          background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`
        }}>

          {/* Large translucent circles for visual effect - inspired by concentric ripple effect */}
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/25 rounded-full transform translate-x-48 -translate-y-48"></div>
          <div className="absolute top-0 right-0 w-[24rem] h-[24rem] bg-white/20 rounded-full transform translate-x-40 -translate-y-40"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/15 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-24 -translate-y-24"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {getGreeting(userProfile.title || userProfile.email.split('@')[0])}
            </h2>
            
            {/* Medium-sized Weather and Time Information */}
            <div className="flex flex-wrap gap-5">
              {/* Medium Local Time Widget */}
              <div className="group relative min-w-[280px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02] group-hover:bg-gradient-to-br group-hover:from-white/25 group-hover:to-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
                </div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">
                          {localTime}
                        </p>
                        <div className="flex items-center space-x-2 text-white/70">
                          <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Weather Widget */}
              <div className="group relative min-w-[280px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02] group-hover:bg-gradient-to-br group-hover:from-white/25 group-hover:to-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
                </div>
                <div className="relative p-5 pr-4">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md">
                        {weather?.condition === 'Clear' ? (
                          <Sun className="h-6 w-6 text-white" />
                        ) : weather?.condition === 'Clouds' ? (
                          <Cloud className="h-6 w-6 text-white" />
                        ) : weather?.condition === 'Rain' ? (
                          <CloudRain className="h-6 w-6 text-white" />
                        ) : (
                          <Cloud className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl font-bold text-white">
                            {weather?.temperature}°
                          </span>
                          <div className="text-2xl">
                            {getWeatherEmoji(weather?.condition || 'Clear')}
                          </div>
                        </div>
                        <p className="text-base font-semibold text-white/90">
                          {weather?.condition}
                        </p>
                      </div>
                    </div>
                  </div>
                  {weather?.feelsLike && (
                    <div className="mt-3 flex items-center space-x-2 text-white/70 -mr-1">
                      <span className="text-sm font-medium">Feels like {weather.feelsLike}°</span>
                      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                      <span className="text-sm font-medium">{weather.humidity}% humidity</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#7c3aed] dark:text-[#7c3aed]/90">
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-[#7c3aed] dark:text-[#7c3aed]/90">
                      {timeSummary.todayHours}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                      Today
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-[#7c3aed] dark:text-[#7c3aed]/90">
                      {timeSummary.thisWeekHours}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                      This Week
                    </div>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-3xl font-bold text-[#7c3aed] dark:text-[#7c3aed]/90">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#7c3aed] dark:text-[#7c3aed]/90">
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                      Active Projects
                    </span>
                    <span className="font-semibold text-[#7c3aed] dark:text-[#7c3aed]/90">
                      {stats.activeProjects}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                      Pending Tasks
                    </span>
                    <span className="font-semibold text-[#7c3aed] dark:text-[#7c3aed]/90">
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
                      <span className="font-semibold text-[#7c3aed] dark:text-[#7c3aed]/90">
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
    </div>
  )
} 