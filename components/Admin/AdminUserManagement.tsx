'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  makeUserAdmin, 
  revokeAdminPrivileges, 
  getUserClaims, 
  listAdminUsers,
  checkCurrentUserIsAdmin 
} from '@/lib/admin-claims'
import { Shield, ShieldCheck, ShieldX, Users, UserCheck, UserX } from 'lucide-react'

interface AdminUser {
  uid: string
  isAdmin: boolean
}

export default function AdminUserManagement() {
  const [userUid, setUserUid] = useState('')
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    loadAdminUsers()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const isAdmin = await checkCurrentUserIsAdmin()
      setCurrentUserIsAdmin(isAdmin)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadAdminUsers = async () => {
    try {
      setLoading(true)
      const result = await listAdminUsers()
      
      if (result.success && result.adminUsers) {
        const adminUserList = result.adminUsers.map(uid => ({ uid, isAdmin: true }))
        setAdminUsers(adminUserList)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async () => {
    if (!userUid.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user UID' })
      return
    }

    try {
      setLoading(true)
      const result = await makeUserAdmin(userUid.trim())
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'User made admin successfully' })
        setUserUid('')
        loadAdminUsers() // Refresh the list
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to make user admin' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAdmin = async (uid: string) => {
    try {
      setLoading(true)
      const result = await revokeAdminPrivileges(uid)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Admin privileges revoked successfully' })
        loadAdminUsers() // Refresh the list
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to revoke admin privileges' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckUserClaims = async () => {
    if (!userUid.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user UID' })
      return
    }

    try {
      setLoading(true)
      const result = await getUserClaims(userUid.trim())
      
      if (result.success) {
        const isAdmin = result.claims?.admin === true
        setMessage({ 
          type: 'success', 
          text: `User ${userUid} ${isAdmin ? 'has' : 'does not have'} admin privileges` 
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to get user claims' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!currentUserIsAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-red-500" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You need admin privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin User Management
          </CardTitle>
          <CardDescription>
            Manage admin privileges for users using Firebase custom claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Make User Admin */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Grant Admin Privileges</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter user UID"
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleMakeAdmin} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Make Admin
              </Button>
            </div>
          </div>

          <Separator />

          {/* Check User Claims */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Check User Claims</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter user UID to check"
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleCheckUserClaims} 
                disabled={loading}
                variant="outline"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Check Claims
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Current Admin Users
          </CardTitle>
          <CardDescription>
            Users with admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No admin users found
            </div>
          ) : (
            <div className="space-y-2">
              {adminUsers.map((user) => (
                <div key={user.uid} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {user.uid}
                    </code>
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                  <Button
                    onClick={() => handleRevokeAdmin(user.uid)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Example Usage</CardTitle>
          <CardDescription>
            How to use the admin claims functionality in your code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`// Make a user an admin
import { makeUserAdmin } from '@/lib/admin-claims'

const userUid = 'FHZydNkowSV5NdClwIONYLSrUDd2'
await makeUserAdmin(userUid)

// Check if current user is admin
import { checkCurrentUserIsAdmin } from '@/lib/admin-claims'

const isAdmin = await checkCurrentUserIsAdmin()

// Revoke admin privileges
import { revokeAdminPrivileges } from '@/lib/admin-claims'

await revokeAdminPrivileges(userUid)`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 