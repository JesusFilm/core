import { useState } from 'react'

import {
  CrudDialog,
  DialogAction
} from '../../../../../../../../../components/CrudDialog'

import { SubtitleCreate } from './SubtitleCreate'
import { SubtitleDelete } from './SubtitleDelete'
import { SubtitleEdit } from './SubtitleEdit'

export function SubtitleDialog({ action, close, subtitle, edition }) {
  const [loading, setLoading] = useState(false)

  const renderContent = () => {
    if (action === DialogAction.CREATE) {
      return (
        <SubtitleCreate
          close={close}
          edition={edition}
          dialogState={{ loading, setLoading }}
        />
      )
    }

    if (subtitle == null) {
      return null
    }

    switch (action) {
      case DialogAction.EDIT:
        return (
          <SubtitleEdit
            subtitle={subtitle}
            edition={edition}
            close={close}
            dialogState={{ loading, setLoading }}
          />
        )
      case DialogAction.DELETE:
        return <SubtitleDelete subtitle={subtitle} close={close} />
      default:
        return null
    }
  }

  const handleClose = () => {
    if (loading) return
    close()
  }

  return (
    <CrudDialog action={action} close={handleClose} resource="Subtitle">
      {renderContent()}
    </CrudDialog>
  )
}
