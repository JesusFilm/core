import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import ListItem from '@mui/material/ListItem'
import { ThemeProvider } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { ListChildComponentProps } from 'react-window'

import { SiteLanguageSelect } from './SiteLanguageSelect'
import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'
import { websiteLight } from 'libs/shared/ui/src/libs/themes/website/theme'

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' }
]

const audioTracks = [
  { code: 'en', name: 'English Audio' },
  { code: 'es', name: 'Spanish Audio' },
  { code: 'fr', name: 'French Audio' }
]

const subtitles = [
  { code: 'en', name: 'English Subtitles' },
  { code: 'es', name: 'Spanish Subtitles' },
  { code: 'fr', name: 'French Subtitles' }
]

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedAudio, setSelectedAudio] = useState(audioTracks[0].code)
  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitles[0].code)
  const [isSubtitleDropdownOpen, setIsSubtitleDropdownOpen] = useState(false)
  const [noSubtitles, setNoSubtitles] = useState(false)

  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const audioDropdownRef = useRef<HTMLDivElement>(null)
  const subtitleDropdownRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [open, handleClose])

  // Close dropdown when dialog closes
  useEffect(() => {
    if (!open) {
      setIsDropdownOpen(false)
      setIsAudioDropdownOpen(false)
      setIsSubtitleDropdownOpen(false)
    }
  }, [open])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isDropdownOpen &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
      if (
        isAudioDropdownOpen &&
        audioDropdownRef.current &&
        !audioDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAudioDropdownOpen(false)
      }
      if (
        isSubtitleDropdownOpen &&
        subtitleDropdownRef.current &&
        !subtitleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubtitleDropdownOpen(false)
      }
    }
    if (isDropdownOpen || isAudioDropdownOpen || isSubtitleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isAudioDropdownOpen, isSubtitleDropdownOpen])

  const selectedLanguageName = languages.find(
    (lang) => lang.code === selectedLanguage
  )?.name

  // Custom renderInput for all selects
  const renderInput =
    (helperText?: string) => (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        hiddenLabel
        variant="filled"
        helperText={helperText}
        data-testid="LanguageSwitchDialog-Select"
      />
    )

  // Custom renderOption for all selects
  const renderOption = (props: ListChildComponentProps) => {
    const { data, index, style } = props
    const { id, localName, nativeName } = data[index][1]
    const { key, ...optionProps } = data[index][0]
    return (
      <ListItem
        {...optionProps}
        key={id}
        style={style}
        tabIndex={1}
        sx={{
          display: 'block',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f3f4f6' // Tailwind's gray-100
          }
        }}
      >
        <Typography variant="h6">{localName ?? nativeName}</Typography>
        {localName != null && nativeName != null && (
          <Typography variant="body2" color="text.secondary">
            {nativeName}
          </Typography>
        )}
      </ListItem>
    )
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
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                languages={languages}
                t={t}
                dropdownRef={languageDropdownRef}
                renderInput={renderInput(t('11 languages'))}
                renderOption={renderOption}
              />
              <hr className="border-t border-gray-200 w-full my-8" />
              {/* Audio Track & Subtitles Section */}
              <AudioTrackSelect
                value={selectedAudio}
                onChange={setSelectedAudio}
                languages={audioTracks}
                t={t}
                dropdownRef={audioDropdownRef}
                currentTrackName={
                  audioTracks.find((track) => track.code === selectedAudio)
                    ?.name || ''
                }
                renderInput={renderInput(t('2000 translations'))}
                renderOption={renderOption}
              />

              {/* Subtitles Select */}
              <SubtitlesSelect
                value={selectedSubtitle}
                onChange={setSelectedSubtitle}
                languages={subtitles}
                t={t}
                dropdownRef={subtitleDropdownRef}
                noSubtitles={noSubtitles}
                setNoSubtitles={setNoSubtitles}
                disabled={!noSubtitles}
                renderInput={renderInput(t('2000 translations'))}
                renderOption={renderOption}
              />
            </div>
            <div className="mt-8 mx-6 mb-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label={t('Close dialog')}
              >
                {t('Done')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
