/**
 * Status utility functions
 * Centralized status color and formatting functions to avoid duplication
 */

/**
 * Task stage theme mapping (aligned with LaunchBird design tokens)
 * Uses theme variables (primary + chart) instead of hard-coded blue/green/purple.
 */
export type TaskStageTheme = {
  text: string
  icon: string
  iconBg: string
  columnHover: string
  accent: string
}

export const getTaskStageTheme = (status: string): TaskStageTheme => {
  switch (status) {
    case 'in-progress':
      return {
        // Active / in progress: blue
        // #3B82F6
        text: 'text-[#3B82F6]',
        icon: 'text-[#3B82F6]',
        iconBg: 'bg-[#3B82F6]/10',
        columnHover: 'bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10',
        accent: 'bg-[#3B82F6]',
      }
    case 'review':
      return {
        // Review: violet (distinct from primary accent + complements teal/completion)
        // #A855F7
        text: 'text-[#A855F7]',
        icon: 'text-[#A855F7]',
        iconBg: 'bg-[#A855F7]/10',
        columnHover: 'bg-[#A855F7]/5 dark:bg-[#A855F7]/10',
        accent: 'bg-[#A855F7]',
      }
    case 'completed':
      return {
        // Completed: vibrant green (distinct from low priority mint/teal)
        // #22C55E
        text: 'text-[#22C55E]',
        icon: 'text-[#22C55E]',
        iconBg: 'bg-[#22C55E]/10',
        columnHover: 'bg-[#22C55E]/5 dark:bg-[#22C55E]/10',
        accent: 'bg-[#22C55E]',
      }
    case 'todo':
    default:
      return {
        // Not started: slate
        // #64748B
        text: 'text-[#64748B]',
        icon: 'text-[#64748B]',
        iconBg: 'bg-[#64748B]/10',
        columnHover: 'bg-[#64748B]/5 dark:bg-[#64748B]/10',
        accent: 'bg-[#64748B]',
      }
  }
}

/**
 * Get status color classes for badges
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'review':
      return 'bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100'
    case 'on-hold':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'planning':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'prospect':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get priority color classes for badges
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      // Urgent: strong red
      return 'bg-[#EF4444] text-white'
    case 'high':
      // High: orange
      return 'bg-[#F97316] text-white'
    case 'medium':
      // Medium: amber/gold
      return 'bg-[#FBBF24] text-[#111827]'
    case 'low':
      // Low: mint
      return 'bg-[#5EEAD4] text-[#0B1220] dark:bg-[#2DD4BF] dark:text-[#04110D]'
    default:
      return 'bg-muted text-foreground'
  }
}

/**
 * Get type color classes for badges
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'one-time':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'ongoing':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}
