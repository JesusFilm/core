import DescriptionIcon from '@mui/icons-material/Description'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

import { DescriptionDialog } from './DescriptionDialog'

interface Props {
  isVisible?: boolean
}

export function DescriptionMenuItem({ isVisible }: Props): ReactElement {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
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
