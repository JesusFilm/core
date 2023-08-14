import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { TitleDescriptionDialog } from '../../../../JourneyView/TitleDescription/TitleDescriptionDialog'
import { MenuItem } from '../../../../MenuItem'

interface Props {
  isVisible?: boolean
  onClose?: () => void
}

export function TitleDescriptionMenuItem({
  isVisible,
  onClose
}: Props): ReactElement {
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
      {isVisible === true && (
        <MenuItem
          label="Description"
          icon={<EditIcon />}
          onClick={handleUpdateTitleDescription}
        />
      )}
      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={handleClose}
      />
    </>
  )
}
