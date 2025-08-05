'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Phone, 
  Building2, 
  User, 
  Calendar,
  Key,
  RefreshCw,
  Trash2,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Client, 
  ClientViewCode, 
  ClientCommunication, 
  ClientNote, 
  ClientProject 
} from '@/types'
import { useAuth } from '@/lib/useAuth'
import { updateClient } from '@/lib/clients'

/**
 * Client Profile Page
 * Displays detailed client information with project links, communications, notes, and code management
 */
export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [viewCodes, setViewCodes] = useState<ClientViewCode[]>([])
  const [communications, setCommunications] = useState<ClientCommunication[]>([])
  const [notes, setNotes] = useState<ClientNote[]>([])
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'communications' | 'notes' | 'access'>('overview')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingManager, setIsEditingManager] = useState(false)
  const [editData, setEditData] = useState<Partial<Client>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Mock team members for assignment - in real app, fetch from API
  const [teamMembers] = useState([
    { id: 'manager1', name: 'Sarah Johnson', title: 'Senior Project Manager' },
    { id: 'manager2', name: 'Mike Chen', title: 'Project Manager' },
    { id: 'manager3', name: 'Alex Rodriguez', title: 'Lead Developer' },
  ])

  // Mock data for development
  useEffect(() => {
    const mockClient: Client = {
      id: clientId,
      organizationId: 'org1',
      name: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corporation',
      position: 'CTO',
      assignedManagerId: 'manager1',
      assignedManagerName: 'Sarah Johnson',
      assignedManagerTitle: 'Senior Project Manager',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      notes: 'Key decision maker for all technical projects. Prefers email communication and weekly updates.',
      tags: ['enterprise', 'technical', 'decision-maker'],
      lastContactDate: new Date('2024-01-18'),
      totalProjects: 5,
      activeProjects: 2,
      completedProjects: 3,
    }

    const mockViewCodes: ClientViewCode[] = [
      {
        id: 'code1',
        clientId: clientId,
        code: 'ABC1',
        accessType: 'code',
        isActive: true,
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date('2024-01-15'),
        createdBy: 'manager1',
        lastUsedAt: new Date('2024-01-18'),
        usageCount: 5,
      },
      {
        id: 'code2',
        clientId: clientId,
        code: 'XYZ2',
        accessType: 'login',
        isActive: false,
        expiresAt: new Date('2024-06-30'),
        createdAt: new Date('2024-01-10'),
        createdBy: 'manager1',
        lastUsedAt: new Date('2024-01-12'),
        usageCount: 2,
      },
    ]

    const mockCommunications: ClientCommunication[] = [
      {
        id: 'comm1',
        clientId: clientId,
        type: 'email',
        subject: 'Project Update - Website Redesign',
        content: 'Hi John, here\'s the latest update on your website redesign project...',
        sentBy: 'manager1',
        sentByName: 'Sarah Johnson',
        timestamp: new Date('2024-01-18'),
        status: 'delivered',
      },
      {
        id: 'comm2',
        clientId: clientId,
        type: 'call',
        content: 'Discussed timeline for mobile app development',
        sentBy: 'manager1',
        sentByName: 'Sarah Johnson',
        timestamp: new Date('2024-01-15'),
        status: 'sent',
      },
    ]

    const mockNotes: ClientNote[] = [
      {
        id: 'note1',
        clientId: clientId,
        content: 'John prefers detailed technical specifications and weekly progress reports. He\'s very hands-on with project management.',
        createdBy: 'manager1',
        createdByName: 'Sarah Johnson',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isPrivate: false,
        tags: ['preferences', 'communication'],
      },
      {
        id: 'note2',
        clientId: clientId,
        content: 'Budget approval process takes 2-3 weeks. Plan accordingly for new project proposals.',
        createdBy: 'manager1',
        createdByName: 'Sarah Johnson',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        isPrivate: true,
        tags: ['budget', 'process'],
      },
    ]

    const mockProjects: ClientProject[] = [
      {
        id: 'proj1',
        clientId: clientId,
        projectId: 'project1',
        projectTitle: 'Website Redesign',
        projectType: 'one-time',
        projectStatus: 'in-progress',
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        progress: 65,
        lastUpdate: new Date('2024-01-18'),
      },
      {
        id: 'proj2',
        clientId: clientId,
        projectId: 'project2',
        projectTitle: 'Mobile App Development',
        projectType: 'ongoing',
        projectStatus: 'planning',
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        startDate: new Date('2024-02-01'),
        progress: 15,
        lastUpdate: new Date('2024-01-20'),
      },
    ]

    setClient(mockClient)
    setViewCodes(mockViewCodes)
    setCommunications(mockCommunications)
    setNotes(mockNotes)
    setProjects(mockProjects)
    setLoading(false)
  }, [clientId])

  const handleGenerateCode = async () => {
    // TODO: Implement code generation
    alert('Code generation functionality coming soon!')
  }

  const handleRevokeCode = async (codeId: string) => {
    // TODO: Implement code revocation
    alert('Code revocation functionality coming soon!')
  }

  const handleSendEmail = () => {
    // TODO: Implement email sending
    alert('Email functionality coming soon!')
  }

  const handleSendSMS = () => {
    // TODO: Implement SMS sending
    alert('SMS functionality coming soon!')
  }

  const handleEditClient = () => {
    setIsEditing(true)
    setEditData({
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      position: client?.position || '',
      assignedManagerId: client?.assignedManagerId || '',
      assignedManagerName: client?.assignedManagerName || '',
      assignedManagerTitle: client?.assignedManagerTitle || '',
      status: client?.status || 'active',
      notes: client?.notes || '',
      tags: client?.tags || [],
    })
    setSaveError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({})
    setSaveError(null)
  }

  const handleSaveEdit = async () => {
    if (!client || !user) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const updatedClient: Partial<Client> = {
        name: editData.name?.trim(),
        email: editData.email?.trim().toLowerCase(),
        phone: editData.phone?.trim() || undefined,
        company: editData.company?.trim() || undefined,
        position: editData.position?.trim() || undefined,
        assignedManagerId: editData.assignedManagerId,
        assignedManagerName: editData.assignedManagerName,
        assignedManagerTitle: editData.assignedManagerTitle,
        status: editData.status,
        notes: editData.notes?.trim() || undefined,
        tags: editData.tags && editData.tags.length > 0 ? editData.tags : undefined,
        updatedAt: new Date(),
      }

      await updateClient(client.id, updatedClient, user.uid)
      
      // Update the client state
      setClient({
        ...client,
        ...updatedClient,
      })
      
      setIsEditing(false)
      setEditData({})
    } catch (err) {
      console.error('Error updating client:', err)
      setSaveError(err instanceof Error ? err.message : 'Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Client, value: string | string[]) => {
    setEditData(prev => ({ ...prev, [field]: value }))
    setSaveError(null)
  }

  const handleAddTag = (newTag: string) => {
    if (newTag.trim() && !editData.tags?.includes(newTag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleEditManager = () => {
    setIsEditingManager(true)
    setEditData(prev => ({
      ...prev,
      assignedManagerId: client?.assignedManagerId || '',
      assignedManagerName: client?.assignedManagerName || '',
      assignedManagerTitle: client?.assignedManagerTitle || '',
    }))
    setSaveError(null)
  }

  const handleCancelEditManager = () => {
    setIsEditingManager(false)
    setEditData(prev => ({
      ...prev,
      assignedManagerId: client?.assignedManagerId || '',
      assignedManagerName: client?.assignedManagerName || '',
      assignedManagerTitle: client?.assignedManagerTitle || '',
    }))
    setSaveError(null)
  }

  const handleSaveManager = async () => {
    if (!client || !user) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const updatedClient: Partial<Client> = {
        assignedManagerId: editData.assignedManagerId,
        assignedManagerName: editData.assignedManagerName,
        assignedManagerTitle: editData.assignedManagerTitle,
        updatedAt: new Date(),
      }

      await updateClient(client.id, updatedClient, user.uid)
      
      // Update the client state
      setClient({
        ...client,
        ...updatedClient,
      })
      
      setIsEditingManager(false)
    } catch (err) {
      console.error('Error updating manager:', err)
      setSaveError(err instanceof Error ? err.message : 'Failed to update manager')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManagerChange = (managerId: string) => {
    const manager = teamMembers.find(m => m.id === managerId)
    setEditData(prev => ({
      ...prev,
      assignedManagerId: managerId,
      assignedManagerName: manager?.name || '',
      assignedManagerTitle: manager?.title || '',
    }))
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Client not found
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {client.company} • {client.position}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSendEmail}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            variant="outline"
            onClick={handleSendSMS}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            SMS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Projects' },
            { id: 'communications', label: 'Communications' },
            { id: 'notes', label: 'Notes' },
            { id: 'access', label: 'Access Codes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'projects' | 'communications' | 'notes' | 'access')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Info */}
            <Card className="lg:col-span-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Client Information
                  </CardTitle>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleEditClient}
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name *
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter client name"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{client.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    {isEditing ? (
                      <Select 
                        value={editData.status || 'active'} 
                        onValueChange={(value: 'active' | 'inactive' | 'prospect') => handleInputChange('status', value)}
                      >
                        <SelectTrigger className="mt-1 focus:ring-purple-500 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">{getStatusBadge(client.status)}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email *
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="client@company.com"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {client.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter company name"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {client.company || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., CEO, CTO, Project Manager"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{client.position || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="mt-1 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add notes about this client..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white mt-1">
                      {client.notes || 'No notes added'}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          className="flex-1 focus:ring-purple-500 focus:border-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              handleAddTag(input.value)
                              input.value = ''
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.tags?.map((tag) => (
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
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.tags && client.tags.length > 0 ? (
                        client.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manager Info */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Assigned Manager
                  </CardTitle>
                  {isEditingManager ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveManager}
                        disabled={isSaving}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEditManager}
                        disabled={isSaving}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleEditManager}
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manager
                  </label>
                  {isEditingManager ? (
                    <Select 
                      value={editData.assignedManagerId || ''} 
                      onValueChange={handleManagerChange}
                    >
                      <SelectTrigger className="mt-1 focus:ring-purple-500 focus:border-purple-500">
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
                  ) : (
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {client.assignedManagerName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {client.assignedManagerTitle || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Contact
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {client.lastContactDate 
                      ? formatDate(client.lastContactDate)
                      : 'Never'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Project Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {client.totalProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {client.activeProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {client.completedProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'projects' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Linked Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No projects linked to this client.
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {project.projectTitle}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Badge variant="outline">{project.projectType}</Badge>
                            </span>
                            <span className="flex items-center gap-1">
                              {getStatusBadge(project.projectStatus)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.startDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.progress}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Complete
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'communications' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No communications recorded.
                </p>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{comm.type}</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {comm.sentByName}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(comm.timestamp)}
                            </span>
                          </div>
                          {comm.subject && (
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {comm.subject}
                            </h4>
                          )}
                          <p className="text-gray-700 dark:text-gray-300">
                            {comm.content}
                          </p>
                        </div>
                        <Badge
                          className={
                            comm.status === 'delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : comm.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }
                        >
                          {comm.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-purple-600" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No notes recorded.
                </p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {note.createdByName}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(note.createdAt)}
                          </span>
                          {note.isPrivate && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'access' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                Access Codes
              </CardTitle>
              <CardDescription>
                Manage 4-character codes for client view access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generate New Code */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerateCode}
                  className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Code
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Access Type:
                  </span>
                  <Select defaultValue="code">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Existing Codes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Active Codes
                </h3>
                {viewCodes.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No access codes generated yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {viewCodes.map((code) => (
                      <div
                        key={code.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Code:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {code.code}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyCode(code.code)}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                                >
                                  {copiedCode === code.code ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Type:
                              </span>
                              <Badge variant="outline">{code.accessType}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Status:
                              </span>
                              <div className="flex items-center gap-1">
                                {code.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">
                                  {code.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right text-sm">
                              <div className="text-gray-600 dark:text-gray-400">
                                Used {code.usageCount} times
                              </div>
                              {code.lastUsedAt && (
                                <div className="text-gray-600 dark:text-gray-400">
                                  Last: {formatDate(code.lastUsedAt)}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeCode(code.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {code.expiresAt && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Expires: {formatDate(code.expiresAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 