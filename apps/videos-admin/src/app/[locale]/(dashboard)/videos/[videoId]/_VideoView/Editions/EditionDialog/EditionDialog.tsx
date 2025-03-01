import { ReactElement } from 'react'

import {
  CrudDialog,
  DialogAction
} from '../../../../../../../../components/CrudDialog'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../types/array-types'

import { EditionCreate } from './EditionCreate'
import { EditionDelete } from './EditionDelete'
import { EditionEdit } from './EditionEdit'
import { EditionView } from './EditionView'

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
