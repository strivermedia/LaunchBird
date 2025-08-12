'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser } from '@/lib/app-admin'
import type { UserProfile } from '@/lib/auth'

interface UserActionsProps {
  user: UserProfile
}

export function UserActions({ user }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleRoleChange = async (role: string) => {
    setIsLoading(true)
    try {
      await updateUserRole(user.uid, role)
      setShowRoleModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsLoading(true)
    try {
      await deleteUser(user.uid)
      setShowDeleteModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRole = user.role || user.organizationRole || 'member'

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowRoleModal(true)}
        disabled={isLoading}
        className="text-xs text-primary hover:underline disabled:opacity-50"
      >
        Change Role
      </button>
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={isLoading}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
      >
        Delete
      </button>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
            <p className="text-muted-foreground mb-4">Select a new role for {user.email}:</p>
            <div className="space-y-2 mb-4">
              {(['admin', 'team_member', 'client'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={isLoading || currentRole === role}
                className={`w-full p-3 text-left border rounded ${
                    currentRole === role
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  } disabled:opacity-50`}
                >
                  <div className="font-medium capitalize">{role.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">
                    {role === 'admin' && 'Full access to all features'}
                    {role === 'team_member' && 'Access to assigned projects and tasks'}
                    {role === 'client' && 'Read-only access to shared projects'}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-destructive">Delete User</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete {user.email}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 