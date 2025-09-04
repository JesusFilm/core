import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Card from '@mui/material/Card'
import Fab from '@mui/material/Fab'
import Grow from '@mui/material/Grow'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { useBlocks } from '@core/journeys/ui/block'
import { AiChat } from '../AiChat'

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
    <>
      <Fab
        color="primary"
        onClick={handleClick}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        tabIndex={0}
        data-testid="AiEditButton"
        sx={{
          position: 'fixed',
          bottom: 32,
          left: 72
        }}
      >
        <AutoAwesomeIcon />
      </Fab>
      <Grow in={open} style={{ transformOrigin: 'bottom left' }}>
        <Card
          sx={{
            position: 'fixed',
            left: 72,
            bottom: 100,
            borderRadius: 4,
            zIndex: 1200,
            width: 600
          }}
        >
          <AiChat open={open} />
        </Card>
      </Grow>
    </>
  )
}
