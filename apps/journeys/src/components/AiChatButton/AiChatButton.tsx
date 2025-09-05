import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Fab from '@mui/material/Fab'
import Grow from '@mui/material/Grow'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { useBlocks } from '@core/journeys/ui/block'
import { AiChat } from '../AiChat'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'

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
    <Popover modal>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent
        className="bg-background h-[calc(90vh)] sm:h-[800px] w-screen"
        align="start"
        sideOffset={10}
      >
        <AiChat open={open} />
      </PopoverContent>
    </Popover>
  )
}
