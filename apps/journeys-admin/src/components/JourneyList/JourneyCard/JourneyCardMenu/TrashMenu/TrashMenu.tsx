import { ReactElement } from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { MenuItem } from '../MenuItem'

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
        icon={<CheckCircleRoundedIcon color="secondary" />}
        text="Restore"
        handleClick={() => {
          setOpenRestoreDialog()
          handleCloseMenu()
        }}
      />

      <MenuItem
        icon={<DeleteForeverRoundedIcon color="secondary" />}
        text="Delete Forever"
        handleClick={() => {
          setOpenDeleteDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
