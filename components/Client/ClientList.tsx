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
  ExternalLink,
  Copy
} from 'lucide-react'
import { Client } from '@/types'
import { getOrCreateClientAccessCode } from '@/lib/client-view'

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
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200',
      prospect: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200',
    }
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || variants.inactive} border`}>
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

  const handleClientView = async (client: Client) => {
    try {
      // Get or create client access code
      const accessCode = await getOrCreateClientAccessCode(
        client.id, 
        client.organizationId,
        30 // 30 days expiry
      )
      
      // Open client view in new tab
      window.open(`/view/${accessCode}`, '_blank')
    } catch (error) {
      console.error('Error creating client access:', error)
      alert('Failed to create client access. Please try again.')
    }
  }

  const handleCopyAccessCode = async (client: Client) => {
    try {
      // Get or create client access code
      const accessCode = await getOrCreateClientAccessCode(
        client.id, 
        client.organizationId,
        30 // 30 days expiry
      )
      
      // Copy to clipboard
      await navigator.clipboard.writeText(accessCode)
      alert(`Access code ${accessCode} copied to clipboard!`)
    } catch (error) {
      console.error('Error copying access code:', error)
      alert('Failed to copy access code. Please try again.')
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No clients found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Client
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Company
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Manager
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Status
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Projects
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
              Last Contact
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <TableRow 
              key={client.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${
                index !== clients.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}
            >
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {client.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
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
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    {client.company || '—'}
                  </div>
                  {client.position && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {client.position}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
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
              <TableCell className="py-4">
                {getStatusBadge(client.status)}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {client.totalProjects}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> total</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {client.activeProjects} active, {client.completedProjects} completed
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {client.lastContactDate 
                      ? formatDate(client.lastContactDate)
                      : 'Never'
                    }
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendEmail(client)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                    title="Send Email"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendSMS(client)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                    title="Send SMS"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Link href={`/clients/${client.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
                      title="View Client"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClientView(client)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/20"
                    title="Client View"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAccessCode(client)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                    title="Copy Access Code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 