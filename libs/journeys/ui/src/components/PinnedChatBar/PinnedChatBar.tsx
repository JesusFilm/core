'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { SHEET_TOP_SHADOW, SURFACE } from '../AiChat/tokens'

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
  const [active, setActive] = useState(false)

  const handleActiveChange = useCallback((next: boolean) => {
    setActive(next)
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  return (
    <Box
      data-testid="PinnedChatBar"
      data-active={active}
      sx={{
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        right: 0,
        // Idle: hug content (header + handle + input). Active: occupy 80%
        // of the viewport so the conversation has room to scroll.
        height: active ? '80%' : 'auto',
        maxHeight: active ? '80%' : 'unset',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SURFACE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: SHEET_TOP_SHADOW,
        // Honour the iOS home-indicator inset only — the browser bottom
        // toolbar (when visible) already provides its own safe area.
        pb: 'env(safe-area-inset-bottom)',
        ...sx
      }}
    >
      <AiChat onActiveChange={handleActiveChange} />
    </Box>
  )
}
