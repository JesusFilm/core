import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export enum DialogAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete'
}

interface CrudDialogProps {
  action: DialogAction | null
  close: () => void
  resource: string
  children: ReactElement | null
}

export function CrudDialog({
  action,
  close,
  resource,
  children
}: CrudDialogProps): ReactElement {
  const t = useTranslations()

  const getTitle = (action: DialogAction | null): string => {
    switch (action) {
      case DialogAction.VIEW:
        return t(`View ${resource}`)
      case DialogAction.CREATE:
        return t(`Create ${resource}`)
      case DialogAction.EDIT:
        return t(`Edit ${resource}`)
      case DialogAction.DELETE:
        return t(`Delete ${resource}`)
      default:
        return ''
    }
  }

  return (
    <Dialog
      open={action !== null}
      onClose={close}
      dialogTitle={{
        title: getTitle(action),
        closeButton: true
      }}
      divider
    >
      {children}
    </Dialog>
  )
}
