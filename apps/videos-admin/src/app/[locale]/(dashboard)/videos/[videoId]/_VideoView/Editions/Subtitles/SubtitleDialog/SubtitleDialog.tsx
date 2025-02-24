import {
  CrudDialog,
  DialogAction
} from '../../../../../../../../../components/CrudDialog'

import { SubtitleCreate } from './SubtitleCreate'
import { SubtitleDelete } from './SubtitleDelete'
import { SubtitleEdit } from './SubtitleEdit'

export function SubtitleDialog({ action, close, subtitle, edition }) {
  const renderContent = () => {
    if (action === DialogAction.CREATE) {
      return <SubtitleCreate close={close} edition={edition} />
    }

    if (subtitle == null) {
      return null
    }

    switch (action) {
      case DialogAction.VIEW:
        return <div>View</div>
      // return <SubtitleView subtitle={subtitle} />
      case DialogAction.EDIT:
        return (
          <SubtitleEdit subtitle={subtitle} edition={edition} close={close} />
        )
      case DialogAction.DELETE:
        return <SubtitleDelete subtitle={subtitle} close={close} />
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
