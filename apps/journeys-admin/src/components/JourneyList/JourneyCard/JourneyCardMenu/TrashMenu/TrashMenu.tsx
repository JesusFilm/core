import { ReactElement } from 'react'

import CheckContained from '@core/shared/ui/icons/CheckContained'
import FileShred from '@core/shared/ui/icons/FileShred'

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
        icon={<FileShred color="secondary" />}
        onClick={() => {
          setOpenDeleteDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
