import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Fab from '@mui/material/Fab'
import { ReactElement, useState } from 'react'

import { AiChat } from '../../AiChat'

interface AiEditButtonProps {
  disabled?: boolean
}

export function AiEditButton({ disabled }: AiEditButtonProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <>
      <Fab
        color="primary"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          left: 72
        }}
      >
        <AutoAwesomeIcon />
      </Fab>
      <AiChat open={open} />
    </>
  )
}
