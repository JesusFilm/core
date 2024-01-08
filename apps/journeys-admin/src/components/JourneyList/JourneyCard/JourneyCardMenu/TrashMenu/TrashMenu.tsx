import { ReactElement } from 'react'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import FileShredIcon from '@core/shared/ui/icons/FileShred'

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
        icon={<CheckContainedIcon color="secondary" />}
        onClick={() => {
          setOpenRestoreDialog()
          handleCloseMenu()
        }}
        testId="Restore"
      />

      <MenuItem
        label="Delete Forever"
        icon={<FileShredIcon color="secondary" />}
        onClick={() => {
          setOpenDeleteDialog()
          handleCloseMenu()
        }}
        testId="Delete"
      />
    </>
  )
}
