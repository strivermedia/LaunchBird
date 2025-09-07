import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export for compatibility with existing code
export const auth = supabase.auth
export const db = supabase
export const analytics = supabase

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  // Implement analytics logging with Supabase
  console.log('Analytics event:', eventName, parameters)
}

