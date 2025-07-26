import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/Auth/LoginForm'
import SignupForm from '@/components/Auth/SignupForm'
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm'
import {
  signInWithEmail,
  createUserAccount,
  sendPasswordReset,
  validateClientViewCode,
  signInAnonymouslyForClient,
  getUserProfile,
  getRedirectPath,
} from '@/lib/auth'

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signInWithEmail: jest.fn(),
  createUserAccount: jest.fn(),
  sendPasswordReset: jest.fn(),
  validateClientViewCode: jest.fn(),
  signInAnonymouslyForClient: jest.fn(),
  getUserProfile: jest.fn(),
  getRedirectPath: jest.fn(),
}))

const mockSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>
const mockCreateUserAccount = createUserAccount as jest.MockedFunction<typeof createUserAccount>
const mockSendPasswordReset = sendPasswordReset as jest.MockedFunction<typeof sendPasswordReset>
const mockValidateClientViewCode = validateClientViewCode as jest.MockedFunction<typeof validateClientViewCode>
const mockSignInAnonymouslyForClient = signInAnonymouslyForClient as jest.MockedFunction<typeof signInAnonymouslyForClient>
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>
const mockGetRedirectPath = getRedirectPath as jest.MockedFunction<typeof getRedirectPath>

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with all fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, '123')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    const mockUser = { uid: 'test-uid' }
    const mockProfile = { uid: 'test-uid', role: 'admin' }
    
    mockSignInWithEmail.mockResolvedValue({ user: mockUser } as any)
    mockGetUserProfile.mockResolvedValue(mockProfile)
    mockGetRedirectPath.mockReturnValue('/dashboard')
    
    render(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123', false)
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    mockSignInWithEmail.mockRejectedValue({ code: 'auth/user-not-found' })
    
    render(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/no account found with this email address/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByLabelText(/show password/i)
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders signup form with all fields', () => {
    render(<SignupForm />)
    
    expect(screen.getByText('Create account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
  })

  it('shows validation error for password mismatch', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    await user.type(screen.getByLabelText(/password/i), 'weak')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  it('handles successful signup', async () => {
    const user = userEvent.setup()
    const mockUser = { uid: 'test-uid' }
    const mockProfile = { uid: 'test-uid', role: 'team_member' }
    
    mockCreateUserAccount.mockResolvedValue({ user: mockUser } as any)
    mockGetUserProfile.mockResolvedValue(mockProfile)
    mockGetRedirectPath.mockReturnValue('/tasks')
    
    render(<SignupForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.type(screen.getByLabelText(/job title/i), 'Developer')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockCreateUserAccount).toHaveBeenCalledWith(
        'test@example.com',
        'Password123',
        'team_member',
        'Developer',
        undefined
      )
    })
  })

  it('handles signup error', async () => {
    const user = userEvent.setup()
    mockCreateUserAccount.mockRejectedValue({ code: 'auth/email-already-in-use' })
    
    render(<SignupForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.type(screen.getByLabelText(/job title/i), 'Developer')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument()
    })
  })
})

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders reset password form', () => {
    render(<ResetPasswordForm />)
    
    expect(screen.getByText('Reset password')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('handles successful password reset', async () => {
    const user = userEvent.setup()
    mockSendPasswordReset.mockResolvedValue()
    
    render(<ResetPasswordForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('handles password reset error', async () => {
    const user = userEvent.setup()
    mockSendPasswordReset.mockRejectedValue({ code: 'auth/user-not-found' })
    
    render(<ResetPasswordForm />)
    
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/no account found with this email address/i)).toBeInTheDocument()
    })
  })

  it('allows retry after success', async () => {
    const user = userEvent.setup()
    mockSendPasswordReset.mockResolvedValue()
    
    render(<ResetPasswordForm />)
    
    // Submit form
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    
    // Click try again
    await user.click(screen.getByRole('button', { name: /try again/i }))
    
    expect(screen.getByText('Reset password')).toBeInTheDocument()
  })
})

describe('Auth Utilities', () => {
  describe('getRedirectPath', () => {
    it('returns correct paths for different roles', () => {
      expect(getRedirectPath('admin')).toBe('/dashboard')
      expect(getRedirectPath('team_member')).toBe('/tasks')
      expect(getRedirectPath('client')).toBe('/view')
    })
  })

  describe('validateClientViewCode', () => {
    it('validates valid codes', async () => {
      const mockCodeData = {
        code: 'AB12',
        projectId: 'project-123',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
        createdAt: new Date(),
        createdBy: 'user-123',
      }
      
      mockValidateClientViewCode.mockResolvedValue(mockCodeData)
      
      const result = await validateClientViewCode('AB12')
      expect(result).toEqual(mockCodeData)
    })

    it('returns null for invalid codes', async () => {
      mockValidateClientViewCode.mockResolvedValue(null)
      
      const result = await validateClientViewCode('INVALID')
      expect(result).toBeNull()
    })
  })
}) 