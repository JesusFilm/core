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
  DrawerDescription,
  DrawerHeader,
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
  const invalidVariant = variant === 'admin' || variant === 'embed'

  function handleClick() {
    if (invalidVariant) return
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
    <Drawer
      repositionInputs={false} // important for keyboards on iOS Chrome and iOS Firefox
      open={invalidVariant ? false : open}
      onOpenChange={setOpen}
    >
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
      <DrawerContent className="flex flex-col h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh] data-[vaul-drawer-direction=bottom]:rounded-t-4xl">
        <DrawerHeader>
          <DrawerClose>
            <Button
              size="icon"
              className="absolute top-3 right-4 size-[24px] rounded-full bg-secondary-light"
              aria-label="Close AI chat"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </Button>
          </DrawerClose>
          <div className="flex flex-col">
            <DrawerDescription>{t('AI may make mistakes.')}</DrawerDescription>
            <DrawerDescription>
              {t('Please double-check important info.')}
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <AiChat open={open} />
      </DrawerContent>
    </Drawer>
  )
}
