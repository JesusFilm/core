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
          // Inset the dark surface so the journey card peeks through the
          // 16px frame around the overlay. Combined with the top-right
          // close affordance below, the user is oriented to the overlay
          // relationship rather than thinking the page itself changed.
          inset: 16,
          bgcolor: 'grey.900',
          borderRadius: '20px'
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
          width: 40,
          height: 40,
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
          maxHeight: '80vh',
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
