'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        px: 2,
        pb: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: '48rem',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label={t('Close chat')}
          size="small"
          sx={{
            position: 'absolute',
            top: -44,
            right: 0,
            zIndex: 1,
            color: 'common.white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
        <AiChat collapsible={false} variant="overlay" />
      </Box>
    </Box>
  )
}
