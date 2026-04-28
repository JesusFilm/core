'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import { useJourney } from '../../libs/JourneyProvider'

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

export function PinnedChatBar({ sx }: PinnedChatBarProps): ReactElement | null {
  const { variant } = useJourney()

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  return (
    <Box
      data-testid="PinnedChatBar"
      sx={{
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: 'min(70vh, 100%)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'common.white',
        pb: 'env(safe-area-inset-bottom)',
        ...sx
      }}
    >
      <AiChat />
    </Box>
  )
}
