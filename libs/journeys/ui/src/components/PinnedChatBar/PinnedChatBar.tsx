'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import type { AiChatSheetState } from '../AiChat/AiChat'
import { SHEET_TOP_SHADOW, SURFACE } from '../AiChat/tokens'

const AiChat = dynamic(
  async () =>
    await import(/* webpackChunkName: 'ai-chat' */ '../AiChat').then(
      (mod) => mod.AiChat
    ),
  { ssr: false }
)

interface PinnedChatBarProps {
  sx?: SxProps
}

// Pixel height for the collapsed-with-messages state. 32px = the drag
// handle's 14px top + 4px thumb + 14px bottom padding.
const COLLAPSED_HEIGHT_PX = 32
// Pixel height for the idle (no messages) state. Handle (32) + ChatHeader
// (~64) + input (~68) + a little breathing room. Used so the open/close
// animation has explicit numeric endpoints to interpolate between when
// transitioning out of `auto` height.
const IDLE_HEIGHT_PX = 168

export function PinnedChatBar({ sx }: PinnedChatBarProps): ReactElement | null {
  const { variant } = useJourney()
  const [sheetState, setSheetState] = useState<AiChatSheetState>('idle')

  const handleSheetStateChange = useCallback((next: AiChatSheetState) => {
    setSheetState(next)
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  let height: string
  if (sheetState === 'active') {
    height = '80%'
  } else if (sheetState === 'collapsed') {
    height = `${COLLAPSED_HEIGHT_PX}px`
  } else {
    // Idle — fixed height so the transition into 'active' interpolates.
    height = `${IDLE_HEIGHT_PX}px`
  }

  return (
    <Box
      data-testid="PinnedChatBar"
      data-sheet-state={sheetState}
      sx={{
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        right: 0,
        height,
        // No maxHeight: it would clamp instantly on state change and short-
        // circuit the height transition (collapse looked instant before this).
        // Drag-driven collapse/expand animates between explicit numeric
        // heights via CSS rather than position-tracking, per product spec.
        transition: 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: SURFACE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: SHEET_TOP_SHADOW,
        pb: 'env(safe-area-inset-bottom)',
        ...sx
      }}
    >
      <AiChat onSheetStateChange={handleSheetStateChange} />
    </Box>
  )
}
