import Paper from '@mui/material/Paper'
import Stack, { StackProps } from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

/** The width of a left panel. */
export const LEFT_PANEL_WIDTH = 300

/** The padding, in theme spacing units, between a left panel's edge and its content. */
export const LEFT_PANEL_PADDING = 4

interface LeftPanelProps {
  label: string
  children: ReactNode
}

/**
 * The shell of the open left panel. At every width it overlays the canvas
 * from the rail's edge and casts a shadow, without dimming or blocking the
 * canvas beside it, so the frame and its scale never move when a panel opens
 * or closes.
 */
export function LeftPanel({ label, children }: LeftPanelProps): ReactElement {
  return (
    <Paper
      component="aside"
      square
      elevation={8}
      aria-label={label}
      data-testid="CampaignLeftPanel"
      sx={{
        width: LEFT_PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 2
      }}
    >
      {children}
    </Paper>
  )
}

/**
 * The scrolling, padded body of a left panel: every panel's content sits in
 * one of these so that no control touches the panel's edge and a long panel
 * scrolls vertically instead of overflowing it.
 */
export function LeftPanelBody({
  children,
  ...props
}: Omit<StackProps, 'sx'>): ReactElement {
  return (
    <Stack
      {...props}
      sx={{
        flexGrow: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: LEFT_PANEL_PADDING
      }}
    >
      {children}
    </Stack>
  )
}
