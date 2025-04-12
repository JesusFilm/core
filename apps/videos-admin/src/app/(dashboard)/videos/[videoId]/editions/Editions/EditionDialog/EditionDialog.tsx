import { ReactElement } from 'react'

import {
  CrudDialog,
  DialogAction
} from '../../../../../../../components/CrudDialog'
import { GetAdminVideo_AdminVideo_VideoEdition as Edition } from '../../../../../../../libs/useAdminVideo/useAdminVideo'

import { EditionCreate } from './EditionCreate'
import { EditionDelete } from './EditionDelete'
import { EditionEdit } from './EditionEdit'
import { EditionView } from './EditionView'

export interface EditionDialogProps {
  action: DialogAction | null
  close: () => void
  edition: Edition | null
}

export function EditionDialog({
  action,
  close,
  edition
}: EditionDialogProps): ReactElement {
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
    <CrudDialog action={action} close={close} resource="Edition">
      {renderContent()}
    </CrudDialog>
  )
}
