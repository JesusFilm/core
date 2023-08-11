import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { TitleDialog } from './TitleDialog'

interface Props {
  isVisible?: boolean
}

export function TitleMenuItem({ isVisible }: Props): ReactElement {
  const [showTitleDialog, setShowTitleDialog] = useState(false)

  const handleUpdateTitle = (): void => {
    setShowTitleDialog(true)
  }

  return (
    <>
      {isVisible === true && (
        <MenuItem
          label="Title"
          icon={<EditIcon />}
          onClick={handleUpdateTitle}
        />
      )}
      <TitleDialog
        open={showTitleDialog}
        onClose={() => setShowTitleDialog(false)}
      />
    </>
  )
}
