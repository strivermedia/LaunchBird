'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Shield,
  BarChart3,
  Users,
  Building2,
  Activity,
  Database
} from 'lucide-react'

interface SystemHealth {
  dbStatus: string
  suspendedOrgs: number
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth>({ dbStatus: 'loading', suspendedOrgs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSystemHealth = async () => {
      let dbStatus = 'healthy'
      let suspendedOrgs = 0
      
      try {
        await getDocs(collection(db, 'users'))
      } catch {
        dbStatus = 'error'
      }
      
      try {
        const q = query(collection(db, 'organizations'), where('status', '==', 'suspended'))
        const snapshot = await getDocs(q)
        suspendedOrgs = snapshot.size
      } catch {}
      
      setHealth({ dbStatus, suspendedOrgs })
      setLoading(false)
    }

    getSystemHealth()
  }, [])

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
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Activity className="h-4 w-4 mr-3" />
              <span>Analytics</span>
            </Link>
            <Link 
              href="/admin/system"
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
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
              <div className="h-8 bg-muted rounded w-48 mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </main>
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
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Activity className="h-4 w-4 mr-3" />
            <span>Analytics</span>
          </Link>

          <Link 
            href="/admin/system"
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors"
          >
            <Database className="h-4 w-4 mr-3" />
            <span>System</span>
          </Link>
        </div>

        {/* Profile Section */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Top Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-40">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">LaunchBird Admin Panel</h1>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              🚀 Dev Mode
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto mt-16">
          <h2 className="text-2xl font-bold mb-4">System Health</h2>
          <p className="text-muted-foreground mb-4">Monitor system health and manage settings.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-lg font-semibold mb-2">Database</div>
              <div className={health.dbStatus === 'healthy' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {health.dbStatus === 'healthy' ? 'Connected' : 'Error'}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-lg font-semibold mb-2">Suspended Organizations</div>
              <div className={health.suspendedOrgs === 0 ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                {health.suspendedOrgs}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 