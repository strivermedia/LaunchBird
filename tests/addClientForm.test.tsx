import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddClientForm from '@/components/Client/AddClientForm'

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

// Mock the createClient function
jest.mock('@/lib/clients', () => ({
  createClient: jest.fn().mockResolvedValue('new-client-id')
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('AddClientForm', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Check for required fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByText(/assigned manager/i)).toBeInTheDocument()
    
    // Check for optional fields
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /create client/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

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
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      const errorText = screen.getByText(/please enter a valid email address/i)
      expect(errorText).toBeInTheDocument()
      expect(errorText.textContent).toContain('Client name is required')
    })
  })

  it('allows adding and removing tags', () => {
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const tagInput = screen.getByPlaceholderText(/add a tag/i)
    const addButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg[class*="plus"]')
    )

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'important' } })
    fireEvent.click(addButton!)

    // Check if tag is displayed
    expect(screen.getByText('important')).toBeInTheDocument()

    // Remove the tag
    const removeButton = screen.getByText('important').parentElement?.querySelector('button')
    fireEvent.click(removeButton!)

    // Check if tag is removed
    expect(screen.queryByText('important')).not.toBeInTheDocument()
  })

  it('closes the form when cancel is clicked', () => {
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles form submission successfully', async () => {
    const { createClient } = require('@/lib/clients')
    
    render(<AddClientForm onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Fill out required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' }
    })

    // Select a manager (first option)
    const managerSelect = screen.getByText(/assigned manager/i).closest('div')?.querySelector('button')
    fireEvent.click(managerSelect!)
    
    // Wait for dropdown to appear and select first option
    await waitFor(() => {
      const firstOption = screen.getByText('Sarah Johnson')
      fireEvent.click(firstOption)
    })

    // Submit form
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          organizationId: 'test-org-123'
        }),
        'test-user-123'
      )
      expect(mockOnSuccess).toHaveBeenCalledWith('new-client-id')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
}) 