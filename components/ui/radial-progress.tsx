import React from 'react'
import { cn } from '@/lib/utils'

interface RadialProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  valueClassName?: string
}

/**
 * RadialProgress component
 * Displays progress as a circular chart with customizable styling
 */
export function RadialProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  valueClassName
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(Math.max(value, 0), 100)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-[#6d28d9] dark:text-[#7c3aed] transition-all duration-1000 ease-out"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'text-2xl font-bold text-gray-900 dark:text-white',
            valueClassName
          )}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
} 