import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { TitleDescriptionDialog } from '../../../../JourneyView/TitleDescription/TitleDescriptionDialog'
import { MenuItem } from '../../../../MenuItem'

interface Props {
  isVisible?: boolean
  onClick?: () => void
}

export function TitleDescriptionMenuItem({
  isVisible,
  onClick
}: Props): ReactElement {
  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
    onClick?.()
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
        onClose={() => setShowTitleDescriptionDialog(false)}
      />
    </>
  )
}
