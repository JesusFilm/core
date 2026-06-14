'use client'

import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback } from 'react'

import MessageChatStarsIcon from '@core/shared/ui/icons/MessageChatStars'

import { useChatOverlay } from '../../libs/ChatOverlayProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { ChatOverlay } from '../ChatOverlay'

export function AiChatButton(): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  const { variant } = useJourney()
  const { open, setOpen } = useChatOverlay()
  const theme = useTheme()
  // sm+ opens the full-screen ChatOverlay; on xs the same `open` state
  // drives the PinnedChatBar drawer rendered by the Conductor. Only the
  // breakpoint-matching surface is mounted — mounting both would run two
  // parallel chat sessions for the same conversation.
  const showOverlaySurface = useMediaQuery(theme.breakpoints.up('sm'))

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label={t('Open AI chat')}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        sx={{
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          // 44×44 matches the MessagePlatform buttons in ChatButtons so
          // the footer chat group reads as one evenly-sized row.
          width: 44,
          height: 44,
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <MessageChatStarsIcon sx={{ fontSize: 40 }} />
      </IconButton>
      {showOverlaySurface && <ChatOverlay open={open} onClose={handleClose} />}
    </>
  )
}
