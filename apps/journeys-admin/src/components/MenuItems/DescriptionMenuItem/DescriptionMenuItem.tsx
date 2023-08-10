import DescriptionIcon from '@mui/icons-material/Description'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../MenuItem/MenuItem'

import { DescriptionDialog } from './DescriptionDialog'

export default function DescriptionMenuItem(): ReactElement {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
  }
  return (
    <>
      <MenuItem
        label="Description"
        icon={<DescriptionIcon />}
        onClick={handleUpdateDescription}
      />
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
      />
    </>
  )
}
