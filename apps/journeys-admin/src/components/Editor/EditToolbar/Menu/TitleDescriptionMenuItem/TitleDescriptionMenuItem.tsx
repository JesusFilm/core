import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { TitleDescriptionDialog } from '../../../../JourneyView/TitleDescription/TitleDescriptionDialog'
import { MenuItem } from '../../../../MenuItem'

interface Props {
  onClose?: () => void
}

export function TitleDescriptionMenuItem({ onClose }: Props): ReactElement {
  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
  }

  const handleClose = (): void => {
    setShowTitleDescriptionDialog(false)
    onClose?.()
  }

  return (
    <>
      <MenuItem
        label="Description"
        icon={<EditIcon />}
        onClick={handleUpdateTitleDescription}
      />
      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={handleClose}
      />
    </>
  )
}
