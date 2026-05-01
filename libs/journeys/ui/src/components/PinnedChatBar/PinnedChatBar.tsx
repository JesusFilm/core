'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import type { AiChatSheetState } from '../AiChat/AiChat'
import {
  DIVIDER,
  HEADER_WASH,
  INPUT_FILL,
  SHEET_TOP_SHADOW,
  SPARKLE_AVATAR_SHADOW,
  SPARKLE_GRADIENT,
  SURFACE
} from '../AiChat/tokens'

/**
 * Lightweight visual placeholder rendered while the dynamically-imported
 * AiChat chunk is loading. Mirrors the idle-state layout (handle, header
 * row, input row) so on slow devices we show a near-final shell instead
 * of an empty white box. No interactivity — the real AiChat takes over
 * once the chunk lands.
 */
function ChatLoadingSkeleton(): ReactElement {
  return (
    <Box
      data-testid="PinnedChatBarSkeleton"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box sx={{ background: HEADER_WASH, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: '14px'
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 4,
              borderRadius: 9999,
              bgcolor: DIVIDER
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pt: 1,
            pb: 1.5,
            px: 1.75,
            borderBottom: `1px solid ${DIVIDER}`,
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: SPARKLE_GRADIENT,
              boxShadow: SPARKLE_AVATAR_SHADOW,
              flexShrink: 0
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 110,
                height: 12,
                borderRadius: 4,
                bgcolor: DIVIDER,
                mb: 0.75
              }}
            />
            <Box
              sx={{
                width: 150,
                height: 10,
                borderRadius: 4,
                bgcolor: DIVIDER,
                opacity: 0.7
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: 44,
            bgcolor: INPUT_FILL,
            borderRadius: '22px'
          }}
        />
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: DIVIDER,
            flexShrink: 0
          }}
        />
      </Box>
    </Box>
  )
}

const AiChat = dynamic(
  async () =>
    await import(/* webpackChunkName: 'ai-chat' */ '../AiChat').then(
      (mod) => mod.AiChat
    ),
  { ssr: false, loading: () => <ChatLoadingSkeleton /> }
)

interface PinnedChatBarProps {
  sx?: SxProps
}

// Pixel height for the collapsed state. 32px = the drag handle's 14px
// top + 4px thumb + 14px bottom padding.
const COLLAPSED_HEIGHT_PX = 32
// Pixel height for the idle (no messages, expanded) state. Handle (32)
// + ChatHeader (~64) + input (~68) + a little breathing room. Used so
// the open/close animation has explicit numeric endpoints to
// interpolate between when transitioning out of `auto` height.
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
