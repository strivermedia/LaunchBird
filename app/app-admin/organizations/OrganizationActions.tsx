'use client'

import { useState } from 'react'
import { suspendOrganization, reactivateOrganization, updateOrganizationPlan } from '@/lib/app-admin'
import type { Organization } from '@/types'

interface OrganizationActionsProps {
  organization: Organization
}

export function OrganizationActions({ organization }: OrganizationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return
    setIsLoading(true)
    try {
      await suspendOrganization(organization.id, suspendReason)
      setShowSuspendModal(false)
      setSuspendReason('')
      window.location.reload()
    } catch (error) {
      console.error('Error suspending organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    try {
      await reactivateOrganization(organization.id)
      window.location.reload()
    } catch (error) {
      console.error('Error reactivating organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanChange = async (plan: 'free' | 'pro' | 'enterprise') => {
    setIsLoading(true)
    try {
      await updateOrganizationPlan(organization.id, plan)
      setShowPlanModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating organization plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const status = organization.status || 'active'
  const isSuspended = status === 'suspended'

  return (
    <div className="flex gap-2">
      {isSuspended ? (
        <button
          onClick={handleReactivate}
          disabled={isLoading}
          className="text-xs text-green-600 hover:underline disabled:opacity-50"
        >
          {isLoading ? 'Reactivating...' : 'Reactivate'}
        </button>
      ) : (
        <button
          onClick={() => setShowSuspendModal(true)}
          disabled={isLoading}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          Suspend
        </button>
      )}
      <button
        onClick={() => setShowPlanModal(true)}
        disabled={isLoading}
        className="text-xs text-primary hover:underline disabled:opacity-50"
      >
        Change Plan
      </button>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Suspend Organization</h3>
            <p className="text-muted-foreground mb-4">Are you sure you want to suspend {organization.name}?</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              className="w-full p-2 border border-border rounded mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={isLoading || !suspendReason.trim()}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
              >
                {isLoading ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Plan</h3>
            <p className="text-muted-foreground mb-4">Select a new plan for {organization.name}:</p>
            <div className="space-y-2 mb-4">
              {(['free', 'pro', 'enterprise'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => handlePlanChange(plan)}
                  disabled={isLoading || organization.plan === plan}
                className={`w-full p-3 text-left border rounded ${
                    organization.plan === plan
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary'
                  } disabled:opacity-50`}
                >
                  <div className="font-medium capitalize">{plan}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan === 'free' && 'Basic features'}
                    {plan === 'pro' && '$29/month - Advanced features'}
                    {plan === 'enterprise' && '$99/month - Full features'}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 