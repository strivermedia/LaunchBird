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
  Building2,
  User,
  LogOut,
  ChevronLeft,
  CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import ProfileManagement from '@/components/Admin/ProfileManagement'
import type { Theme } from '@/types'
import type { UserProfile } from '@/lib/auth'
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
  const [loading, setLoading] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(true)
  const [devMode] = useState(isDevMode())
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  
  // Profile management state
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  // Determine active section based on pathname
  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/') {
      setActiveSection('home')
    } else if (pathname.startsWith('/clients')) {
      setActiveSection('clients')
    } else if (pathname.startsWith('/projects')) {
      setActiveSection('projects')
    } else if (pathname.startsWith('/tasks')) {
      setActiveSection('tasks')
    } else if (pathname.startsWith('/team')) {
      setActiveSection('team')
    } else if (pathname.startsWith('/settings')) {
      setActiveSection('settings')
    }
  }, [pathname])

  // With auth disabled, skip async auth init entirely

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
      case 'tasks':
        router.push('/tasks')
        break
      case 'team':
        router.push('/team')
        break
      case 'settings':
        router.push('/settings')
        break
    }
  }

  // Don't show navigation for auth pages and admin pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password'
  const isAdminPage = pathname.startsWith('/app-admin')

  if (isAuthPage || isAdminPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          {children}
        </body>
      </html>
    )
  }

  // Show loading state while auth is initializing
  if (loading || !authInitialized) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {!authInitialized ? 'Initializing authentication...' : 'Loading user profile...'}
              </p>
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
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background transition-all duration-300 flex flex-col fixed left-0 top-0 h-full z-50 shadow-xs` }>
            {/* Logo */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                {!sidebarCollapsed && (
                  <span className="font-semibold text-lg text-foreground">LaunchBird</span>
                )}
              </div>
            </div>

            

            {/* Navigation Menu */}
            <div className="flex-1 p-4 mt-6 space-y-2">
              <Button
                onClick={() => handleSectionChange('home')}
                variant={activeSection === 'home' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-2'} rounded-lg ${
                  activeSection === 'home'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <Home className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>Home</span>}
              </Button>

              <Button
                onClick={() => handleSectionChange('projects')}
                variant={activeSection === 'projects' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2'} rounded-lg ${
                  activeSection === 'projects'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-5 w-5" />
                  {!sidebarCollapsed && <span>Projects</span>}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${activeSection === 'projects' ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}>
                      0
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                )}
              </Button>


              <Button
                onClick={() => handleSectionChange('clients')}
                variant={activeSection === 'clients' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-2'} rounded-lg ${
                  activeSection === 'clients'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <Building2 className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>Clients</span>}
              </Button>

              <Button
                onClick={() => handleSectionChange('tasks')}
                variant={activeSection === 'tasks' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-2'} rounded-lg ${
                  activeSection === 'tasks'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <CheckSquare className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>Tasks</span>}
              </Button>

              {userProfile?.role === 'admin' && (
                <Button
                  onClick={() => handleSectionChange('team')}
                  variant={activeSection === 'team' ? 'default' : 'ghost'}
                  className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-2'} rounded-lg ${
                    activeSection === 'team'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                  }`}
                >
                  <Users className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && <span>Team</span>}
                </Button>
              )}

              <Button
                onClick={() => handleSectionChange('settings')}
                variant={activeSection === 'settings' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-2'} rounded-lg ${
                  activeSection === 'settings'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <Settings className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>Settings</span>}
              </Button>
            </div>


          </div>

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
            {/* Fixed Top Header */}
            <header className={`h-16 bg-background border-b border-border px-6 flex items-center fixed top-0 right-0 ${sidebarCollapsed ? 'left-16' : 'left-64'} z-40 transition-all duration-300`}>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="h-8 w-8 p-0 rounded-xl bg-background hover:bg-muted text-foreground"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-xl font-semibold text-foreground">
                  {activeSection === 'home' && 'Dashboard'}
                  {activeSection === 'clients' && 'Clients'}
                  {activeSection === 'projects' && 'Projects'}
                  {activeSection === 'tasks' && 'Tasks'}
                  {activeSection === 'team' && 'Team'}
                  {activeSection === 'settings' && 'Settings'}
                </h1>
              </div>

              {/* Center search */}
              <div className="flex-1 flex justify-center px-6">
                <div className="w-full max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-10 rounded-full bg-muted border-border" />
                  </div>
                </div>
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

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hover:bg-accent">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Messages */}
                <Button variant="ghost" size="sm" className="hover:bg-accent">
                  <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Cloud Sync */}
                <Button variant="ghost" size="sm" className="hover:bg-accent">
                  <Cloud className="h-5 w-5" />
                </Button>

                {/* Profile Management */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-2 hover:bg-accent px-3"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile?.profileImageUrl ? (
                      <img 
                        src={userProfile.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                        {userProfile?.title?.charAt(0) || userProfile?.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {userProfile?.title || userProfile?.email.split('@')[0]}
                    </span>
                    {userProfile?.jobTitle ? (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                        {userProfile.jobTitle}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                        {userProfile?.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto mt-16">
              {children}
            </main>
          </div>
        </div>
        
        {/* Profile Management Modal */}
        <ProfileManagement 
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      </body>
    </html>
  )
} 