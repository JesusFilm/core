import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../types/array-types'

import { EditionCreate } from './EditionCreate'
import { EditionDelete } from './EditionDelete'
import { EditionEdit } from './EditionEdit'
import { EditionView } from './EditionView'

export enum DialogAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete'
}

export interface EditionDialogProps {
  action: DialogAction | null
  close: () => void
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions> | null
}

export function EditionDialog({
  action,
  close,
  edition
}: EditionDialogProps): ReactElement {
  const t = useTranslations()
  const getTitle = (action: DialogAction | null): string => {
    switch (action) {
      case DialogAction.VIEW:
        return t('View Edition')
      case DialogAction.CREATE:
        return t('Create Edition')
      case DialogAction.EDIT:
        return t('Edit Edition')
      case DialogAction.DELETE:
        return t('Delete Edition')
      default:
        return ''
    }
  }

  const renderContent = () => {
    if (action === DialogAction.CREATE) {
      return <EditionCreate close={close} />
    }

    if (edition == null) {
      return null
    }

    switch (action) {
      case DialogAction.VIEW:
        return <EditionView edition={edition} />
      case DialogAction.EDIT:
        return <EditionEdit edition={edition} close={close} />
      case DialogAction.DELETE:
        return <EditionDelete edition={edition} close={close} />
      default:
        return null
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
      {renderContent()}
    </Dialog>
  )
}
