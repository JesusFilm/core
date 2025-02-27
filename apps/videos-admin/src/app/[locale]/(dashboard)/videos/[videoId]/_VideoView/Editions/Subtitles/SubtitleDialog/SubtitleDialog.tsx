import { useState } from 'react'

import {
  CrudDialog,
  DialogAction
} from '../../../../../../../../../components/CrudDialog'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../types/array-types'

import { SubtitleCreate } from './SubtitleCreate'
import { SubtitleDelete } from './SubtitleDelete'
import { SubtitleEdit } from './SubtitleEdit'

type Edition = ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
type Subtitle = ArrayElement<Edition['videoSubtitles']>

interface SubtitleDialogProps {
  action: DialogAction | null
  close: () => void
  subtitle: Subtitle | null
  edition: Edition
}

export function SubtitleDialog({
  action,
  close,
  subtitle,
  edition
}: SubtitleDialogProps) {
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
            edition={edition}
            subtitle={subtitle}
            close={close}
            dialogState={{ loading, setLoading }}
          />
        )
      case DialogAction.DELETE:
        return (
          <SubtitleDelete edition={edition} subtitle={subtitle} close={close} />
        )
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
