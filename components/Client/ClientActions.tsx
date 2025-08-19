'use client'

import React from 'react'
import Link from 'next/link'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal,
  Mail, 
  MessageSquare, 
  Eye, 
  ExternalLink,
  Copy
} from 'lucide-react'
import { Client } from '@/types'
import { createClientAccessCode } from '@/lib/client-profile'

interface ClientActionsProps {
  client: Client
  onSendEmail: (client: Client) => void
  onSendSMS: (client: Client) => void
}

/**
 * ClientActions Component
 * Dropdown menu containing all available actions for a client
 */
export default function ClientActions({ 
  client, 
  onSendEmail, 
  onSendSMS 
}: ClientActionsProps) {
  const handleClientView = async () => {
    try {
      // Get or create client access code
      const accessCode = await createClientAccessCode(
        'project-id',
        client.organizationId,
        'user-id'
      )
      
      // Open client profile in new tab
      window.open(`/profile/${accessCode}`, '_blank')
    } catch (error) {
      console.error('Error creating client access:', error)
      alert('Failed to create client access. Please try again.')
    }
  }

  const handleCopyAccessCode = async () => {
    try {
      // Get or create client access code
      const accessCode = await createClientAccessCode(
        'project-id',
        client.organizationId,
        'user-id'
      )
      
      // Copy to clipboard
      await navigator.clipboard.writeText(accessCode)
      alert(`Access code ${accessCode} copied to clipboard!`)
    } catch (error) {
      console.error('Error copying access code:', error)
      alert('Failed to copy access code. Please try again.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onSendEmail(client)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Mail className="h-4 w-4 text-blue-600" />
          <span>Send Email</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onSendSMS(client)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <MessageSquare className="h-4 w-4 text-green-600" />
          <span>Send SMS</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            href={`/clients/${client.id}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Eye className="h-4 w-4 text-purple-600" />
            <span>View Client</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleClientView}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 text-orange-600" />
          <span>Client Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleCopyAccessCode}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Copy className="h-4 w-4 text-blue-600" />
          <span>Copy Access Code</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
