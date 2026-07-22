'use client'

import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import type { AiChatSheetState } from '../AiChat/AiChat'
import { OVERLAY_INPUT_BORDER } from '../AiChat/chatStyles'

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
        // Bottom-anchored band exactly as tall as the chat sheet (144px idle
        // → 80% active). The overlay used to be a full-viewport fixed layer
        // that silently swallowed clicks on the card revealed above the chat
        // (QA-538); sizing the container to the sheet means nothing
        // chat-related exists above it, so the journey stays natively
        // interactive. Children must stay within the band — an escapee
        // (negative offset, own fixed positioning) would cover the journey
        // and silently reintroduce QA-538.
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        transition: HEIGHT_TRANSITION,
        zIndex: (theme) => theme.zIndex.modal,
        display: 'flex',
        justifyContent: 'center',
        px: 2
        // No bottom padding: the chat sheet sits flush to the screen bottom so
        // its top edge aligns exactly with the bordered dark overlay (otherwise
        // the panel floats ~24px above the border and the header reads as
        // jammed against it). Mirrors the mobile drawer's flush-to-bottom
        // sheet (NES-1738 feedback).
      }}
    >
      <Box
        onClick={onClose}
        aria-hidden
        sx={{
          // Dark surface fills the band behind the centred panel: absolute so
          // it ignores the px gutter and stays full-width, and it tracks the
          // band's height transition automatically. Clicking it closes the
          // chat. Colour/opacity unchanged from NES-1654 (near-opaque 98%,
          // no blur).
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.98),
          // Rounded top + a 1px translucent-white top border on the FULL-WIDTH
          // background overlay (not the centred chat panel) so its top edge
          // reads as a distinct surface against the dark journey backdrop —
          // same hairline the overlay input pill uses (NES-1738 feedback).
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTop: `1px solid ${OVERLAY_INPUT_BORDER}`
        }}
      />
      <Box
        data-testid="ChatOverlayPanel"
        data-sheet-state={sheetState}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '48rem',
          // Fills the band (Option B, NES-1738). The panel variant's
          // ChatHeader + inline input fill the 144px idle bar exactly like
          // the mobile drawer; on the first message AiChat reports 'active'
          // and the band grows to 80%, revealing the card's CTA while the
          // bar sits idle.
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <AiChat onDark onSheetStateChange={setSheetState} onClose={onClose} />
      </Box>
    </Box>
  )
}
