import DescriptionIcon from '@mui/icons-material/Description'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { DescriptionDialog } from './DescriptionDialog'

interface Props {
  isVisible?: boolean
  onClose?: () => void
}

export function DescriptionMenuItem({
  isVisible,
  onClose
}: Props): ReactElement {
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
      {isVisible === true && (
        <MenuItem
          label="Description"
          icon={<DescriptionIcon />}
          onClick={handleUpdateDescription}
        />
      )}
      <DescriptionDialog open={showDescriptionDialog} onClose={handleClose} />
    </>
  )
}
