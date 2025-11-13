import { ReactElement } from 'react'

import { useWatch } from '../../libs/watchContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '../Dialog'

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
  const {
    state: {
      videoAudioLanguageIds,
      videoSubtitleLanguageIds,
      audioLanguageId,
      subtitleLanguageId,
      subtitleOn
    }
  } = useWatch()
  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen && handleClose != null) handleClose()
  }

  return (
    <Dialog open={open ?? false} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay className="blured-bg bg-stone-900/5" />
        <DialogContent
          aria-label="Language Settings"
          className="
            fixed inset-0 z-[201] max-w-none translate-x-0 translate-y-0 border-0
            bg-transparent p-0 shadow-none outline-none
            overflow-y-auto overscroll-contain
            [&>button]:right-10 [&>button]:top-10 [&>button]:cursor-pointer
            [&>button]:text-white [&>button]:scale-150
          "
        >
          <DialogTitle className="sr-only">Language Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Select audio language and subtitle options for the current video.
          </DialogDescription>
          <div className="flex min-h-full w-full items-center justify-center px-4 py-12 md:px-10">
            <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-black/40 px-6 py-10 backdrop-blur-sm">
              <div className="flex flex-col gap-12">
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
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
