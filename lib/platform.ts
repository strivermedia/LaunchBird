// Neutral platform stubs: no auth or database. Keeps app building without Supabase.
export const auth: any = null
export const db: any = null
export const analytics: any = null
const app: any = null
export default app

export const checkConnection = async (): Promise<boolean> => false
export const logAnalyticsEvent = (_eventName: string, _parameters?: Record<string, any>) => {}

