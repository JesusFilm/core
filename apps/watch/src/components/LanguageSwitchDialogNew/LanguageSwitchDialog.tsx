import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { SiteLanguageSelect } from './SiteLanguageSelect'
import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'
import { websiteLight } from 'libs/shared/ui/src/libs/themes/website/theme'
import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { DialogActions } from './DialogActions'
import { getCookie } from './utils/cookieHandler'

const GET_ALL_LANGUAGES = gql`
  query GetAllLanguages {
    languages {
      id
      bcp47
      slug
      name {
        primary
        value
      }
    }
  }
`

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { data, loading: languagesLoading } =
    useQuery<GetAllLanguages>(GET_ALL_LANGUAGES)
  const { t, i18n } = useTranslation()

  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n?.language ?? 'en'
  )
  const audioLanguageCookie = getCookie('AUDIO_LANGUAGE') ?? '529'
  const subtitleLanguageCookie = getCookie('SUBTITLE_LANGUAGE') ?? '529'
  const subtitlesOnCookie = getCookie('SUBTITLES_ON') ?? 'false'

  const [selectedAudioLanguage, setSelectedAudioLanguage] =
    useState(audioLanguageCookie)
  const [selectedSubtitle, setSelectedSubtitle] = useState(
    subtitleLanguageCookie
  )
  const [subtitlesOn, setSubtitlesOn] = useState(subtitlesOnCookie === 'true')
  const [manuallyChangedFields, setManuallyChangedFields] = useState({
    audio: false,
    subtitle: false
  })
  const [loading, setLoading] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const audioDropdownRef = useRef<HTMLDivElement>(null)
  const subtitleDropdownRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle automatic language updates
  useEffect(() => {
    if (!data?.languages) return

    const selectedLangObj = data.languages.find(
      (lang) => lang.bcp47 === selectedLanguage
    )
    if (!selectedLangObj) return

    // Update audio and subtitle based on site language if not manually changed
    if (!manuallyChangedFields.audio) {
      setSelectedAudioLanguage(selectedLangObj.id)
    }
    if (!manuallyChangedFields.subtitle) {
      setSelectedSubtitle(selectedLangObj.id)
    }
  }, [selectedLanguage, data?.languages])

  // Update subtitle when audio changes if not manually changed
  useEffect(() => {
    if (!manuallyChangedFields.subtitle) {
      setSelectedSubtitle(selectedAudioLanguage)
    }
  }, [selectedAudioLanguage])

  function handleResetForm(): void {
    setSelectedLanguage(i18n.language)
    setSelectedAudioLanguage(audioLanguageCookie)
    setSelectedSubtitle(subtitleLanguageCookie)
    setSubtitlesOn(subtitlesOnCookie === 'true')
    setManuallyChangedFields({ audio: false, subtitle: false })
  }

  function handleDialogCancel(): void {
    handleResetForm()
    handleClose()
  }

  // Handle dialog close and reset form
  useEffect(() => {
    if (!open) {
      handleResetForm()
    }
  }, [open])

  // Handle escape key separately to avoid dependency issues
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDialogCancel()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [open])

  return !open ? (
    <></>
  ) : (
    <ThemeProvider theme={websiteLight}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={dialogRef}
            className="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="mt-8 mb-6 flex items-center justify-between">
              <h3
                id="dialog-title"
                className="text-lg font-medium leading-6 text-gray-900 mx-6"
              >
                {t('Language Settings')}
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mx-6"
                aria-label="Close dialog"
              >
                <span className="sr-only">{t('Close')}</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6">
              <SiteLanguageSelect
                onChange={setSelectedLanguage}
                dropdownRef={languageDropdownRef}
              />
              <hr className="border-t border-gray-200 w-full my-8" />
              <AudioTrackSelect
                languagesData={data?.languages}
                loading={languagesLoading}
                selectedLanguageId={selectedAudioLanguage}
                onChange={(value) => {
                  setSelectedAudioLanguage(value)
                  setManuallyChangedFields((prev) => ({ ...prev, audio: true }))
                }}
                dropdownRef={audioDropdownRef}
              />
              <SubtitlesSelect
                languagesData={data?.languages}
                loading={languagesLoading}
                selectedSubtitleId={selectedSubtitle}
                onChange={(value) => {
                  setSelectedSubtitle(value)
                  setManuallyChangedFields((prev) => ({
                    ...prev,
                    subtitle: true
                  }))
                }}
                subtitlesOn={subtitlesOn}
                setSubtitlesOn={setSubtitlesOn}
                dropdownRef={subtitleDropdownRef}
              />
            </div>
            <div className="mt-8 mx-6 mb-6 flex justify-end">
              <DialogActions
                selectedLanguage={selectedLanguage}
                selectedAudioLanguage={selectedAudioLanguage}
                selectedSubtitle={selectedSubtitle}
                subtitlesOn={subtitlesOn}
                subtitlesOnCookie={subtitlesOnCookie}
                audioLanguageCookie={audioLanguageCookie}
                subtitleLanguageCookie={subtitleLanguageCookie}
                loading={loading}
                setLoading={setLoading}
                handleClose={handleClose}
                handleCancel={handleDialogCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
