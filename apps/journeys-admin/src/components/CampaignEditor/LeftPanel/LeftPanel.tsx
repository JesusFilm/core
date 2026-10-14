import Paper from '@mui/material/Paper'
import { ReactElement, ReactNode } from 'react'

/** The width of a left panel. */
export const LEFT_PANEL_WIDTH = 300

interface LeftPanelProps {
  label: string
  /** True below 1440 px, where the panel floats over the canvas instead of pushing it. */
  overlay: boolean
  children: ReactNode
}

/**
 * The shell of the open left panel. Pushed (in the layout flow) at 1440 px
 * and above; below that it overlays the canvas from the rail's edge and
 * casts a shadow, without dimming or blocking the canvas beside it.
 */
export function LeftPanel({
  label,
  overlay,
  children
}: LeftPanelProps): ReactElement {
  return (
    <Paper
      component="aside"
      square
      elevation={overlay ? 8 : 0}
      aria-label={label}
      data-testid="CampaignLeftPanel"
      data-mode={overlay ? 'overlay' : 'push'}
      sx={{
        width: LEFT_PANEL_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        ...(overlay && {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 2
        })
      }}
    >
      {children}
    </Paper>
  )
}
