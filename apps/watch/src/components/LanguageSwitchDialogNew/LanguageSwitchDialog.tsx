import { ReactElement, useEffect, useState, useRef } from 'react'
import { Icon } from 'libs/shared/ui/src/components/icons/Icon'

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
  { code: 'none', name: 'None' },
  { code: 'en', name: 'English Subtitles' },
  { code: 'es', name: 'Spanish Subtitles' },
  { code: 'fr', name: 'French Subtitles' }
]

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedAudio, setSelectedAudio] = useState(audioTracks[0].code)
  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState(subtitles[0].code)
  const [isSubtitleDropdownOpen, setIsSubtitleDropdownOpen] = useState(false)

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

  return !open ? (
    <></>
  ) : (
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
          <div className="absolute right-4 top-4">
            <button
              onClick={handleClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <span className="sr-only">Close</span>
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

          <div className="mt-8 mb-6 mx-6">
            <h3
              id="dialog-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Language Settings
            </h3>
            <div className="mt-6">
              <label
                htmlFor="language-select"
                className="block text-sm font-medium text-gray-700 ml-7"
              >
                Site Language
              </label>
              <div
                className="relative mt-1 flex items-center gap-2"
                ref={languageDropdownRef}
              >
                <Icon name="Globe" fontSize="small" />
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm flex items-center"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-labelledby="language-select-label"
                  >
                    <span className="block truncate flex-1">
                      {selectedLanguageName}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <Icon
                        name={isDropdownOpen ? 'ChevronUp' : 'ChevronDown'}
                        fontSize="small"
                        color="inherit"
                      />
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <ul
                      className="absolute z-[100] left-0 top-full mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                      role="listbox"
                      aria-labelledby="language-select-label"
                    >
                      {languages.map((language) => (
                        <li
                          key={language.code}
                          className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-gray-100 ${
                            language.code === selectedLanguage
                              ? 'bg-gray-50'
                              : ''
                          }`}
                          role="option"
                          aria-selected={language.code === selectedLanguage}
                          onClick={() => {
                            setSelectedLanguage(language.code)
                            setIsDropdownOpen(false)
                          }}
                        >
                          <span
                            className={`block truncate ${
                              language.code === selectedLanguage
                                ? 'font-medium'
                                : 'font-normal'
                            }`}
                          >
                            {language.name}
                          </span>
                          {language.code === selectedLanguage && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr className="border-t border-gray-200 w-full" />
          <div className="mt-6 mx-6">
            {/* Audio Track Select */}
            <div className="mb-4">
              <label
                htmlFor="audio-select"
                className="block text-sm font-medium text-gray-700 ml-7"
              >
                Audio Track
              </label>
              <div
                className="relative mt-1 flex items-center gap-2"
                ref={audioDropdownRef}
              >
                <Icon name="MediaStrip1" fontSize="small" />
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsAudioDropdownOpen(!isAudioDropdownOpen)}
                    className="w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm flex items-center"
                    aria-haspopup="listbox"
                    aria-expanded={isAudioDropdownOpen}
                    aria-labelledby="audio-select-label"
                  >
                    <span className="block truncate flex-1">
                      {
                        audioTracks.find(
                          (track) => track.code === selectedAudio
                        )?.name
                      }
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <Icon
                        name={isAudioDropdownOpen ? 'ChevronUp' : 'ChevronDown'}
                        fontSize="small"
                        color="inherit"
                      />
                    </span>
                  </button>

                  {isAudioDropdownOpen && (
                    <ul
                      className="absolute z-[100] left-0 top-full mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                      role="listbox"
                      aria-labelledby="audio-select-label"
                    >
                      {audioTracks.map((track) => (
                        <li
                          key={track.code}
                          className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-gray-100 ${
                            track.code === selectedAudio ? 'bg-gray-50' : ''
                          }`}
                          role="option"
                          aria-selected={track.code === selectedAudio}
                          onClick={() => {
                            setSelectedAudio(track.code)
                            setIsAudioDropdownOpen(false)
                          }}
                        >
                          <span
                            className={`block truncate ${
                              track.code === selectedAudio
                                ? 'font-medium'
                                : 'font-normal'
                            }`}
                          >
                            {track.name}
                          </span>
                          {track.code === selectedAudio && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Subtitles Select */}
            <div className="mb-4">
              <label
                htmlFor="subtitle-select"
                className="block text-sm font-medium text-gray-700 ml-7"
              >
                Subtitles
              </label>
              <div
                className="relative mt-1 flex items-center gap-2"
                ref={subtitleDropdownRef}
              >
                <Icon name="Type3" fontSize="small" />
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSubtitleDropdownOpen(!isSubtitleDropdownOpen)
                    }
                    className="w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm flex items-center"
                    aria-haspopup="listbox"
                    aria-expanded={isSubtitleDropdownOpen}
                    aria-labelledby="subtitle-select-label"
                  >
                    <span className="block truncate flex-1">
                      {
                        subtitles.find((sub) => sub.code === selectedSubtitle)
                          ?.name
                      }
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <Icon
                        name={
                          isSubtitleDropdownOpen ? 'ChevronUp' : 'ChevronDown'
                        }
                        fontSize="small"
                        color="inherit"
                      />
                    </span>
                  </button>

                  {isSubtitleDropdownOpen && (
                    <ul
                      className="absolute z-[100] left-0 top-full mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                      role="listbox"
                      aria-labelledby="subtitle-select-label"
                    >
                      {subtitles.map((sub) => (
                        <li
                          key={sub.code}
                          className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-gray-100 ${
                            sub.code === selectedSubtitle ? 'bg-gray-50' : ''
                          }`}
                          role="option"
                          aria-selected={sub.code === selectedSubtitle}
                          onClick={() => {
                            setSelectedSubtitle(sub.code)
                            setIsSubtitleDropdownOpen(false)
                          }}
                        >
                          <span
                            className={`block truncate ${
                              sub.code === selectedSubtitle
                                ? 'font-medium'
                                : 'font-normal'
                            }`}
                          >
                            {sub.name}
                          </span>
                          {sub.code === selectedSubtitle && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 mx-6 mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
