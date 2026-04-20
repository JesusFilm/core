'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { FormEvent, ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { AiChat } from '../AiChat'
import { Drawer, DrawerContent } from '../Drawer'
import { PromptInput } from '../PromptInput'

interface LastCardChatBarProps {
  sx?: SxProps
  userId?: string
}

export function LastCardChatBar({
  sx,
  userId
}: LastCardChatBarProps): ReactElement {
  const { variant } = useJourney()
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
    return <></>
  }

  return (
    <>
      <Box
        data-testid="LastCardChatBar"
        sx={{
          position: 'absolute',
          zIndex: 1,
          bottom: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
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
        <DrawerContent title="AI Chat">
          <AiChat userId={userId} initialMessage={pendingMessage} />
        </DrawerContent>
      </Drawer>
    </>
  )
}
