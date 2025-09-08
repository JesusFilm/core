import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useBlocks } from '@core/journeys/ui/block'

import { AiChat } from '../AiChat'
import { Button } from '../Button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../Drawer'

export function AiChatButton(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const [open, setOpen] = useState<boolean>(false)
  const { blockHistory } = useBlocks()

  const activeBlockId = blockHistory?.[blockHistory.length - 1]?.id
  const previousActiveBlockIdRef = useRef<string | undefined>(activeBlockId)

  const handleClick = () => {
    setOpen(!open)
  }

  // Collapse chat when navigating to a new card (active block changes)
  useEffect(() => {
    if (previousActiveBlockIdRef.current == null) {
      previousActiveBlockIdRef.current = activeBlockId
      return
    }
    if (activeBlockId !== previousActiveBlockIdRef.current) {
      if (open) setOpen(false)
      previousActiveBlockIdRef.current = activeBlockId
    }
  }, [activeBlockId, open])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          size="icon"
          onClick={handleClick}
          aria-label={open ? 'Close AI chat' : 'Open AI chat'}
          tabIndex={0}
          data-testid="AiChatButton"
          className="fixed bottom-4 left-4 z-1 bg-background text-foreground rounded-full size-14 hover:bg-background/80"
        >
          <AutoAwesomeIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerClose>
            <Button
              variant="destructive"
              className="absolute top-4 right-4"
              aria-label="Close AI chat"
            >
              <CloseIcon />
            </Button>
          </DrawerClose>
          <DrawerTitle>{t('Journey Assistant')}</DrawerTitle>
          <DrawerDescription>{t('You ask I answer.')}</DrawerDescription>
        </DrawerHeader>
        <AiChat open={open} />
      </DrawerContent>
    </Drawer>
  )
}
