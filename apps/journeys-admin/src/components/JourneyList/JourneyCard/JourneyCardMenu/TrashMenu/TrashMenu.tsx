import { useTranslation } from 'next-i18next'
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
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <MenuItem
        label={t('Restore')}
        icon={<CheckContainedIcon color="secondary" />}
        onClick={() => {
          setOpenRestoreDialog()
          handleCloseMenu()
        }}
        testId="Restore"
      />

      <MenuItem
        label={t('Delete Forever')}
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
