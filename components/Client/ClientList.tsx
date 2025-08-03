'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Eye, 
  Mail, 
  MessageSquare, 
  Building2, 
  Calendar,
  Phone,
  ExternalLink
} from 'lucide-react'
import { Client } from '@/types'

interface ClientListProps {
  clients: Client[]
}

/**
 * ClientList Component
 * Displays clients in a searchable, filterable table with quick actions
 */
export default function ClientList({ clients }: ClientListProps) {
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
    }).format(date)
  }

  const handleSendEmail = (client: Client) => {
    // TODO: Implement email sending functionality
    alert('Email functionality coming soon!')
  }

  const handleSendSMS = (client: Client) => {
    // TODO: Implement SMS sending functionality
    alert('SMS functionality coming soon!')
  }

  const handleViewClient = (clientId: string) => {
    // Navigation handled by Link component
  }

  if (clients.length === 0) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Client Directory</span>
          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Client
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Company
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Manager
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Status
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Projects
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white">
                  Last Contact
                </TableHead>
                <TableHead className="font-medium text-gray-900 dark:text-white text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {client.company || '—'}
                      </div>
                      {client.position && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {client.position}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {client.assignedManagerName}
                      </div>
                      {client.assignedManagerTitle && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {client.assignedManagerTitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(client.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {client.totalProjects}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400"> total</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {client.activeProjects} active, {client.completedProjects} completed
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {client.lastContactDate 
                          ? formatDate(client.lastContactDate)
                          : 'Never'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendEmail(client)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendSMS(client)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                        title="Send SMS"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Link href={`/clients/${client.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                          title="View Client"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/view/${client.id}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                          title="Client View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 