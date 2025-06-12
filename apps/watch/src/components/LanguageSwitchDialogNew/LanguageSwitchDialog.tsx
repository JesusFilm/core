import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { SiteLanguageSelect } from './SiteLanguageSelect'
import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'
import { websiteLight } from 'libs/shared/ui/src/libs/themes/website/theme'
import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { ConfirmButton } from './ConfirmButton'
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

  const [loading, setLoading] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const audioDropdownRef = useRef<HTMLDivElement>(null)
  const subtitleDropdownRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle dialog close and reset form
  useEffect(() => {
    if (!open) {
      handleResetForm()
    }

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
  }, [open, handleDialogCancel])

  function handleResetForm(): void {
    setSelectedLanguage(i18n.language)
    setSelectedAudioLanguage(audioLanguageCookie)
    setSelectedSubtitle(subtitleLanguageCookie)
    setSubtitlesOn(subtitlesOnCookie === 'true')
  }

  function handleDialogCancel(): void {
    handleResetForm()
    handleClose()
  }

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
                onChange={setSelectedAudioLanguage}
                dropdownRef={audioDropdownRef}
              />
              <SubtitlesSelect
                languagesData={data?.languages}
                loading={languagesLoading}
                selectedSubtitleId={selectedSubtitle}
                onChange={setSelectedSubtitle}
                subtitlesOn={subtitlesOn}
                setSubtitlesOn={setSubtitlesOn}
                dropdownRef={subtitleDropdownRef}
              />
            </div>
            <div className="mt-8 mx-6 mb-6 flex justify-end">
              <ConfirmButton
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
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
