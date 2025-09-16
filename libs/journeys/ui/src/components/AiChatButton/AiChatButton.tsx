import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useBlocks } from '../../libs/block'
import { AiChat } from '../AiChat'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../Drawer'
import { Button } from '../SimpleButton'
import { useJourney } from '../../libs/JourneyProvider'

export function AiChatButton(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const { variant } = useJourney()
  const [open, setOpen] = useState<boolean>(false)
  const { blockHistory } = useBlocks()

  const activeBlockId = blockHistory?.[blockHistory.length - 1]?.id
  const previousActiveBlockIdRef = useRef<string | undefined>(activeBlockId)

  // Don't allow drawer to open if variant is admin or embed
  const isDrawerDisabled = variant === 'admin' || variant === 'embed'

  function handleClick() {
    if (isDrawerDisabled) return
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
    <Drawer open={isDrawerDisabled ? false : open} onOpenChange={setOpen}>
      <DrawerTrigger asChild onClick={handleClick}>
        <Button
          variant="default"
          size="icon"
          aria-label={open ? 'Close AI chat' : 'Open AI chat'}
          tabIndex={0}
          data-testid="AiChatButton"
          className="fixed z-1 bg-background text-foreground rounded-full size-11 hover:bg-background/80"
        >
          <AutoAwesomeIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-[90vh] max-h-[80vh]">
        <DrawerHeader>
          <DrawerClose>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              aria-label="Close AI chat"
            >
              <CloseIcon />
            </Button>
          </DrawerClose>
          <DrawerTitle>{t('Journey Assistant')}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 min-h-0">
          <AiChat open={open} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
