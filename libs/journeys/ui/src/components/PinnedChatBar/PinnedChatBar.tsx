'use client'

import Box from '@mui/material/Box'
import { SxProps, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import dynamic from 'next/dynamic'
import { FormEvent, ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { Drawer, DrawerContent } from '../Drawer'
import { PromptInput } from '../PromptInput'

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
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [input, setInput] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | undefined>(
    undefined
  )

  // On prompt submit -> open the full AiChat drawer with the message pre-loaded
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length === 0) return
      setPendingMessage(input)
      setInput('')
      setDrawerOpen(true)
    },
    [input]
  )

  // Reset pending message when drawer closes so re-opening starts fresh
  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open)
    if (!open) {
      setPendingMessage(undefined)
    }
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  return (
    <>
      <Box
        data-testid="PinnedChatBar"
        sx={{
          position: 'absolute',
          zIndex: 1,
          bottom: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'common.white',
          pb: 'env(safe-area-inset-bottom)',
          ...sx
        }}
      >
        {/* Prompt input — always visible, pinned to bottom */}
        <Box sx={{ flexShrink: 0 }}>
          <PromptInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            isLoading={false}
          />
        </Box>
      </Box>

      {/* Full AiChat drawer — opens on submit with message pre-loaded */}
      <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent title={'Chat'}>
          <AiChat initialMessage={pendingMessage} />
        </DrawerContent>
      </Drawer>
    </>
  )
}
