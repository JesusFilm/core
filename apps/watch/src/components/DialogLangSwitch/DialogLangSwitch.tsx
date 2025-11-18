import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@core/shared/uimodern/components/dialog'

import { useLanguageActions, useWatch } from '../../libs/watchContext'

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
  const [pendingChanges, setPendingChanges] = useState<{
    audioLanguage?: { id: string; slug: string }
    subtitleLanguageId?: string
    subtitleOn?: boolean
  }>({})
  const { updateAudioLanguage, updateSubtitleLanguage, updateSubtitlesOn } =
    useLanguageActions()

  const {
    state: {
      videoAudioLanguageIds,
      videoSubtitleLanguageIds,
      audioLanguageId,
      subtitleLanguageId,
      subtitleOn
    }
  } = useWatch()

  const handleAudioLanguageChange = (language: {
    id: string
    slug: string
  }) => {
    setPendingChanges((prev) => ({ ...prev, audioLanguage: language }))
  }

  const handleSubtitleLanguageChange = (languageId: string) => {
    setPendingChanges((prev) => ({ ...prev, subtitleLanguageId: languageId }))
  }

  const handleSubtitleToggleChange = (subtitleOn: boolean) => {
    setPendingChanges((prev) => ({ ...prev, subtitleOn }))
  }

  const handleSubmit = () => {
    // Apply all pending changes
    // Apply audio language first (this also sets subtitle language to match)
    if (pendingChanges.audioLanguage !== undefined) {
      // Determine if we should reload based on whether the language is in available languages
      // On the home page (when videoAudioLanguageIds is undefined), always reload to navigate to language-specific page
      const shouldReload =
        videoAudioLanguageIds?.includes(pendingChanges.audioLanguage.id) ?? true
      updateAudioLanguage(pendingChanges.audioLanguage, shouldReload)
    }

    // Apply subtitle changes (these override the automatic subtitle setting from audio)
    if (pendingChanges.subtitleLanguageId !== undefined) {
      updateSubtitleLanguage({ id: pendingChanges.subtitleLanguageId })
    }
    if (pendingChanges.subtitleOn !== undefined) {
      updateSubtitlesOn(pendingChanges.subtitleOn)
    }

    setPendingChanges({})
    // Close dialog after a short delay to ensure state updates are processed
    setTimeout(() => handleClose?.(), 100)
  }

  const handleCloseDialog = () => {
    setPendingChanges({})
    handleClose?.()
  }
  return (
    <Dialog
      open={open || false}
      onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
    >
      <DialogPortal>
        <DialogOverlay className="blured-bg z-[100] bg-stone-900/5" />
        <DialogContent
          className="fixed inset-0 left-0 z-[101] flex max-w-none translate-x-0 translate-y-0 items-center justify-center overflow-y-auto overscroll-contain border-0 bg-stone-900/5 p-0 [&>button]:top-24 [&>button]:right-18 [&>button]:scale-175 [&>button]:cursor-pointer"
          aria-label="Language Settings"
        >
          <div className="mx-auto w-full max-w-md px-4">
            <div className="space-y-8">
              <AudioTrackSelect
                videoAudioLanguageIds={videoAudioLanguageIds}
                audioLanguageId={
                  pendingChanges.audioLanguage?.id ?? audioLanguageId
                }
                onLanguageChange={handleAudioLanguageChange}
              />
              <SubtitlesSelect
                videoSubtitleLanguageIds={videoSubtitleLanguageIds}
                subtitleLanguageId={
                  pendingChanges.subtitleLanguageId ?? subtitleLanguageId
                }
                subtitleOn={pendingChanges.subtitleOn ?? subtitleOn}
                onLanguageChange={handleSubtitleLanguageChange}
                onSubtitleToggleChange={handleSubtitleToggleChange}
              />
              <div className="mx-6 flex justify-end gap-4 pt-6">
                <button
                  onClick={handleCloseDialog}
                  className="inline-flex max-h-10 cursor-pointer items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-bold tracking-wider text-white/50 uppercase transition-colors duration-200 hover:text-[#cb333b]"
                >
                  {t('Close')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(pendingChanges).length === 0}
                  className="inline-flex max-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('Apply')}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
