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
  const renderContent = () => {
    if (action === DialogAction.CREATE) {
      return <SubtitleCreate close={close} edition={edition} />
    }

    if (subtitle == null) {
      return null
    }

    switch (action) {
      case DialogAction.EDIT:
        return <SubtitleEdit edition={edition} subtitle={subtitle} />
      case DialogAction.DELETE:
        return (
          <SubtitleDelete edition={edition} subtitle={subtitle} close={close} />
        )
      default:
        return null
    }
  }

  return (
    <CrudDialog action={action} close={close} resource="Subtitle">
      {renderContent()}
    </CrudDialog>
  )
}
