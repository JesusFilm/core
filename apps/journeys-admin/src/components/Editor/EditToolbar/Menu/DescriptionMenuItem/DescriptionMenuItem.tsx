import DescriptionIcon from '@mui/icons-material/Description'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { DescriptionDialog } from './DescriptionDialog'

interface Props {
  isVisible?: boolean
  onClick?: () => void
}

export function DescriptionMenuItem({
  isVisible,
  onClick
}: Props): ReactElement {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
    onClick?.()
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
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
      />
    </>
  )
}
