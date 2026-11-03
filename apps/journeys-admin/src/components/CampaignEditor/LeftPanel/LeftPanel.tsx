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
 * The shell of the open left panel, docked beside the Left Rail on the same
 * flat surface: a hairline from the rail, a divider to the canvas, no shadow.
 * One panel is always open, so its width is always taken from the canvas and
 * the frame and its scale never move when the rail switches panels.
 */
export function LeftPanel({ label, children }: LeftPanelProps): ReactElement {
  return (
    <Paper
      component="aside"
      square
      elevation={0}
      aria-label={label}
      data-testid="CampaignLeftPanel"
      sx={{
        width: LEFT_PANEL_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider'
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
