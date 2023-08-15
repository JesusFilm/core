import EditIcon from '@mui/icons-material/Edit'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { TitleDialog } from './TitleDialog'

interface Props {
  onClose?: () => void
}

export function TitleMenuItem({ onClose }: Props): ReactElement {
  const [showTitleDialog, setShowTitleDialog] = useState(false)

  const handleUpdateTitle = (): void => {
    setShowTitleDialog(true)
  }

  const handleClose = (): void => {
    setShowTitleDialog(false)
    onClose?.()
  }

  return (
    <>
      <MenuItem label="Title" icon={<EditIcon />} onClick={handleUpdateTitle} />
      <TitleDialog open={showTitleDialog} onClose={handleClose} />
    </>
  )
}
