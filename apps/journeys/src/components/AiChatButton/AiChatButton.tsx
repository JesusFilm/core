import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Card from '@mui/material/Card'
import Fab from '@mui/material/Fab'
import Grow from '@mui/material/Grow'
import { ReactElement, useState } from 'react'
import { AiChat } from '../AiChat'

export function AiChatButton(): ReactElement {
  const [open, setOpen] = useState<boolean>(false)

  const handleClick = () => {
    setOpen(!open)
  }

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
