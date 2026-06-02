'use client'

import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
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
        <AiChat collapsible={false} variant="overlay" onClose={onClose} />
      </Box>
    </Box>
  )
}
