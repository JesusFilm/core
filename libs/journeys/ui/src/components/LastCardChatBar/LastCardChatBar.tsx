'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { BookOpen, Lightbulb } from 'lucide-react'
import {
  FormEvent,
  ReactElement,
  useCallback,
  useState
} from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { AiChat } from '../AiChat'
import { Drawer, DrawerContent } from '../Drawer'
import { PromptInput } from '../PromptInput'

interface LastCardChatBarProps {
  sx?: SxProps
  activeBlockId?: string
  userId?: string
}

const interactionButtons: Array<{
  type: string
  label: string
  icon: typeof BookOpen
  prompt: string
}> = [
  {
    type: 'explain',
    label: 'Explain',
    icon: BookOpen,
    prompt: 'Can you explain what this content is about and its significance?'
  },
  {
    type: 'reflect',
    label: 'Reflect',
    icon: Lightbulb,
    prompt:
      'Help me reflect on this content. What are the key takeaways and how can I apply them?'
  }
  // TODO: Third interaction starter button — Aaron mentioned three buttons on last card.
  // Awaiting confirmation from Jaco on what the third button should be.
]

export function LastCardChatBar({
  sx,
  activeBlockId,
  userId
}: LastCardChatBarProps): ReactElement {
  const { variant } = useJourney()
  const [input, setInput] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | undefined>(
    undefined
  )

  // On interaction starter click -> open the full AiChat drawer with the message pre-loaded
  const handleInteractionClick = useCallback((prompt: string) => {
    setPendingMessage(prompt)
    setDrawerOpen(true)
  }, [])

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
        {/* Interaction starter buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'center',
            px: 2,
            py: 1.5,
            flexShrink: 0
          }}
        >
          {interactionButtons.map(({ type, label, icon: Icon, prompt }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleInteractionClick(prompt)}
              aria-label={label}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleInteractionClick(prompt)
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                fontSize: 14,
                fontFamily: 'inherit',
                fontWeight: 500,
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              <Icon
                style={{
                  width: 20,
                  height: 20,
                  color: 'rgba(255, 255, 255, 0.85)'
                }}
              />
              {label}
            </button>
          ))}
        </Stack>

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

      {/* Full AiChat drawer — opens on submit or starter tap with message pre-loaded */}
      <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent title="AI Chat">
          <AiChat
            activeBlockId={activeBlockId}
            userId={userId}
            initialMessage={pendingMessage}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
