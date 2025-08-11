// Firebase removed: provide stubs so the rest of the app can run without auth or database
export const auth: any = null
export const db: any = null
export const analytics: any = null
const app: any = null
export default app

export const checkFirebaseConnection = async (): Promise<boolean> => false
export const logAnalyticsEvent = (_eventName: string, _parameters?: Record<string, any>) => {}