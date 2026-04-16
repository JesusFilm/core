'use client'

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { AiChat } from '../AiChat'
import { Drawer, DrawerContent } from '../Drawer'

interface AiChatButtonProps {
  userId?: string
  activeBlockId?: string
}

export function AiChatButton({
  userId,
  activeBlockId
}: AiChatButtonProps): ReactElement {
  const { variant } = useJourney()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleClick = useCallback(() => {
    setDrawerOpen(true)
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return <></>
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="Open AI chat"
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
        <DrawerContent title="AI Chat">
          <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <AiChat activeBlockId={activeBlockId} userId={userId} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
