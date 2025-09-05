import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Fab from '@mui/material/Fab'
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
      {open && (
        <div className="fixed bottom-20 left-4 right-4 h-[600px] z-[1300] rounded-xl shadow-lg border border-gray-200 md:w-[400px] md:right-auto">
          <AiChat />
        </div>
      )}
    </>
  )
}
