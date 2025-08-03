'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, Building2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Client } from '@/types'
import ClientList from '@/components/Client/ClientList'
import { getGradientColors } from '@/lib/dashboard'

/**
 * Clients Dashboard Page
 * Displays a searchable and filterable list of clients with quick actions
 */
export default function ClientsPage() {
  // Client data
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [managerFilter, setManagerFilter] = useState<string>('all')
  const [gradient, setGradient] = useState(getGradientColors())

  // Mock data for development
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: '1',
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
        notes: 'Key decision maker for all technical projects',
        tags: ['enterprise', 'technical'],
        lastContactDate: new Date('2024-01-18'),
        totalProjects: 5,
        activeProjects: 2,
        completedProjects: 3,
      },
      {
        id: '2',
        organizationId: 'org1',
        name: 'Emily Davis',
        email: 'emily.davis@startup.io',
        phone: '+1 (555) 987-6543',
        company: 'Startup.io',
        position: 'CEO',
        assignedManagerId: 'manager2',
        assignedManagerName: 'Mike Chen',
        assignedManagerTitle: 'Project Manager',
        status: 'active',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-05'),
        notes: 'Fast-growing startup, needs quick turnaround',
        tags: ['startup', 'urgent'],
        lastContactDate: new Date('2024-02-03'),
        totalProjects: 3,
        activeProjects: 1,
        completedProjects: 2,
      },
      {
        id: '3',
        organizationId: 'org1',
        name: 'Robert Wilson',
        email: 'robert.wilson@consulting.com',
        phone: '+1 (555) 456-7890',
        company: 'Wilson Consulting',
        position: 'Managing Director',
        assignedManagerId: 'manager1',
        assignedManagerName: 'Sarah Johnson',
        assignedManagerTitle: 'Senior Project Manager',
        status: 'prospect',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        notes: 'Interested in ongoing partnership',
        tags: ['prospect', 'consulting'],
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
      },
    ]

    setClients(mockClients)
    setFilteredClients(mockClients)
  }, [])

  // Dynamic gradient updates
  useEffect(() => {
    setGradient(getGradientColors())
    const interval = setInterval(() => {
      setGradient(getGradientColors())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Filter clients based on search and filters
  useEffect(() => {
    let filtered = clients

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter)
    }

    // Manager filter
    if (managerFilter !== 'all') {
      filtered = filtered.filter(client => client.assignedManagerId === managerFilter)
    }

    setFilteredClients(filtered)
  }, [clients, searchTerm, statusFilter, managerFilter])

  const getStatusOptions = () => {
    const statuses = Array.from(new Set(clients.map(client => client.status)))
    return [
      { value: 'all', label: 'All Statuses' },
      ...statuses.map(status => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      }))
    ]
  }

  const getManagerOptions = () => {
    const managers = Array.from(new Set(clients.map(client => client.assignedManagerId)))
    return [
      { value: 'all', label: 'All Managers' },
      ...managers.map(managerId => {
        const client = clients.find(c => c.assignedManagerId === managerId)
        return {
          value: managerId,
          label: client?.assignedManagerName || 'Unknown Manager'
        }
      })
    ]
  }

  const getClientStats = () => {
    const totalClients = clients.length
    const activeClients = clients.filter(client => client.status === 'active').length
    const prospects = clients.filter(client => client.status === 'prospect').length
    const totalProjects = clients.reduce((sum, client) => sum + client.totalProjects, 0)

    return { totalClients, activeClients, prospects, totalProjects }
  }

  const handleAddClient = () => {
    // TODO: Implement add client functionality
    alert('Add client functionality coming soon!')
  }

  const stats = getClientStats()

  return (
    <div className="p-6" style={{
      background: `linear-gradient(135deg, ${gradient.from}10, ${gradient.to}05)`,
      minHeight: 'calc(100vh - 4rem)'
    }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
        <p className="text-muted-foreground">Manage your client relationships and project access.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Client Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger className="focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400">
                <SelectValue placeholder="Manager" />
              </SelectTrigger>
              <SelectContent>
                {getManagerOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleAddClient}
          className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            {filteredClients.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientList clients={filteredClients} />
        </CardContent>
      </Card>
    </div>
  )
} 