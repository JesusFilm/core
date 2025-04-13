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
  const getTitle = (action: DialogAction | null): string => {
    switch (action) {
      case DialogAction.VIEW:
        return `View ${resource}`
      case DialogAction.CREATE:
        return `Create ${resource}`
      case DialogAction.EDIT:
        return `Edit ${resource}`
      case DialogAction.DELETE:
        return `Delete ${resource}`
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
