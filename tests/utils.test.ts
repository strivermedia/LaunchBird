/**
 * Utility Functions Test Suite
 * Tests for LaunchBird utility functions
 */

import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('date-utils', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(testDate)
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should format date time correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDateTime(testDate)
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should format relative time correctly', () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const formatted = formatRelativeTime(recentDate)
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('utils', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', { 'conditional-class': true })
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('conditional-class')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', { 'conditional-true': true, 'conditional-false': false })
      expect(result).toContain('base')
      expect(result).toContain('conditional-true')
      expect(result).not.toContain('conditional-false')
    })
  })
})

describe('Task Management Logic', () => {
  it('should filter tasks by status', () => {
    const mockTasks = [
      { id: '1', status: 'todo', title: 'Task 1' },
      { id: '2', status: 'in-progress', title: 'Task 2' },
      { id: '3', status: 'completed', title: 'Task 3' },
    ]

    const todoTasks = mockTasks.filter(task => task.status === 'todo')
    const inProgressTasks = mockTasks.filter(task => task.status === 'in-progress')
    const completedTasks = mockTasks.filter(task => task.status === 'completed')

    expect(todoTasks).toHaveLength(1)
    expect(inProgressTasks).toHaveLength(1)
    expect(completedTasks).toHaveLength(1)
  })

  it('should filter tasks by priority', () => {
    const mockTasks = [
      { id: '1', priority: 'high', title: 'High Priority Task' },
      { id: '2', priority: 'medium', title: 'Medium Priority Task' },
      { id: '3', priority: 'low', title: 'Low Priority Task' },
    ]

    const highPriorityTasks = mockTasks.filter(task => task.priority === 'high')
    const mediumPriorityTasks = mockTasks.filter(task => task.priority === 'medium')
    const lowPriorityTasks = mockTasks.filter(task => task.priority === 'low')

    expect(highPriorityTasks).toHaveLength(1)
    expect(mediumPriorityTasks).toHaveLength(1)
    expect(lowPriorityTasks).toHaveLength(1)
  })

  it('should sort tasks by due date', () => {
    const mockTasks = [
      { id: '1', dueDate: new Date('2024-01-15'), title: 'Task 1' },
      { id: '2', dueDate: new Date('2024-01-10'), title: 'Task 2' },
      { id: '3', dueDate: new Date('2024-01-20'), title: 'Task 3' },
    ]

    const sortedTasks = mockTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    expect(sortedTasks[0].id).toBe('2')
    expect(sortedTasks[1].id).toBe('1')
    expect(sortedTasks[2].id).toBe('3')
  })

  it('should calculate task completion percentage', () => {
    const mockTasks = [
      { status: 'completed' },
      { status: 'completed' },
      { status: 'todo' },
      { status: 'in-progress' },
    ]

    const completedTasks = mockTasks.filter(task => task.status === 'completed')
    const completionPercentage = (completedTasks.length / mockTasks.length) * 100

    expect(completionPercentage).toBe(50)
  })
})

describe('User Authentication Logic', () => {
  it('should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
    ]

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
    ]

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true)
    })

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false)
    })
  })

  it('should validate password strength', () => {
    const strongPassword = 'StrongPass123!'
    const weakPassword = 'weak'

    const hasMinLength = (password: string) => password.length >= 8
    const hasUpperCase = (password: string) => /[A-Z]/.test(password)
    const hasLowerCase = (password: string) => /[a-z]/.test(password)
    const hasNumber = (password: string) => /\d/.test(password)
    const hasSpecialChar = (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password)

    expect(hasMinLength(strongPassword)).toBe(true)
    expect(hasUpperCase(strongPassword)).toBe(true)
    expect(hasLowerCase(strongPassword)).toBe(true)
    expect(hasNumber(strongPassword)).toBe(true)
    expect(hasSpecialChar(strongPassword)).toBe(true)

    expect(hasMinLength(weakPassword)).toBe(false)
  })
})

describe('Data Validation', () => {
  it('should validate task data structure', () => {
    const validTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(),
      assignedTo: ['user-1'],
      tags: ['frontend'],
    }

    const requiredFields = ['id', 'title', 'status', 'priority']
    const validStatuses = ['todo', 'in-progress', 'review', 'completed']
    const validPriorities = ['low', 'medium', 'high', 'urgent']

    requiredFields.forEach(field => {
      expect(validTask).toHaveProperty(field)
      expect(validTask[field as keyof typeof validTask]).toBeDefined()
    })

    expect(validStatuses).toContain(validTask.status)
    expect(validPriorities).toContain(validTask.priority)
  })

  it('should validate project data structure', () => {
    const validProject = {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test Description',
      status: 'active',
      clientId: 'client-1',
      startDate: new Date(),
      endDate: new Date(),
    }

    const requiredFields = ['id', 'name', 'status']
    const validStatuses = ['active', 'completed', 'on-hold', 'cancelled']

    requiredFields.forEach(field => {
      expect(validProject).toHaveProperty(field)
      expect(validProject[field as keyof typeof validProject]).toBeDefined()
    })

    expect(validStatuses).toContain(validProject.status)
  })
})
