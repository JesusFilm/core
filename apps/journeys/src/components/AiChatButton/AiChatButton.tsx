import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import Fab from '@mui/material/Fab'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useBlocks } from '@core/journeys/ui/block'

import { AiChat } from '../AiChat'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../Drawer'
import { Button } from '../Button'

export function AiChatButton(): ReactElement {
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
      <DrawerTrigger>
        <Fab
          color="primary"
          onClick={handleClick}
          aria-label={open ? 'Close AI chat' : 'Open AI chat'}
          tabIndex={0}
          data-testid="AiEditButton"
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1200
          }}
        >
          <AutoAwesomeIcon />
        </Fab>
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
          <DrawerTitle>Journey Assistant</DrawerTitle>
          <DrawerDescription>You ask I answer.</DrawerDescription>
        </DrawerHeader>
        <AiChat open={open} />
      </DrawerContent>
    </Drawer>
  )
}
