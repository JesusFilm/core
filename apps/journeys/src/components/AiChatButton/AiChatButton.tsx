import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Fab from '@mui/material/Fab'
import { ReactElement, useState } from 'react'
import { AiChat } from '../AiChat'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'

export function AiChatButton(): ReactElement {
  const [open, setOpen] = useState<boolean>(false)

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Fab
          color="primary"
          onClick={handleClick}
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
        <AiChat />
      </PopoverContent>
    </Popover>
  )
}
