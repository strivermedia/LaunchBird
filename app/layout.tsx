'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUserProfile, isDevMode } from '@/lib/auth'
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
  Star,
  ChevronDown,
  ChevronRight,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile, Theme } from '@/types'
import './globals.css'

/**
 * Root layout component for the LaunchBird application
 * Provides persistent navigation and global styling
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [devMode] = useState(isDevMode())
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Determine active section based on pathname
  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/') {
      setActiveSection('home')
    } else if (pathname.startsWith('/clients')) {
      setActiveSection('clients')
    } else if (pathname.startsWith('/projects')) {
      setActiveSection('projects')
    } else if (pathname.startsWith('/team')) {
      setActiveSection('team')
    } else if (pathname.startsWith('/settings')) {
      setActiveSection('settings')
    }
  }, [pathname])

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

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

  // Handle section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    
    // Handle navigation for specific sections
    switch (section) {
      case 'home':
        router.push('/dashboard')
        break
      case 'clients':
        router.push('/clients')
        break
      case 'projects':
        router.push('/projects')
        break
      case 'team':
        router.push('/team')
        break
      case 'settings':
        router.push('/settings')
        break
    }
  }

  // Don't show navigation for auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password'

  if (isAuthPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          {children}
        </body>
      </html>
    )
  }

  if (loading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
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
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <div className="min-h-screen bg-background flex">
          {/* Fixed Sidebar Navigation */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-50`}>
            {/* Logo */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#7c3aed] rounded-full flex items-center justify-center">
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
                    className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] dark:bg-gray-800 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <div className="flex-1 p-4 space-y-2">
              <Button
                onClick={() => handleSectionChange('home')}
                variant="ghost"
                className={`w-full justify-start ${
                  activeSection === 'home'
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#f5f5f5] dark:hover:bg-gray-700'
                    : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:text-foreground'
                }`}
              >
                <Home className="h-4 w-4 mr-3" />
                {!sidebarCollapsed && <span>Home</span>}
              </Button>

              <Button
                onClick={() => handleSectionChange('projects')}
                variant="ghost"
                className={`w-full justify-between ${
                  activeSection === 'projects'
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#f5f5f5] dark:hover:bg-gray-700'
                    : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-4 w-4" />
                  {!sidebarCollapsed && <span>Projects</span>}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#7c3aed] text-white text-xs px-2 py-1 rounded-full">
                      0
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                )}
              </Button>

              <Button
                onClick={() => handleSectionChange('clients')}
                variant="ghost"
                className={`w-full justify-start ${
                  activeSection === 'clients'
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#f5f5f5] dark:hover:bg-gray-700'
                    : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:text-foreground'
                }`}
              >
                <Building2 className="h-4 w-4 mr-3" />
                {!sidebarCollapsed && <span>Clients</span>}
              </Button>

              {userProfile?.role === 'admin' && (
                <Button
                  onClick={() => handleSectionChange('team')}
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeSection === 'team'
                      ? 'bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#f5f5f5] dark:hover:bg-gray-700'
                      : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:text-foreground'
                  }`}
                >
                  <Users className="h-4 w-4 mr-3" />
                  {!sidebarCollapsed && <span>Team</span>}
                </Button>
              )}

              <Button
                onClick={() => handleSectionChange('settings')}
                variant="ghost"
                className={`w-full justify-start ${
                  activeSection === 'settings'
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#f5f5f5] dark:hover:bg-gray-700'
                    : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4 mr-3" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Button>
            </div>

            {/* Profile and Settings Section */}
            <div className="mt-auto">
              {/* User Profile */}
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                      {userProfile?.title?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userProfile?.title || userProfile?.email.split('@')[0]}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
                          {userProfile?.role === 'admin' ? 'Pro' : 'Member'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
            {/* Fixed Top Header */}
            <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between fixed top-0 right-0 left-0 z-40 ${sidebarCollapsed ? 'left-16' : 'left-64'} transition-all duration-300">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-foreground">
                  {activeSection === 'home' && 'Dashboard'}
                  {activeSection === 'clients' && 'Clients'}
                  {activeSection === 'projects' && 'Projects'}
                  {activeSection === 'team' && 'Team'}
                  {activeSection === 'settings' && 'Settings'}
                </h1>
                {devMode && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    🚀 Dev Mode
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="flex items-center space-x-1 bg-[#f5f5f5] dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('light')}
                    className={`h-8 w-8 p-0 ${theme === 'light' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-[#f5f5f5] dark:hover:bg-gray-700'}`}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('system')}
                    className={`h-8 w-8 p-0 ${theme === 'system' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-[#f5f5f5] dark:hover:bg-gray-700'}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className={`h-8 w-8 p-0 ${theme === 'dark' ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'hover:bg-[#f5f5f5] dark:hover:bg-gray-700'}`}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hover:bg-[#f5f5f5] dark:hover:bg-gray-700">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Messages */}
                <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f5] dark:hover:bg-gray-700">
                  <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Cloud Sync */}
                <Button variant="ghost" size="sm" className="hover:bg-[#f5f5f5] dark:hover:bg-gray-700">
                  <Cloud className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto mt-16">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
} 