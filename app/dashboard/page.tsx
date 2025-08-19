'use client'

import React, { useEffect, useState } from 'react'
import { logAnalyticsEvent } from '@/lib/platform'
import { getCurrentWeather, getWeatherEmoji } from '@/lib/weather'
import { Clock, Sun, Cloud, CloudRain, Plus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WeatherData } from '@/types'

/**
 * Dashboard page component
 * Displays the main dashboard content with dynamic welcome banner
 */
export default function DashboardPage() {
  const [localTime, setLocalTime] = useState<string>('7:15 PM')
  const [greeting, setGreeting] = useState<string>('Good Evening')
  const [weather, setWeather] = useState<WeatherData | null>({
    temperature: 72,
    condition: 'Clear',
    icon: '01d',
    location: 'San Francisco',
    humidity: 65,
    windSpeed: 5,
    feelsLike: 74,
    lastUpdated: new Date(),
  })
  // Removed dynamic gradient hardcoded styling

  // Update time, greeting, and weather
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      setLocalTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }))
      
      // Update greeting based on time of day
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon')
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good Evening')
      } else {
        setGreeting('Good Night')
      }
    }
    
    // Removed dynamic gradient updater
    updateTime()
    const timeInterval = setInterval(() => {
      updateTime()
    }, 60000) // Update every minute

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

    return () => clearInterval(timeInterval)
  }, [])

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Welcome Banner aligned to left column width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden border card-glow with-bottom-glow">

            <CardContent className="relative p-6">
              <div className="relative">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {greeting}, Developer!
                </h2>

                {/* Weather and Time Information */}
                <div className="flex flex-wrap gap-5">
                  {/* Local Time Widget */}
                  <div className="relative min-w-72 rounded-xl p-5 bg-white/20 dark:bg-white/10 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md card-glow with-bottom-glow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {localTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Widget */}
                  <div className="relative min-w-72 rounded-xl p-5 pr-4 bg-white/20 dark:bg-white/10 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md card-glow with-bottom-glow">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
                          {weather?.condition === 'Clear' ? (
                            <Sun className="h-6 w-6 text-primary" />
                          ) : weather?.condition === 'Clouds' ? (
                            <Cloud className="h-6 w-6 text-primary" />
                          ) : weather?.condition === 'Rain' ? (
                            <CloudRain className="h-6 w-6 text-primary" />
                          ) : (
                            <Cloud className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {weather?.temperature}°
                            </span>
                            <div className="text-2xl">
                              {getWeatherEmoji(weather?.condition || 'Clear')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right column: Recent Activity aligned with welcome banner */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Project Updated</p>
                  <p className="text-xs text-muted-foreground">Website Redesign progress updated to 65%</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Task Completed</p>
                  <p className="text-xs text-muted-foreground">Design Homepage task marked as completed</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you going</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="pill" className="justify-center"
                  onClick={() => logAnalyticsEvent('quick_action_clicked', { action: 'add_project' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
                <Button variant="pill" className="justify-center"
                  onClick={() => logAnalyticsEvent('quick_action_clicked', { action: 'create_task' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
                <Button variant="pill" className="justify-center"
                  onClick={() => logAnalyticsEvent('quick_action_clicked', { action: 'add_client' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
                <Button variant="pill" className="justify-center"
                  onClick={() => logAnalyticsEvent('quick_action_clicked', { action: 'view_analytics' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects Overview</CardTitle>
              <CardDescription>Progress across your active projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">Website Redesign</h4>
                    <p className="text-sm text-muted-foreground">Complete redesign of company website</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">65%</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">Mobile App Development</h4>
                    <p className="text-sm text-muted-foreground">iOS and Android app for client</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">25%</div>
                    <div className="text-xs text-muted-foreground">Planning</div>
                  </div>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Team Workload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Workload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-muted-foreground">Designer</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">8/10</div>
                  <div className="text-xs text-muted-foreground">tasks</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">Jane Smith</div>
                  <div className="text-sm text-muted-foreground">Developer</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">6/8</div>
                  <div className="text-xs text-muted-foreground">tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Time Tracking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6.5</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">32.5</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">156.5</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Projects</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Tasks</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue Tasks</span>
                <span className="font-semibold text-red-600 dark:text-red-400">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Team Members</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}