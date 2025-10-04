'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, Users, Settings, Plus, Loader2, Check, CreditCard, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  createOrganization, 
  getUserOrganization, 
  addUserToOrganization,
  getCurrentUserProfile,
  updateOrganizationPlan
} from '@/lib/auth'
import { getOrganizationStats } from '@/lib/organizations'

/**
 * Organization settings validation schema
 */
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface Organization {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  plan?: 'free' | 'pro' | 'enterprise'
  planStatus?: 'active' | 'cancelled' | 'past_due'
}

interface OrganizationStats {
  totalMembers: number
  totalProjects: number
  totalClients: number
  activeProjects: number
  completedProjects: number
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    members: number
    projects: number
    storage: string
  }
  popular?: boolean
}

/**
 * Available plans
 */
const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 5 team members',
      'Up to 10 projects',
      '1GB storage',
      'Basic support'
    ],
    limits: {
      members: 5,
      projects: 10,
      storage: '1GB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom branding'
    ],
    limits: {
      members: 25,
      projects: -1, // unlimited
      storage: '10GB'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      '100GB storage',
      '24/7 phone support',
      'Advanced analytics',
      'Custom branding',
      'SSO integration',
      'API access'
    ],
    limits: {
      members: -1, // unlimited
      projects: -1, // unlimited
      storage: '100GB'
    }
  }
]

/**
 * OrganizationSettings component for admin-only organization and plan management
 */
export default function OrganizationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  })

  // Load user's organization on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  /**
   * Load user data and check admin access
   */
  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const profile = await getCurrentUserProfile()
      setUserProfile(profile)
      
      // Check if user is admin
      if (profile?.role !== 'admin') {
        setError('Access denied. This page is only available to administrators.')
        return
      }
      
      if (profile?.organizationId) {
        const orgData = await getUserOrganization(profile.uid)
        if (orgData) {
          setOrganization(orgData)
          // Load organization stats
          const orgStats = await getOrganizationStats(orgData.id, profile.uid)
          setStats(orgStats)
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load organization data')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create a new organization
   */
  const onCreateOrganization = async (data: OrganizationFormData) => {
    try {
      setIsCreating(true)
      setError(null)
      setSuccess(null)

      if (!userProfile) {
        throw new Error('User not authenticated')
      }

      // Create organization
      const organizationId = await createOrganization(
        data.name,
        data.description || '',
        userProfile.uid
      )

      // Add user to organization as owner
      await addUserToOrganization(
        userProfile.uid,
        organizationId,
        'owner'
      )

      setSuccess('Organization created successfully!')
      reset()
      
      // Reload organization data
      await loadUserData()
    } catch (err) {
      console.error('Error creating organization:', err)
      setError('Failed to create organization. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Handle plan upgrade/downgrade
   */
  const handlePlanChange = async (planId: string) => {
    try {
      setError(null)
      setSuccess(null)
      
      if (!organization || !userProfile) {
        throw new Error('Organization or user not found')
      }
      
      // Update organization plan in database
      await updateOrganizationPlan(
        organization.id,
        planId as 'free' | 'pro' | 'enterprise',
        userProfile.uid
      )
      
      // Here you would integrate with your payment provider (Stripe, etc.)
      console.log(`Upgrading to plan: ${planId}`)
      
      setSuccess(`Plan updated to ${PLANS.find(p => p.id === planId)?.name}!`)
      
      // Reload organization data to show updated plan
      await loadUserData()
    } catch (err) {
      console.error('Error updating plan:', err)
      setError('Failed to update plan. Please try again.')
    }
  }

  // Check admin access
  if (userProfile && userProfile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">
            This page is only available to administrators.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading organization...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Organization & Plan Management</h1>
        <Badge variant="secondary" className="ml-2">
          <Crown className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      {!organization ? (
        // Create Organization Form
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Your Organization
            </CardTitle>
            <CardDescription>
              Set up your organization to start managing projects and collaborating with your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateOrganization)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Corp, My Startup"
                  {...register('name')}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your organization"
                  {...register('description')}
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  <>
                    <Building className="mr-2 h-4 w-4" />
                    Create Organization
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        // Organization Management Tabs
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans & Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {organization.name}
                </CardTitle>
                <CardDescription>
                  {organization.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Created: {organization.createdAt.toLocaleDateString()}</span>
                  <Badge variant="secondary">Owner</Badge>
                  <Badge variant={organization.plan === 'free' ? 'outline' : 'default'}>
                    {organization.plan || 'free'} Plan
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Organization Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Members</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeProjects} active, {stats.completedProjects} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Clients</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalClients}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Manage your organization&apos;s subscription and billing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold capitalize">{organization.plan || 'free'} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {organization.plan === 'free' ? 'Free forever' : `$${PLANS.find(p => p.id === organization.plan)?.price}/month`}
                    </p>
                  </div>
                  <Badge variant={organization.plan === 'free' ? 'outline' : 'default'}>
                    {organization.planStatus || 'active'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <Card key={plan.id} className={plan.popular ? 'ring-2 ring-primary' : ''}>
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.popular && <Zap className="h-4 w-4" />}
                    </CardTitle>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.id === organization.plan ? 'outline' : 'default'}
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={plan.id === organization.plan}
                    >
                      {plan.id === organization.plan ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage your organization settings and team members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Organization Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <Building className="h-4 w-4 mr-2" />
                    Billing & Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
