import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

export interface ThumbBadgeProps {
  /** Tooltip / aria description of the badge. */
  label: string
  /** Inner icon node (e.g. Lightning2 or Globe). */
  icon: ReactNode
  /** CSS background color for the badge dot. */
  background: string
}

/**
 * Tiny corner badge overlaid on the row thumbnail to indicate
 * Quick Start / Website state. At 18×18 the icon itself is glanceable
 * even without the desktop card's expand-on-hover label.
 */
export function ThumbBadge({
  label,
  icon,
  background
}: ThumbBadgeProps): ReactElement {
  return (
    <Box
      aria-label={label}
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
      }}
    >
      {icon}
    </Box>
  )
}
