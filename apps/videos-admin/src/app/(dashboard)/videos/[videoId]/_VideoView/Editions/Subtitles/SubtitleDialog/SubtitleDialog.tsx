import { useMemo } from 'react'

import {
  CrudDialog,
  DialogAction
} from '../../../../../../../../components/CrudDialog'
import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle
} from '../../../../../../../../libs/useAdminVideo/useAdminVideo'

import { SubtitleCreate } from './SubtitleCreate'
import { SubtitleDelete } from './SubtitleDelete'
import { SubtitleEdit } from './SubtitleEdit'

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
  const subtitleLanguagesMap = useMemo(() => {
    const map = new Map<string, Subtitle>()
    edition.videoSubtitles.forEach((subtitle) => {
      if (subtitle.language?.id) {
        map.set(subtitle.language.id, subtitle)
      }
    })
    return map
  }, [edition.videoSubtitles])

  const renderContent = () => {
    if (action === DialogAction.CREATE) {
      return (
        <SubtitleCreate
          close={close}
          edition={edition}
          subtitleLanguagesMap={subtitleLanguagesMap}
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
            subtitleLanguagesMap={subtitleLanguagesMap}
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

  return (
    <CrudDialog action={action} close={close} resource="Subtitle">
      {renderContent()}
    </CrudDialog>
  )
}
