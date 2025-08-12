'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllOrganizations, suspendOrganization, reactivateOrganization, updateOrganizationPlan } from '@/lib/app-admin'
import { OrganizationActions } from './OrganizationActions'
import type { Organization } from '@/types'
import { 
  Shield,
  BarChart3,
  Users,
  Building2,
  Activity,
  Database
} from 'lucide-react'

function formatDate(date: any) {
  if (!date) return ''
  if (typeof date.toDate === 'function') return date.toDate().toLocaleDateString()
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return ''
  }
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await getAllOrganizations()
        setOrganizations(orgs)
      } catch (error) {
        console.error('Error loading organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-64 bg-card flex flex-col fixed left-0 top-0 h-full z-50 shadow-xs">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
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
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">5</span>
            </Link>
            <Link 
              href="/app-admin/organizations"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4" />
                <span>Organizations</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{organizations.length}</span>
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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
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
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </main>
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
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
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
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </div>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">5</span>
          </Link>

          <Link 
            href="/app-admin/organizations"
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </div>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{organizations.length}</span>
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
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
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
          <h2 className="text-2xl font-bold mb-4">Organizations</h2>
          <p className="text-muted-foreground mb-4">Manage all organizations in the system.</p>
          <div className="overflow-x-auto rounded border border-border bg-card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Members</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No organizations found.</td>
                  </tr>
                ) : (
                  organizations.map(org => (
                    <tr key={org.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-2 font-medium">{org.name}</td>
                      <td className="px-4 py-2">{org.plan}</td>
                      <td className="px-4 py-2">{org.members?.length ?? 0}</td>
                      <td className="px-4 py-2">{formatDate(org.createdAt)}</td>
                      <td className="px-4 py-2">{org.status || 'active'}</td>
                      <td className="px-4 py-2">
                        <OrganizationActions organization={org} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
} 