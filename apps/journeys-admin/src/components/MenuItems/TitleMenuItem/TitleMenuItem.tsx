import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../MenuItem/MenuItem'

import { TitleDialog } from './TitleDialog'

export function TitleMenuItem(): ReactElement {
  const [showTitleDialog, setShowTitleDialog] = useState(false)

  const handleUpdateTitle = (): void => {
    setShowTitleDialog(true)
  }

  return (
    <>
      <MenuItem label="Title" icon={<EditIcon />} onClick={handleUpdateTitle} />
      <TitleDialog
        open={showTitleDialog}
        onClose={() => setShowTitleDialog(false)}
      />
    </>
  )
}
