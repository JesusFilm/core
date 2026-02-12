import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import FileShredIcon from '@core/shared/ui/icons/FileShred'

import { MenuItem } from '../../../../MenuItem'

interface TrashMenuProps {
  setOpenRestoreDialog: () => void
  setOpenDeleteDialog: () => void
  handleCloseMenu: () => void
  setHasOpenDialog?: (hasOpenDialog: boolean) => void
}

export function TrashMenu({
  setOpenRestoreDialog,
  setOpenDeleteDialog,
  handleCloseMenu,
  setHasOpenDialog
}: TrashMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <MenuItem
        label={t('Restore')}
        icon={<CheckContainedIcon color="secondary" />}
        onClick={() => {
          setOpenRestoreDialog()
          setHasOpenDialog?.(true)
          handleCloseMenu()
        }}
        testId="Restore"
      />

      <MenuItem
        label={t('Delete Forever')}
        icon={<FileShredIcon color="secondary" />}
        onClick={() => {
          setOpenDeleteDialog()
          setHasOpenDialog?.(true)
          handleCloseMenu()
        }}
        testId="Delete"
      />
    </>
  )
}
