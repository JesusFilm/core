import { gql, useLazyQuery } from '@apollo/client'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { useLanguagePreference } from '../../libs/languagePreferenceContext/LanguagePreferenceContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { DialogActions } from './DialogActions'
import { SiteLanguageSelect } from './SiteLanguageSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

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
  const { t } = useTranslation()
  const {
    state: {
      siteLanguage,
      audioLanguage,
      subtitleLanguage,
      subtitleOn,
      allLanguages
    },
    dispatch
  } = useLanguagePreference()
  const [getAllLanguages, { loading: languagesLoading }] =
    useLazyQuery<GetAllLanguages>(GET_ALL_LANGUAGES, {
      onCompleted: (data) => {
        if (data?.languages && !allLanguages) {
          dispatch({
            type: 'SetAllLanguages',
            allLanguages: data.languages
          })
        }
      }
    })

  // TODO: consider also moving these states into provider
  const [selectedLanguage, setSelectedLanguage] = useState(siteLanguage)
  const [selectedAudioLanguage, setSelectedAudioLanguage] =
    useState(audioLanguage)
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitleLanguage)
  const [selectedSubtitlesOn, setSelectedSubtitlesOn] = useState(subtitleOn)
  const [manuallyChangedFields, setManuallyChangedFields] = useState({
    audio: false,
    subtitle: false
  })
  const [loading, setLoading] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const audioDropdownRef = useRef<HTMLDivElement>(null)
  const subtitleDropdownRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Fetch languages when dialog opens if needed
  useEffect(() => {
    if (open && !allLanguages && !languagesLoading) {
      void getAllLanguages()
    }
  }, [open, allLanguages, languagesLoading, getAllLanguages])

  // Handle automatic language updates when site language changes
  useEffect(() => {
    const audioChanged = selectedAudioLanguage !== audioLanguage
    const siteLanguageChanged = selectedLanguage !== siteLanguage
    if (!allLanguages) return

    const selectedLangObj = allLanguages.find(
      (lang) => lang.bcp47 === selectedLanguage
    )
    if (!selectedLangObj) return

    // Update audio and subtitle based on site language if not manually changed
    if (siteLanguageChanged && !manuallyChangedFields.audio) {
      setSelectedAudioLanguage(selectedLangObj.id)
    }
    if (
      (siteLanguageChanged || audioChanged) &&
      !manuallyChangedFields.subtitle
    ) {
      setSelectedSubtitle(selectedLangObj.id)
    }
  }, [
    selectedLanguage,
    allLanguages,
    manuallyChangedFields.audio,
    manuallyChangedFields.subtitle
  ])

  // Update subtitle when audio changes if not manually changed
  useEffect(() => {
    const audioChanged = selectedAudioLanguage !== audioLanguage
    const siteLanguageChanged = selectedLanguage !== siteLanguage

    if (
      (audioChanged || siteLanguageChanged) &&
      !manuallyChangedFields.subtitle
    ) {
      setSelectedSubtitle(selectedAudioLanguage)
    }
  }, [selectedAudioLanguage, manuallyChangedFields.subtitle])

  function handleResetForm(): void {
    setSelectedLanguage(siteLanguage)
    setSelectedAudioLanguage(audioLanguage)
    setSelectedSubtitle(subtitleLanguage)
    setSelectedSubtitlesOn(subtitleOn)
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
                loading={languagesLoading}
                value={selectedAudioLanguage}
                onChange={(value) => {
                  setSelectedAudioLanguage(value)
                  setManuallyChangedFields((prev) => ({ ...prev, audio: true }))
                }}
                dropdownRef={audioDropdownRef}
              />
              <SubtitlesSelect
                loading={languagesLoading}
                value={selectedSubtitle}
                onChange={(value) => {
                  setSelectedSubtitle(value)
                  setManuallyChangedFields((prev) => ({
                    ...prev,
                    subtitle: true
                  }))
                }}
                setSubtitlesOn={setSelectedSubtitlesOn}
                dropdownRef={subtitleDropdownRef}
              />
            </div>
            <div className="mt-8 mx-6 mb-6 flex justify-end">
              <DialogActions
                selectedLanguage={selectedLanguage}
                selectedAudioLanguage={selectedAudioLanguage}
                selectedSubtitle={selectedSubtitle}
                subtitlesOn={selectedSubtitlesOn}
                subtitlesOnCookie={subtitleOn.toString()}
                audioLanguageCookie={audioLanguage}
                subtitleLanguageCookie={subtitleLanguage}
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
