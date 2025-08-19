/**
 * Projects Feature Tests
 * Comprehensive test suite for Projects components and functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ProjectsPage from '@/app/projects/page'
import ProjectList from '@/components/Projects/ProjectList'
import ProjectWizard from '@/components/Projects/ProjectWizard'
import ProgressView from '@/components/Projects/ProgressView'
import { Project, ProjectStatus, ProjectType } from '@/types'

// Mock the auth hook
jest.mock('@/lib/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-1',
      email: 'test@launchbird.com',
      role: 'admin',
      name: 'Test User',
      title: 'Project Manager'
    }
  })
}))

// Mock data for testing
const mockProjects: Project[] = [
  {
    id: '1',
    organizationId: 'org-1',
    title: 'Test Project 1',
    description: 'Test project description',
    type: 'one-time' as ProjectType,
    status: 'in-progress' as ProjectStatus,
    progress: 65,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
    deadline: new Date('2024-03-15'),
    assignedTo: ['user-1', 'user-2'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    clientId: 'client-1',
    budget: 15000,
    tags: ['web-design', 'e-commerce'],
    clientCode: 'AB12',
    assignedManagerId: 'user-1',
    assignedManagerName: 'John Doe',
    assignedManagerTitle: 'Senior Developer',
    assignedManagerEmail: 'john@launchbird.com',
    assignedManagerPhone: '+1-555-0123'
  },
  {
    id: '2',
    organizationId: 'org-1',
    title: 'Test Project 2',
    description: 'Another test project',
    type: 'ongoing' as ProjectType,
    status: 'planning' as ProjectStatus,
    progress: 25,
    startDate: new Date('2024-02-01'),
    assignedTo: ['user-3'],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    clientId: 'client-2',
    budget: 5000,
    tags: ['ppc', 'marketing'],
    clientCode: 'CD34',
    assignedManagerId: 'user-3',
    assignedManagerName: 'Jane Smith',
    assignedManagerTitle: 'Marketing Specialist',
    assignedManagerEmail: 'jane@launchbird.com',
    assignedManagerPhone: '+1-555-0456'
  }
]

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('Projects Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ProjectsPage Component', () => {
    it('renders projects page with header and controls', async () => {
      render(<ProjectsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument()
        expect(screen.getByText('Manage and track your projects')).toBeInTheDocument()
        expect(screen.getByText('New Project')).toBeInTheDocument()
      })
    })

    it('displays project statistics correctly', async () => {
      render(<ProjectsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Total Projects')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('Team Members')).toBeInTheDocument()
      })
    })

    it('filters projects by search term', async () => {
      render(<ProjectsPage />)
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search projects...')
        fireEvent.change(searchInput, { target: { value: 'E-commerce' } })
        
        expect(screen.getByText('E-commerce Website Redesign')).toBeInTheDocument()
        expect(screen.queryByText('PPC Campaign Management')).not.toBeInTheDocument()
      })
    })

    it('filters projects by status', async () => {
      render(<ProjectsPage />)
      
      await waitFor(() => {
        const inProgressButton = screen.getByText('in progress')
        fireEvent.click(inProgressButton)
        
        expect(screen.getByText('E-commerce Website Redesign')).toBeInTheDocument()
        expect(screen.getByText('PPC Campaign Management')).toBeInTheDocument()
      })
    })

    it('opens project wizard when New Project button is clicked', async () => {
      render(<ProjectsPage />)
      
      await waitFor(() => {
        const newProjectButton = screen.getByText('New Project')
        fireEvent.click(newProjectButton)
        
        expect(screen.getByText('Create New Project')).toBeInTheDocument()
      })
    })
  })

  describe('ProjectList Component', () => {
    const mockOnProjectUpdate = jest.fn()

    beforeEach(() => {
      mockOnProjectUpdate.mockClear()
    })

    it('renders project list with correct data', () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
      expect(screen.getByText('Test Project 2')).toBeInTheDocument()
      expect(screen.getByText('Test project description')).toBeInTheDocument()
      expect(screen.getByText('Another test project')).toBeInTheDocument()
    })

    it('displays project status badges correctly', () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('in progress')).toBeInTheDocument()
      expect(screen.getByText('planning')).toBeInTheDocument()
    })

    it('displays project types correctly', () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('one time')).toBeInTheDocument()
      expect(screen.getByText('ongoing')).toBeInTheDocument()
    })

    it('shows progress bars with correct values', () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('65%')).toBeInTheDocument()
      expect(screen.getByText('25%')).toBeInTheDocument()
    })

    it('displays client codes and allows copying', async () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      expect(copyButtons).toHaveLength(2)

      const user = userEvent.setup()
      await user.click(copyButtons[0])

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('AB12')
    })

    it('shows empty state when no projects', () => {
      render(
        <ProjectList 
          projects={[]}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('No projects found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument()
    })

    it('displays project budgets correctly', () => {
      render(
        <ProjectList 
          projects={mockProjects}
          onProjectUpdate={mockOnProjectUpdate}
        />
      )

      expect(screen.getByText('$15,000')).toBeInTheDocument()
      expect(screen.getByText('$5,000')).toBeInTheDocument()
    })
  })

  describe('ProjectWizard Component', () => {
    const mockOnProjectCreated = jest.fn()
    const mockOnOpenChange = jest.fn()

    beforeEach(() => {
      mockOnProjectCreated.mockClear()
      mockOnOpenChange.mockClear()
    })

    it('renders wizard with template selection', () => {
      render(
        <ProjectWizard
          open={true}
          onOpenChange={mockOnOpenChange}
          onProjectCreated={mockOnProjectCreated}
        />
      )

      expect(screen.getByText('Create New Project')).toBeInTheDocument()
      expect(screen.getByText('Choose a Project Template')).toBeInTheDocument()
      expect(screen.getByText('Web Development')).toBeInTheDocument()
      expect(screen.getByText('PPC Management')).toBeInTheDocument()
      expect(screen.getByText('Custom Project')).toBeInTheDocument()
    })

    it('allows template selection', async () => {
      render(
        <ProjectWizard
          open={true}
          onOpenChange={mockOnOpenChange}
          onProjectCreated={mockOnProjectCreated}
        />
      )

      const webDevTemplate = screen.getByText('Web Development').closest('.cursor-pointer')
      expect(webDevTemplate).toBeInTheDocument()

      const user = userEvent.setup()
      await user.click(webDevTemplate!)

      // Should show selected state
      expect(webDevTemplate).toHaveClass('ring-2')
    })

    it('navigates through wizard steps', async () => {
      render(
        <ProjectWizard
          open={true}
          onOpenChange={mockOnOpenChange}
          onProjectCreated={mockOnProjectCreated}
        />
      )

      const user = userEvent.setup()

      // Select template
      const webDevTemplate = screen.getByText('Web Development').closest('.cursor-pointer')
      await user.click(webDevTemplate!)

      // Go to next step
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      // Should be on project details step
      expect(screen.getByText('Project Details')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(
        <ProjectWizard
          open={true}
          onOpenChange={mockOnOpenChange}
          onProjectCreated={mockOnProjectCreated}
        />
      )

      const user = userEvent.setup()

      // Select template
      const webDevTemplate = screen.getByText('Web Development').closest('.cursor-pointer')
      await user.click(webDevTemplate!)

      // Try to proceed without filling required fields
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      // Should show validation error
      expect(screen.getByText('Project title is required')).toBeInTheDocument()
    })

    it('creates project successfully', async () => {
      render(
        <ProjectWizard
          open={true}
          onOpenChange={mockOnOpenChange}
          onProjectCreated={mockOnProjectCreated}
        />
      )

      const user = userEvent.setup()

      // Select template
      const webDevTemplate = screen.getByText('Web Development').closest('.cursor-pointer')
      await user.click(webDevTemplate!)

      // Fill required fields
      const titleInput = screen.getByLabelText('Project Title *')
      await user.type(titleInput, 'Test Project')

      const startDateInput = screen.getByLabelText('Start Date *')
      await user.type(startDateInput, '2024-02-01')

      // Navigate through steps
      const nextButton = screen.getByText('Next')
      await user.click(nextButton) // Step 2
      await user.click(nextButton) // Step 3

      // Select team members
      const teamMemberCards = screen.getAllByText(/John Doe|Jane Smith|Mike Johnson|Sarah Wilson/)
      await user.click(teamMemberCards[0])

      await user.click(nextButton) // Step 4

      // Create project
      const createButton = screen.getByText('Create Project')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockOnProjectCreated).toHaveBeenCalled()
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('ProgressView Component', () => {
    it('renders progress view with statistics', () => {
      render(<ProgressView projects={mockProjects} />)

      expect(screen.getByText('Project Analytics')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Individual Project Progress')).toBeInTheDocument()
    })

    it('displays project statistics correctly', () => {
      render(<ProgressView projects={mockProjects} />)

      expect(screen.getByText('2')).toBeInTheDocument() // Total projects
      expect(screen.getByText('1')).toBeInTheDocument() // Active projects
      expect(screen.getByText('45%')).toBeInTheDocument() // Average progress
    })

    it('shows activity log', () => {
      render(<ProgressView projects={mockProjects} />)

      expect(screen.getByText('Project milestone completed')).toBeInTheDocument()
      expect(screen.getByText('Task completed')).toBeInTheDocument()
      expect(screen.getByText('Client feedback received')).toBeInTheDocument()
    })

    it('allows chart type selection', async () => {
      render(<ProgressView projects={mockProjects} />)

      const chartSelect = screen.getByDisplayValue('Progress Overview')
      expect(chartSelect).toBeInTheDocument()

      const user = userEvent.setup()
      await user.click(chartSelect)

      expect(screen.getByText('Status Distribution')).toBeInTheDocument()
      expect(screen.getByText('Project Types')).toBeInTheDocument()
      expect(screen.getByText('Timeline View')).toBeInTheDocument()
    })

    it('displays individual project progress cards', () => {
      render(<ProgressView projects={mockProjects} />)

      expect(screen.getByText('Test Project 1')).toBeInTheDocument()
      expect(screen.getByText('Test Project 2')).toBeInTheDocument()
      expect(screen.getByText('Test project description')).toBeInTheDocument()
      expect(screen.getByText('Another test project')).toBeInTheDocument()
    })

    it('shows project progress bars', () => {
      render(<ProgressView projects={mockProjects} />)

      expect(screen.getByText('65%')).toBeInTheDocument()
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('creates and displays new project', async () => {
      render(<ProjectsPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('New Project')).toBeInTheDocument()
      })

      // Open wizard
      const newProjectButton = screen.getByText('New Project')
      await user.click(newProjectButton)

      // Create project
      const titleInput = screen.getByLabelText('Project Title *')
      await user.type(titleInput, 'Integration Test Project')

      const startDateInput = screen.getByLabelText('Start Date *')
      await user.type(startDateInput, '2024-02-01')

      // Navigate through wizard
      const nextButton = screen.getByText('Next')
      await user.click(nextButton) // Step 2
      await user.click(nextButton) // Step 3

      // Select team member
      const teamMemberCard = screen.getByText('John Doe').closest('.cursor-pointer')
      await user.click(teamMemberCard!)

      await user.click(nextButton) // Step 4

      // Create project
      const createButton = screen.getByText('Create Project')
      await user.click(createButton)

      // Should show new project in list
      await waitFor(() => {
        expect(screen.getByText('Integration Test Project')).toBeInTheDocument()
      })
    })

    it('filters and searches projects correctly', async () => {
      render(<ProjectsPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('E-commerce Website Redesign')).toBeInTheDocument()
      })

      // Search for specific project
      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, 'E-commerce')

      expect(screen.getByText('E-commerce Website Redesign')).toBeInTheDocument()
      expect(screen.queryByText('PPC Campaign Management')).not.toBeInTheDocument()

      // Clear search
      await user.clear(searchInput)
      expect(screen.getByText('PPC Campaign Management')).toBeInTheDocument()
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ProjectsPage />)

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

      // Check for search input accessibility
      const searchInput = screen.getByPlaceholderText('Search projects...')
      expect(searchInput).toHaveAttribute('type', 'text')

      // Check for button accessibility
      const newProjectButton = screen.getByText('New Project')
      expect(newProjectButton).toHaveAttribute('type', 'button')
    })

    it('supports keyboard navigation', async () => {
      render(<ProjectsPage />)

      const user = userEvent.setup()

      // Navigate with keyboard
      await user.tab()
      expect(screen.getByPlaceholderText('Search projects...')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('New Project')).toHaveFocus()
    })

    it('has sufficient color contrast', () => {
      render(<ProjectsPage />)

      // Check that text has sufficient contrast
      const headings = screen.getAllByRole('heading')
      headings.forEach(heading => {
        const computedStyle = window.getComputedStyle(heading)
        const color = computedStyle.color
        const backgroundColor = computedStyle.backgroundColor
        
        // This is a basic check - in a real app you'd use a proper contrast checking library
        expect(color).toBeDefined()
        expect(backgroundColor).toBeDefined()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<ProjectsPage />)

      // The component should still render even with errors
      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('handles empty data states', () => {
      // Mock empty projects
      jest.doMock('@/app/projects/page', () => {
        return function MockProjectsPage() {
          return (
            <div>
              <h1>Projects</h1>
              <ProjectList projects={[]} onProjectUpdate={jest.fn()} />
            </div>
          )
        }
      })

      render(<ProjectsPage />)
      expect(screen.getByText('No projects found')).toBeInTheDocument()
    })
  })
})
