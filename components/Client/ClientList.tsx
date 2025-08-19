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
  Building2, 
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import { Client } from '@/types'
import ClientActions from './ClientActions'

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
              inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-border',
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
            <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
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
                index !== clients.length - 1 ? 'border-b border-border/50' : ''
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
                <div className="flex items-center justify-end">
                  <ClientActions 
                    client={client}
                    onSendEmail={handleSendEmail}
                    onSendSMS={handleSendSMS}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 