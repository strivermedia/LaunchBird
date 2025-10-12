import { createClient } from '@supabase/supabase-js'

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Mock Supabase client for development
const createMockClient = () => ({
      auth: {
        getUser: async () => ({ 
          data: { 
            user: {
              id: 'dev-user-123',
              email: 'dev@launchbird.com',
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              role: 'authenticated',
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
          }, 
          error: null 
        }),
        signInWithPassword: async (credentials: any) => ({ 
          data: { 
            user: {
              id: 'dev-user-123',
              email: credentials?.email || 'dev@launchbird.com',
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              role: 'authenticated',
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
          }, 
          error: null 
        }),
        signUp: async (credentials: any) => ({ 
          data: { 
            user: {
              id: 'dev-user-123',
              email: credentials?.email || 'dev@launchbird.com',
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              role: 'authenticated',
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
          }, 
          error: null 
        }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async (email: string, options?: any) => ({ error: null }),
        signInAnonymously: async () => ({ 
          data: { 
            user: {
              id: 'dev-user-123',
              email: 'anonymous@launchbird.com',
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              role: 'authenticated',
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
          }, 
          error: null 
        }),
        onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: (table: string) => ({
        select: (columns?: string, options?: any) => ({ 
          eq: (field: string, value: any) => ({ 
            single: () => ({ 
              data: (() => {
                if (table === 'users') {
                  return {
                    id: 'dev-user-123',
                    email: 'dev@launchbird.com',
                    role: 'admin' as const,
                    title: 'Developer',
                    job_title: 'Senior Developer',
                    location: 'San Francisco, CA',
                    profile_image_url: '',
                    theme: 'light' as const,
                    organization_id: 'org-1',
                    organization_role: 'admin' as const,
                    invited_by: undefined,
                    joined_at: new Date().toISOString(),
                    last_active: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                } else if (table === 'client_profiles') {
                  return {
                    id: 'dev-client-123',
                    code: 'DEV123',
                    organization_id: 'org-1',
                    project_id: 'project-1',
                    password: 'dev123',
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                } else if (table === 'organizations') {
                  return {
                    id: 'org-1',
                    name: 'LaunchBird Development',
                    slug: 'launchbird-development',
                    plan: 'pro' as const,
                    settings: {
                      branding: {
                        logo: '',
                        primaryColor: '#3b82f6',
                        companyName: 'LaunchBird Development',
                        domain: 'launchbird.dev'
                      },
                      features: {
                        clientAccess: true,
                        customDomains: true,
                        advancedAnalytics: true,
                        timeTracking: true,
                        fileStorage: true
                      },
                      limits: {
                        maxProjects: 50,
                        maxTeamMembers: 25,
                        maxStorage: 1000,
                        maxClients: 100
                      },
                      notifications: {
                        emailUpdates: true,
                        slackIntegration: false,
                        clientNotifications: true
                      }
                    },
                    members: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    organizations: {
                      id: 'org-1',
                      name: 'LaunchBird Development'
                    }
                  }
                }
                return null
              })(), 
              error: null 
            }),
            gt: (field: string, value: any) => ({ single: () => ({ data: null, error: null }) }),
            eq: (field2: string, value2: any) => ({ 
              count: options?.count === 'exact' ? 0 : undefined,
              data: [], 
              error: null 
            }),
            count: options?.count === 'exact' ? 0 : undefined,
            data: [],
            error: null
          }),
          gt: (field: string, value: any) => ({ single: () => ({ data: null, error: null }) }),
          count: options?.count === 'exact' ? 0 : undefined,
          limit: (n: number) => ({ 
            data: [], 
            error: null,
            count: options?.count === 'exact' ? 0 : undefined
          }),
          data: [],
          error: null
        }),
        insert: (data: any) => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: (data: any) => ({ 
          eq: (field: string, value: any) => ({ 
            eq: (field2: string, value2: any) => ({ data: null, error: null }),
            data: null, 
            error: null 
          })
        }),
        delete: () => ({ eq: () => ({ error: null }) })
      })
})

// Create real or mock client based on environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Use real Supabase client if URL and key are configured, otherwise fall back to mock
export const supabase = (supabaseUrl && supabaseUrl !== 'https://dummy.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'dummy_key')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : DEV_MODE 
    ? createMockClient() 
    : createClient(supabaseUrl, supabaseAnonKey)

// Export for compatibility with existing code
export const auth = supabase.auth
export const db = supabase
export const analytics = supabase

export const checkConnection = async (): Promise<boolean> => {
  if (DEV_MODE) {
    console.log('🔧 Development mode: Database connection bypassed')
    return true
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (DEV_MODE) {
    console.log('🔧 Development mode: Analytics event:', eventName, parameters)
    return
  }
  
  // Implement analytics logging with Supabase
  console.log('Analytics event:', eventName, parameters)
}

