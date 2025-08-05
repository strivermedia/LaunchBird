import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditClientForm from '@/components/Client/EditClientForm'
import { Client } from '@/types'

// Mock the useAuth hook
jest.mock('@/lib/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-123',
      email: 'test@example.com',
      organizationId: 'test-org-123',
      role: 'admin'
    },
    loading: false
  })
}))

// Mock the updateClient function
jest.mock('@/lib/clients', () => ({
  updateClient: jest.fn().mockResolvedValue(undefined)
}))

describe('EditClientForm', () => {
  const mockClient: Client = {
    id: 'client-123',
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
  }

  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with pre-filled client data', () => {
    render(<EditClientForm client={mockClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Check for pre-filled fields
    expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.smith@acme.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1 (555) 123-4567')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Acme Corporation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CTO')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Key decision maker for all technical projects')).toBeInTheDocument()
    
    // Check for existing tags
    expect(screen.getByText('enterprise')).toBeInTheDocument()
    expect(screen.getByText('technical')).toBeInTheDocument()
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /update client/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows validation errors for required fields when form is empty', async () => {
    const emptyClient: Client = {
      ...mockClient,
      name: '',
      email: '',
      assignedManagerId: '',
    }

    render(<EditClientForm client={emptyClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      const errorText = screen.getByText(/client name is required/i)
      expect(errorText).toBeInTheDocument()
      expect(errorText.textContent).toContain('Email is required')
      expect(errorText.textContent).toContain('Please assign a manager')
    })
  })

  it('validates email format', async () => {
    const invalidEmailClient: Client = {
      ...mockClient,
      email: 'invalid-email',
    }

    render(<EditClientForm client={invalidEmailClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      const errorText = screen.getByText(/please enter a valid email address/i)
      expect(errorText).toBeInTheDocument()
    })
  })

  it('allows adding tags and displays existing tags', () => {
    render(<EditClientForm client={mockClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const tagInput = screen.getByPlaceholderText(/add a tag/i)
    const addButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg[class*="plus"]')
    )

    // Check existing tags are displayed
    expect(screen.getByText('enterprise')).toBeInTheDocument()
    expect(screen.getByText('technical')).toBeInTheDocument()

    // Add a new tag
    fireEvent.change(tagInput, { target: { value: 'important' } })
    fireEvent.click(addButton!)

    // Check if new tag is displayed
    expect(screen.getByText('important')).toBeInTheDocument()
  })

  it('closes the form when cancel is clicked', () => {
    render(<EditClientForm client={mockClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles form submission successfully', async () => {
    const { updateClient } = require('@/lib/clients')
    
    render(<EditClientForm client={mockClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Update some fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe Updated' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john.updated@acme.com' }
    })

    // Submit form
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(updateClient).toHaveBeenCalledWith(
        'client-123',
        expect.objectContaining({
          name: 'John Doe Updated',
          email: 'john.updated@acme.com',
        }),
        'test-user-123'
      )
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'client-123',
          name: 'John Doe Updated',
          email: 'john.updated@acme.com',
        })
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles manager assignment change', async () => {
    const { updateClient } = require('@/lib/clients')
    
    render(<EditClientForm client={mockClient} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Select a different manager
    const managerSelect = screen.getByText(/assigned manager/i).closest('div')?.querySelector('button')
    fireEvent.click(managerSelect!)
    
    // Wait for dropdown to appear and select second option
    await waitFor(() => {
      const secondOption = screen.getByText('Mike Chen')
      fireEvent.click(secondOption)
    })

    // Submit form
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(updateClient).toHaveBeenCalledWith(
        'client-123',
        expect.objectContaining({
          assignedManagerId: 'manager2',
          assignedManagerName: 'Mike Chen',
          assignedManagerTitle: 'Project Manager',
        }),
        'test-user-123'
      )
    })
  })
}) 