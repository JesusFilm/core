'use client'

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback } from 'react'

import { useChatOverlay } from '../../libs/ChatOverlayProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { ChatOverlay } from '../ChatOverlay'

export function AiChatButton(): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  const { variant } = useJourney()
  const { open, setOpen } = useChatOverlay()

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
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <ChatOverlay open={open} onClose={handleClose} />
    </>
  )
}
