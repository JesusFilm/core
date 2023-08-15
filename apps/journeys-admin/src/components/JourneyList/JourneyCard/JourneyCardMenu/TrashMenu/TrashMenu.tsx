import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { ReactElement } from 'react'

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
        icon={<CheckCircleRoundedIcon color="secondary" />}
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
