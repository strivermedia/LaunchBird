'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUserProfile, isDevMode } from '@/lib/auth'
import { 
  getAppAnalytics,
  getAllOrganizations,
  getAllUsers,
  isAppAdmin
} from '@/lib/app-admin'
import type { UserProfile } from '@/lib/auth'
import type { 
  AppAnalytics,
  Organization,
  Theme
} from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sun, 
  Moon, 
  Monitor, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  FolderOpen,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Shield,
  Database
} from 'lucide-react'

/**
 * Admin Analytics page component
 * Detailed analytics with charts, metrics, and insights
 */
export default function AdminAnalyticsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [devMode] = useState(isDevMode())
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Analytics data
  const [analytics, setAnalytics] = useState<AppAnalytics | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  
  // Filter state
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [showRevenue, setShowRevenue] = useState(true)

  // Load user profile and check admin status
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
        
        // In development mode, allow access even without a profile
        if (profile || devMode) {
          const adminStatus = await isAppAdmin(profile?.uid || 'dev-user')
          setIsAdmin(adminStatus)
          
          if (adminStatus) {
            // Load admin data
            await loadAdminData()
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        // In development mode, still allow access
        if (devMode) {
          setIsAdmin(true)
          loadAdminData()
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [devMode])

  // Load admin data
  const loadAdminData = async () => {
    try {
      const [analyticsData, organizationsData, usersData] = await Promise.all([
        getAppAnalytics(),
        getAllOrganizations(),
        getAllUsers()
      ])

      setAnalytics(analyticsData)
      setOrganizations(organizationsData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  // Theme management
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

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

  // Mock chart data
  const userGrowthData: ChartDataItem[] = [
    { date: 'Jan', users: 1200, growth: 15 },
    { date: 'Feb', users: 1450, growth: 21 },
    { date: 'Mar', users: 1680, growth: 16 },
    { date: 'Apr', users: 1920, growth: 14 },
    { date: 'May', users: 2180, growth: 14 },
    { date: 'Jun', users: 2450, growth: 12 },
  ]

  const revenueData: ChartDataItem[] = [
    { date: 'Jan', revenue: 8500, growth: 8 },
    { date: 'Feb', revenue: 9200, growth: 8 },
    { date: 'Mar', revenue: 10100, growth: 10 },
    { date: 'Apr', revenue: 11200, growth: 11 },
    { date: 'May', revenue: 12400, growth: 11 },
    { date: 'Jun', revenue: 13800, growth: 11 },
  ]

  type ChartDataItem = { date: string; users?: number; revenue?: number; growth: number }

  const planDistribution = [
    { plan: 'Free', users: 1800, percentage: 73 },
    { plan: 'Pro', users: 450, percentage: 18 },
    { plan: 'Enterprise', users: 200, percentage: 9 },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-full z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-lg text-foreground">Admin Panel</span>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            <Link 
              href="/admin"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/admin/users"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">5</span>
            </Link>
            <Link 
              href="/admin/organizations"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4" />
                <span>Organizations</span>
              </div>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">2</span>
            </Link>
            <Link 
              href="/admin/analytics"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
            >
              <Activity className="h-4 w-4 mr-3" />
              <span>Analytics</span>
            </Link>
            <Link 
              href="/admin/system"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Database className="h-4 w-4 mr-3" />
              <span>System</span>
            </Link>
          </div>
          <div className="mt-auto p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col ml-64">
          <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-40">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">LaunchBird Admin Panel</h1>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                🚀 Dev Mode
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto mt-16">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-64 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access analytics.</p>
        </div>
      </div>
    )
  }

  if (!userProfile && !devMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Unable to load user profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar Navigation */}
      <div className="w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-full z-50">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/admin/users"
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </div>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {users.length}
            </span>
          </Link>

          <Link 
            href="/admin/organizations"
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </div>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {organizations.length}
            </span>
          </Link>

          <Link 
            href="/admin/analytics"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
          >
            <Activity className="h-4 w-4 mr-3" />
            <span>Analytics</span>
          </Link>

          <Link 
            href="/admin/system"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Database className="h-4 w-4 mr-3" />
            <span>System</span>
          </Link>
        </div>

        {/* Profile Section */}
        <div className="mt-auto p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userProfile?.title?.charAt(0) || userProfile?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.title || userProfile?.email?.split('@')[0] || 'Admin User'}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Top Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-40">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
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
                variant="ghost"
                size="sm"
                onClick={() => setTheme('light')}
                className={`h-8 w-8 p-0 ${theme === 'light' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-accent'}`}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('system')}
                className={`h-8 w-8 p-0 ${theme === 'system' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-accent'}`}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('dark')}
                className={`h-8 w-8 p-0 ${theme === 'dark' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-accent'}`}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={loadAdminData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto mt-16">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{analytics?.totalUsers.toLocaleString() || '2,450'}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+{analytics?.userGrowth.daily || 12} today</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-foreground">${analytics?.revenue.toLocaleString() || '13,800'}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+12% this month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizations */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                    <p className="text-3xl font-bold text-foreground">{analytics?.totalOrganizations.toLocaleString() || '156'}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">{analytics?.activeOrganizations || 142} active</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold text-foreground">{analytics?.totalProjects.toLocaleString() || '892'}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600">{analytics?.totalTasks || 2340} tasks</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Growth Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      User Growth
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={showRevenue ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowRevenue(true)}
                      >
                        Users
                      </Button>
                      <Button
                        variant={!showRevenue ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowRevenue(false)}
                      >
                        Revenue
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {(showRevenue ? revenueData : userGrowthData).map((item, index) => {
                      const value = showRevenue ? item.revenue : item.users
                      const maxValue = Math.max(...(showRevenue ? revenueData : userGrowthData).map(d => (showRevenue ? d.revenue : d.users) || 0))
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg mb-2 relative group">
                            <div 
                              className="bg-blue-600 rounded-t-lg transition-all duration-300 group-hover:bg-blue-700"
                              style={{ 
                                height: `${((value || 0) / maxValue) * 200}px` 
                              }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {showRevenue ? `$${(value || 0).toLocaleString()}` : (value || 0).toLocaleString()}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {showRevenue ? 'Monthly revenue growth' : 'User growth over time'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Distribution */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Plan Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {planDistribution.map((plan, index) => (
                      <div key={plan.plan} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : '#F59E0B'
                            }}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{plan.plan}</p>
                            <p className="text-xs text-muted-foreground">{plan.users} users</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{plan.percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <span className="text-sm font-semibold text-foreground">
                        {planDistribution.reduce((sum, plan) => sum + plan.users, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Active Users Today</p>
                      <p className="text-xs text-muted-foreground">Users who logged in today</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.floor((analytics?.totalUsers || 0) * 0.35).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">New Signups</p>
                      <p className="text-xs text-muted-foreground">Users who joined today</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      +{analytics?.userGrowth.daily || 12}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Conversion Rate</p>
                      <p className="text-xs text-muted-foreground">Free to paid conversion</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">27%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-orange-600" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Uptime</p>
                      <p className="text-xs text-muted-foreground">System availability</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Response Time</p>
                      <p className="text-xs text-muted-foreground">Average API response</p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">Storage Used</p>
                      <p className="text-xs text-muted-foreground">Total storage consumption</p>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">2.1GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">New user registered</p>
                        <p className="text-xs text-muted-foreground">user{i + 1}@example.com joined the platform</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {i + 1} minute{i !== 0 ? 's' : ''} ago
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 