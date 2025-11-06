import LanguageIcon from '@mui/icons-material/Language'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import { DialogLangSwitch } from '../../DialogLangSwitch'

interface AudioLanguageButtonProps {
  componentVariant?: 'icon'
}

export function AudioLanguageButton({
  componentVariant = 'icon'
}: AudioLanguageButtonProps): ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = (): void => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false)
  }

  if (componentVariant === 'icon') {
    return (
      <>
        <IconButton
          data-testid="AudioLanguageButton"
          onClick={handleOpenDialog}
          aria-label="select audio language"
          tabIndex={0}
          sx={{
            color: 'white'
          }}
        >
          <LanguageIcon />
        </IconButton>
        <DialogLangSwitch
          open={isDialogOpen}
          handleClose={handleCloseDialog}
        />
      </>
    )
  }

  return <></>
}
