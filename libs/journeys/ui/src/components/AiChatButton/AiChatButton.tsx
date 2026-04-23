'use client'

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import IconButton from '@mui/material/IconButton'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { Drawer, DrawerContent } from '../Drawer'

const AiChat = dynamic(
  async () =>
    await import(/* webpackChunkName: 'ai-chat' */ '../AiChat').then(
      (mod) => mod.AiChat
    ),
  { ssr: false }
)

export function AiChatButton(): ReactElement | null {
  const { t } = useTranslation('libs-journeys-ui')
  const { variant } = useJourney()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleClick = useCallback(() => {
    setDrawerOpen(true)
  }, [])

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
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent title={t('Chat')}>
          <AiChat collapsible={false} />
        </DrawerContent>
      </Drawer>
    </>
  )
}
