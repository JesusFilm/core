'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useState } from 'react'

import { useChatOverlay } from '../../libs/ChatOverlayProvider'
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
} from '../AiChat/chatStyles'

/**
 * Lightweight visual placeholder rendered while the dynamically-imported
 * AiChat chunk is loading. Mirrors the idle-state layout (header row,
 * input row) so on slow devices we show a near-final shell instead of an
 * empty white box. No interactivity — the real AiChat takes over once
 * the chunk lands.
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
      <Box sx={{ background: HEADER_WASH, flexShrink: 0, pt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pt: 1,
            pb: 1.5,
            px: 1.75,
            borderBottom: '1px solid',
            borderBottomColor: DIVIDER,
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

// Pixel height for the idle (no messages) state: header wash (8px pad +
// ~70px ChatHeader) + floating input (~52px) + breathing room. Explicit
// so the idle ⇄ active animation has numeric endpoints to interpolate
// between rather than transitioning out of `auto` height.
const IDLE_HEIGHT_PX = 144

/**
 * Mobile bottom drawer for the AI chat. Open/closed state lives in
 * `ChatOverlayProvider` — the same `open` the AiChatButton in the
 * StepFooter toggles — so the footer button, this drawer, and the
 * desktop overlay all agree on whether the chat is engaged.
 *
 * The drawer stays mounted while closed (slid off-screen) so the
 * conversation survives close → reopen: with messages present, AiChat
 * reports `'active'` and the sheet reopens at 80% with history intact.
 */
export function PinnedChatBar({ sx }: PinnedChatBarProps): ReactElement | null {
  const { variant } = useJourney()
  const { open, setOpen } = useChatOverlay()
  const [sheetState, setSheetState] = useState<AiChatSheetState>('idle')

  const handleSheetStateChange = useCallback((next: AiChatSheetState) => {
    setSheetState(next)
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  const height = sheetState === 'active' ? '80%' : `${IDLE_HEIGHT_PX}px`

  return (
    <Box
      data-testid="PinnedChatBar"
      data-sheet-state={sheetState}
      data-open={open}
      sx={{
        position: 'absolute',
        // Above the StepFooter (zIndex 1): while the drawer is open it
        // deliberately covers the footer's chat buttons — the user has
        // committed to this chat; closing reveals the buttons again.
        zIndex: 2,
        bottom: 0,
        left: 0,
        right: 0,
        height,
        // Closed = slid fully off the bottom edge. The 32px overshoot
        // clears SHEET_TOP_SHADOW's upward blur; visibility flips only
        // after the slide-out completes so the exit still animates,
        // while removing the off-screen drawer from the a11y tree.
        transform: open ? 'translateY(0)' : 'translateY(calc(100% + 32px))',
        visibility: open ? 'visible' : 'hidden',
        transition: open
          ? 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1), height 280ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1), height 280ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 280ms',
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
      <AiChat
        onSheetStateChange={handleSheetStateChange}
        onClose={() => setOpen(false)}
      />
    </Box>
  )
}
