import DescriptionIcon from '@mui/icons-material/Description'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { DescriptionDialog } from './DescriptionDialog'

interface Props {
  onClose?: () => void
}

export function DescriptionMenuItem({ onClose }: Props): ReactElement {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
  }

  const handleClose = (): void => {
    setShowDescriptionDialog(false)
    onClose?.()
  }

  return (
    <>
      <MenuItem
        label="Description"
        icon={<DescriptionIcon />}
        onClick={handleUpdateDescription}
      />
      <DescriptionDialog open={showDescriptionDialog} onClose={handleClose} />
    </>
  )
}
