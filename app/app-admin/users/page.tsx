'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUserProfile, isDevMode } from '@/lib/auth'
import { 
  getAllUsers,
  isAppAdmin,
  updateUserRole,
  deleteUser
} from '@/lib/app-admin'
import type { UserProfile } from '@/lib/auth'
import type { Theme, Organization } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserPlus,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Building2,
  Crown,
  User,
  Settings,
  BarChart3,
  Activity,
  Database
} from 'lucide-react'

/**
 * Admin Users page component
 * User management with filtering, search, and actions
 */
export default function AdminUsersPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [devMode] = useState(true)
  const [isAdmin, setIsAdmin] = useState(true)
  
  // Users data
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showActions, setShowActions] = useState<string | null>(null)

  // Load user profile and check admin status
  useEffect(() => {
    // Load mock users without auth
    loadUsersData()
  }, [])

  // Load users data
  const loadUsersData = async () => {
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error loading users data:', error)
    }
  }

  // Filter users
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organizationId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter - using organizationRole as status for now
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.organizationRole === 'member' || user.organizationRole === 'admin'
        if (statusFilter === 'inactive') return user.organizationRole === 'client'
        if (statusFilter === 'suspended') return !user.organizationRole
        return true
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

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

  // Handle user actions
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      await loadUsersData() // Refresh data
      setShowActions(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId)
        await loadUsersData() // Refresh data
        setShowActions(null)
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      case 'owner':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
      case 'member':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      case 'client':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'suspended':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-64 bg-card flex flex-col fixed left-0 top-0 h-full z-50 shadow-xs">
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
              href="/app-admin"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/app-admin/users"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">5</span>
            </Link>
            <Link 
              href="/app-admin/organizations"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4" />
                <span>Organizations</span>
              </div>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">2</span>
            </Link>
            <Link 
              href="/app-admin/analytics"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Activity className="h-4 w-4 mr-3" />
              <span>Analytics</span>
            </Link>
            <Link 
              href="/app-admin/system"
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
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
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
            <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access user management.</p>
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
      <div className="w-64 bg-card flex flex-col fixed left-0 top-0 h-full z-50 shadow-xs">
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
            href="/app-admin"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            <span>Dashboard</span>
          </Link>

          <Link 
            href="/app-admin/users"
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
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
            href="/app-admin/organizations"
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
            href="/app-admin/analytics"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Activity className="h-4 w-4 mr-3" />
            <span>Analytics</span>
          </Link>

          <Link 
            href="/app-admin/system"
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
            <h1 className="text-xl font-semibold text-foreground">User Management</h1>
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
                className={`h-8 w-8 p-0 ${theme === 'light' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'}`}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('system')}
                className={`h-8 w-8 p-0 ${theme === 'system' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'}`}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('dark')}
                className={`h-8 w-8 p-0 ${theme === 'dark' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'}`}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={loadUsersData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Add User Button */}
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="p-6 border-b border-border bg-card mt-16">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users by email, name, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="member">Member</option>
                <option value="client">Client</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{users.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">
                      {users.filter(u => u.organizationRole === 'member' || u.organizationRole === 'admin').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admins</p>
                    <p className="text-3xl font-bold text-red-600">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {users.filter(u => {
                        const createdAt = new Date(u.createdAt || Date.now())
                        const oneMonthAgo = new Date()
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                        return createdAt > oneMonthAgo
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {user.title?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {user.title || 'Unnamed User'}
                          </h3>
                          {user.role === 'admin' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.organizationId && (
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{user.organizationId}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center space-x-4">
                      {/* Role Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role || 'member')}`}>
                        {user.role || 'member'}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.organizationRole || 'member')}`}>
                        {user.organizationRole || 'member'}
                      </span>

                      {/* Actions */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowActions(showActions === user.uid ? null : user.uid)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {showActions === user.uid && (
                          <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-50 min-w-48">
                            <div className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleUpdateRole(user.uid, 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleUpdateRole(user.uid, 'member')}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Make Member
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleUpdateRole(user.uid, 'client')}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Make Client
                              </Button>
                              <div className="border-t border-border my-1"></div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteUser(user.uid)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
} 