'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { OVERLAY_CLOSE_BG, OVERLAY_CLOSE_BG_HOVER } from '../AiChat/chatStyles'

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
          inset: 0,
          // Fully opaque so the journey card behind the overlay is not
          // visible. Previously alpha(grey[900], 0.88) + 6px backdrop blur
          // left underlying card content perceptible, which hurt chat
          // legibility (NES-1654, Lucinda's feedback).
          bgcolor: 'grey.900'
        }}
      />
      <IconButton
        onClick={onClose}
        aria-label={t('Close chat')}
        disableRipple
        sx={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 24px)',
          right: 24,
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
          // Full-height panel so the AiChat flex column has real height
          // for the conversation-container (flex:1) to fill — that gives
          // the absolutely-positioned empty-state hero proper space to
          // centre within the viewport rather than collapsing to the
          // bottom (NES-1654 iteration).
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <AiChat collapsible={false} variant="overlay" />
      </Box>
    </Box>
  )
}
