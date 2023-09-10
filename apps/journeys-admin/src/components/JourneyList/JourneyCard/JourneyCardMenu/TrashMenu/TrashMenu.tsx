import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded' // icon-replace: add file-shred
import { ReactElement } from 'react'

import CheckContained from '@core/shared/ui/icons/CheckContained'

import { MenuItem } from '../../../../MenuItem'

interface TrashMenuProps {
  setOpenRestoreDialog: () => void
  setOpenDeleteDialog: () => void
  handleCloseMenu: () => void
}

export function TrashMenu({
  setOpenRestoreDialog,
  setOpenDeleteDialog,
  handleCloseMenu
}: TrashMenuProps): ReactElement {
  return (
    <>
      <MenuItem
        label="Restore"
        icon={<CheckContained color="secondary" />}
        onClick={() => {
          setOpenRestoreDialog()
          handleCloseMenu()
        }}
      />

      <MenuItem
        label="Delete Forever"
        icon={<DeleteForeverRoundedIcon color="secondary" />}
        onClick={() => {
          setOpenDeleteDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
