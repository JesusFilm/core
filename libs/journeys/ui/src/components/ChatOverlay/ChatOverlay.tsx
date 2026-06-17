'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  OVERLAY_CLOSE_BG,
  OVERLAY_CLOSE_BG_HOVER,
  OVERLAY_INPUT_BORDER
} from '../AiChat/chatStyles'

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

export function ChatOverlay({
  open,
  onClose
}: ChatOverlayProps): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  if (!open) return null

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
          // Dark surface scales WITH the chat (NES-1738 Option A): it covers
          // only the bottom 80% — the same height as the panel — so the freed
          // top 20% reveals the journey card instead of a full-screen slab.
          // Colour/opacity unchanged from NES-1654 (near-opaque 98%, no blur);
          // only the size changed.
          height: '80%',
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.98),
          // The dark surface is the same colour as the journey backdrop behind
          // it, so its top edge would vanish. Round the top corners (16, the
          // same radius as the mobile sheet in PinnedChatBar) and draw the same
          // 1px hairline the overlay input pill uses (OVERLAY_INPUT_BORDER) so
          // the chat surface reads as a distinct, delineated panel.
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTop: `1px solid ${OVERLAY_INPUT_BORDER}`
        }}
      />
      <IconButton
        onClick={onClose}
        aria-label={t('Close chat')}
        disableRipple
        sx={{
          position: 'absolute',
          // Attach the close control to the dark chat surface, not the viewport
          // (NES-1738 Option A feedback): the surface starts 20% down the
          // screen, so anchor just below that top edge and inside the rounded
          // top-right corner. This reads as "close the chat" rather than
          // "close the page" (which the old viewport-top placement implied).
          top: 'calc(20% + 12px)',
          right: 12,
          zIndex: 1,
          // Matches PromptInput's submit/stop icon button (32×32) so the
          // two affordances at opposite corners of the overlay feel
          // proportionate.
          width: 32,
          height: 32,
          p: 0,
          color: 'common.white',
          bgcolor: OVERLAY_CLOSE_BG,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
          backgroundClip: 'padding-box',
          '&:hover': { bgcolor: OVERLAY_CLOSE_BG_HOVER }
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '48rem',
          // 80%-height panel, bottom-aligned. The dark surface behind is now
          // sized to match (also 80%), so the freed top 20% reveals the
          // journey card — signalling the chat is closeable to reach the card's
          // CTA (NES-1738 Option A). The AiChat flex column still gets real
          // height for the conversation-container (flex:1) to fill.
          height: '80%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <AiChat variant="overlay" />
      </Box>
    </Box>
  )
}
