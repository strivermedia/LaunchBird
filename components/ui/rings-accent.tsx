import React from 'react'
import { cn } from '@/lib/utils'

interface RingsAccentProps {
  className?: string
  idPrefix?: string
}

/**
 * RingsAccent: subtle concentric rings for decorative corner accents.
 * Uses currentColor for tint so it respects Tailwind `text-*` utilities.
 */
export default function RingsAccent({ className }: RingsAccentProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={cn('pointer-events-none select-none', className)}
    >
      {/* Minimal, no-glow concentric rings */}
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="98" strokeWidth="1.25" opacity="0.10" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="100" r="78" strokeWidth="1.25" opacity="0.08" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.25" opacity="0.06" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="100" r="40" strokeWidth="1.25" opacity="0.05" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="100" r="24" strokeWidth="1.25" opacity="0.04" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="100" r="12" strokeWidth="1.25" opacity="0.03" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
}


