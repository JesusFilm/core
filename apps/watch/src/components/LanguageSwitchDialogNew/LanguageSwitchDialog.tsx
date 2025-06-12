import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import ListItem from '@mui/material/ListItem'
import { ThemeProvider } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { ListChildComponentProps } from 'react-window'
import { useRouter } from 'next/router'

import { SiteLanguageSelect } from './SiteLanguageSelect'
import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'
import { websiteLight } from 'libs/shared/ui/src/libs/themes/website/theme'
import { GetLanguagesSlug } from '../../../__generated__/GetLanguagesSlug'
import { useQuery } from '@apollo/client'
import { GET_LANGUAGES_SLUG } from '../AudioLanguageDialog/AudioLanguageDialog'

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

const subtitles = [
  { code: 'en', name: 'English Subtitles' },
  { code: 'es', name: 'Spanish Subtitles' },
  { code: 'fr', name: 'French Subtitles' }
]

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
  if (!match) return undefined
  const value = match.substring(name.length + 1)
  return value.includes('---') ? value.split('---')[1] : value
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n?.language ?? 'en'
  )
  const audioLanguageCookie = getCookie('AUDIO_LANGUAGE') ?? '529'
  const [selectedAudioLanguage, setSelectedAudioLanguage] =
    useState(audioLanguageCookie)
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitles[0].code)

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false)
  const [isSubtitleDropdownOpen, setIsSubtitleDropdownOpen] = useState(false)

  const [noSubtitles, setNoSubtitles] = useState(false)
  const [loading, setLoading] = useState(false)
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
      setIsLanguageDropdownOpen(false)
      setIsAudioDropdownOpen(false)
      setIsSubtitleDropdownOpen(false)
    }
  }, [open])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isLanguageDropdownOpen &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false)
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
    if (
      isLanguageDropdownOpen ||
      isAudioDropdownOpen ||
      isSubtitleDropdownOpen
    ) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageDropdownOpen, isAudioDropdownOpen, isSubtitleDropdownOpen])

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

  function handleSubmit(): void {
    const siteLanguageChanged = selectedLanguage !== i18n.language
    const audioTrackChanged = selectedAudioLanguage !== audioLanguageCookie
    const subtitleChanged = selectedSubtitle !== subtitles[0].code
    const cookieFingerprint = '00005'

    // Site language change
    if (siteLanguageChanged) {
      document.cookie = `NEXT_LOCALE=${cookieFingerprint}---${selectedLanguage}; path=/`
      void i18n.changeLanguage(selectedLanguage)
    }

    // Audio track change
    if (audioTrackChanged) {
      document.cookie = `AUDIO_LANGUAGE=${cookieFingerprint}---${selectedAudioLanguage}; path=/`
    }

    if (siteLanguageChanged || audioTrackChanged || subtitleChanged) {
      setLoading(true)
      router.reload()
    } else {
      handleClose()
    }
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
                onChange={setSelectedLanguage}
                dropdownRef={languageDropdownRef}
                renderInput={renderInput(t('11 languages'))}
                renderOption={renderOption}
              />
              <hr className="border-t border-gray-200 w-full my-8" />
              <AudioTrackSelect
                selectedLanguageId={selectedAudioLanguage}
                onChange={setSelectedAudioLanguage}
                dropdownRef={audioDropdownRef}
                renderInput={renderInput(t('2000 translations'))}
                renderOption={renderOption}
              />
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
                onClick={handleSubmit}
                className="inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label={t('Close dialog')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 animate-spin text-gray-200 fill-current"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#CB333B"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </>
                ) : (
                  t('Done')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
