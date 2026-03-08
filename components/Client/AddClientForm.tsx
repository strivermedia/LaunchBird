'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, User, Mail, Phone, Building2, Briefcase, Users } from 'lucide-react'
import { Client } from '@/types'
import { createClient } from '@/lib/clients'
import { useAuth } from '@/lib/useAuth'

interface AddClientFormProps {
  onClose: () => void
  onSuccess?: (clientId: string) => void
}

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  position: string
  assignedManagerId: string
  assignedManagerName: string
  assignedManagerTitle: string
  status: 'active' | 'inactive' | 'prospect'
  notes: string
  tags: string[]
}

/**
 * AddClientForm Component
 * Form for creating new clients with validation and error handling
 */
export default function AddClientForm({ onClose, onSuccess }: AddClientFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')

  // Mock team members for assignment - in real app, fetch from API
  const [teamMembers] = useState([
    { id: 'manager1', name: 'Sarah Johnson', title: 'Senior Project Manager' },
    { id: 'manager2', name: 'Mike Chen', title: 'Project Manager' },
    { id: 'manager3', name: 'Alex Rodriguez', title: 'Lead Developer' },
  ])

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    assignedManagerId: '',
    assignedManagerName: '',
    assignedManagerTitle: '',
    status: 'prospect',
    notes: '',
    tags: [],
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleManagerChange = (managerId: string) => {
    const manager = teamMembers.find(m => m.id === managerId)
    setFormData(prev => ({
      ...prev,
      assignedManagerId: managerId,
      assignedManagerName: manager?.name || '',
      assignedManagerTitle: manager?.title || '',
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!formData.name.trim()) {
      errors.push('Client name is required')
    }
    if (!formData.email.trim()) {
      errors.push('Email is required')
    } else if (!formData.email.includes('@')) {
      errors.push('Please enter a valid email address')
    }
    if (!formData.assignedManagerId) {
      errors.push('Please assign a manager')
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (!user) {
      setError('You must be logged in to create a client')
      return
    }

    setIsSubmitting(true)
    setIsCheckingConnection(true)
    setError(null)

    try {
      // Skip connectivity check for now; remove when enabling connectivity checks
      setIsCheckingConnection(false)

      const clientData: Omit<Client, 'id'> = {
        organizationId: user.organizationId || 'default',
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        position: formData.position.trim() || undefined,
        assignedManagerId: formData.assignedManagerId,
        assignedManagerName: formData.assignedManagerName,
        assignedManagerTitle: formData.assignedManagerTitle,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
      }

      const clientId = await createClient(clientData, user.uid)
      
      // Success handling
      if (onSuccess) {
        onSuccess(clientId)
      } else {
        router.push(`/clients/${clientId}`)
      }
      
      onClose()
    } catch (err) {
      console.error('Error creating client:', err)
      setError(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setIsSubmitting(false)
      setIsCheckingConnection(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Client
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Create a new client and assign a manager
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6" role="form">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter client's full name"
                    className="focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="client@company.com"
                    className="focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'prospect') => handleInputChange('status', value)}>
                    <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter company name"
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position/Title
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="e.g., CEO, CTO, Project Manager"
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Assignment
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Manager *
                </Label>
                <Select value={formData.assignedManagerId} onValueChange={handleManagerChange}>
                  <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-sm text-gray-500">{member.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Additional Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this client..."
                  rows={3}
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-purple-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                {isCheckingConnection ? 'Checking connection...' : isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 