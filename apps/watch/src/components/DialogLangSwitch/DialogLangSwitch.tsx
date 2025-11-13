import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@core/shared/uimodern/components/dialog'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

interface DialogLangSwitchProps {
  open?: boolean
  handleClose?: () => void
}

export function DialogLangSwitch({
  open,
  handleClose
}: DialogLangSwitchProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    state: {
      videoAudioLanguageIds,
      videoSubtitleLanguageIds,
      audioLanguageId,
      subtitleLanguageId,
      subtitleOn
    }
  } = useWatch()
  return (
    <Dialog
      open={open ?? false}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose?.()
      }}
    >
      <DialogPortal>
        <DialogOverlay className="blured-bg bg-stone-900/5" />
        <DialogContent
          aria-label={t('Language Settings')}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="
            fixed inset-x-0 inset-y-0 z-50 max-w-none translate-x-0 translate-y-0
            overflow-y-auto overscroll-contain border-0 bg-stone-900/5 p-0 text-white
            [&>button]:right-6 [&>button]:top-6 [&>button]:h-12 [&>button]:w-12
            [&>button]:rounded-full [&>button]:bg-black/60 [&>button]:text-white
            [&>button]:hover:bg-black/70
          "
        >
          <DialogTitle className="sr-only">
            {t('Language Settings')}
          </DialogTitle>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 pb-16 pt-20 text-white">
            <AudioTrackSelect
              videoAudioLanguageIds={videoAudioLanguageIds}
              audioLanguageId={audioLanguageId}
            />
            <SubtitlesSelect
              videoSubtitleLanguageIds={videoSubtitleLanguageIds}
              subtitleLanguageId={subtitleLanguageId}
              subtitleOn={subtitleOn}
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
