'use client'

import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import type { AiChatSheetState } from '../AiChat/AiChat'

const AiChat = dynamic(
  async () =>
    await import(/* webpackChunkName: 'ai-chat' */ '../AiChat').then(
      (mod) => mod.AiChat
    ),
  { ssr: false }
)

interface ChatOverlayProps {
  open: boolean
  onClose: () => void
}

// Idle (no messages) height for the compact desktop bar. Mirrors the mobile
// drawer's IDLE_HEIGHT_PX in PinnedChatBar.tsx: header wash (8px pad +
// ~70px ChatHeader) + floating input (~52px) + breathing room. Explicit so
// the idle ⇄ active animation interpolates between numeric endpoints rather
// than transitioning out of `auto` height. Kept in sync with mobile so
// desktop Option B (NES-1738) matches the mobile grow-from-bottom behaviour.
const IDLE_HEIGHT_PX = 144

// Same easing + duration as the mobile drawer's height transition
// (PinnedChatBar.tsx) so the compact → 80% grow feels identical on desktop.
const HEIGHT_TRANSITION = 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)'

export function ChatOverlay({
  open,
  onClose
}: ChatOverlayProps): ReactElement | null {
  const [sheetState, setSheetState] = useState<AiChatSheetState>('idle')

  if (!open) return null

  // Option B (NES-1738): open compact and grow on the first message, mirroring
  // the mobile drawer. Idle is the 144px bar (ChatHeader + inline input);
  // active is 80% once AiChat reports messages exist.
  const height = sheetState === 'active' ? '80%' : `${IDLE_HEIGHT_PX}px`

  return (
    <Box
      data-testid="ChatOverlay"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        px: 2,
        pb: { xs: 2, sm: 3 }
      }}
    >
      <Box
        onClick={onClose}
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          // Dark surface scales WITH the chat (NES-1738 Option B): it grows
          // from the 144px idle bar to 80% in lockstep with the panel, so the
          // journey card is revealed above the chat instead of being hidden by
          // a full-screen layer. Colour/opacity unchanged from NES-1654
          // (near-opaque 98%, no blur); only the size now tracks the sheet.
          height,
          transition: HEIGHT_TRANSITION,
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.98)
        }}
      />
      <Box
        data-testid="ChatOverlayPanel"
        data-sheet-state={sheetState}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '48rem',
          // Compact-then-grow height (Option B). The panel variant's
          // ChatHeader + inline input fill the 144px idle bar exactly like
          // the mobile drawer; on the first message AiChat reports 'active'
          // and the bar grows to 80%, revealing the card's CTA while the
          // bar sits idle.
          height,
          transition: HEIGHT_TRANSITION,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <AiChat
          variant="panel"
          onSheetStateChange={setSheetState}
          onClose={onClose}
        />
      </Box>
    </Box>
  )
}
