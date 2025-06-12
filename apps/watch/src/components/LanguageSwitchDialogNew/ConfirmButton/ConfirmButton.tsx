import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { LANGUAGE_MAPPINGS } from '../../../config/locales'
import { SUBTITLE_LANGUAGE_IDS } from '../../../config/subtitleLangaugeIds'
import { setCookie } from '../utils/cookieHandler'

interface ConfirmButtonProps {
  selectedLanguage: string
  selectedAudioLanguage: string
  selectedSubtitle: string
  subtitlesOn: boolean
  subtitlesOnCookie: string
  audioLanguageCookie: string
  subtitleLanguageCookie: string
  loading: boolean
  setLoading: (loading: boolean) => void
  handleClose: () => void
}

export function ConfirmButton({
  selectedLanguage,
  selectedAudioLanguage,
  selectedSubtitle,
  subtitlesOn,
  subtitlesOnCookie,
  audioLanguageCookie,
  subtitleLanguageCookie,
  loading,
  setLoading,
  handleClose
}: ConfirmButtonProps): ReactElement {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  function handleSubmit(): void {
    // Site Language cookie is language code e.g. en, es, fr, etc.
    const siteLanguageChanged = selectedLanguage !== i18n.language
    // Audio Language cookie is languageId e.g. 529,
    const audioTrackChanged = selectedAudioLanguage !== audioLanguageCookie
    // Subtitle Language cookie is languageId e.g. 529,
    const subtitleChanged = selectedSubtitle !== subtitleLanguageCookie
    const subtitlesOnChanged = subtitlesOn.toString() !== subtitlesOnCookie
    const cookieFingerprint = '00005'

    // Site language change
    if (siteLanguageChanged) {
      setCookie('NEXT_LOCALE', selectedLanguage)
      const siteLanguageId =
        LANGUAGE_MAPPINGS[selectedLanguage]?.languageId ?? '529'
      void i18n.changeLanguage(selectedLanguage)
      if (!audioTrackChanged) {
        setCookie('AUDIO_LANGUAGE', siteLanguageId)
      }
      if (!audioTrackChanged) {
        setCookie('SUBTITLE_LANGUAGE', siteLanguageId)
      }
    }

    // Audio track change
    if (audioTrackChanged) {
      document.cookie = `AUDIO_LANGUAGE=${cookieFingerprint}---${selectedAudioLanguage}; path=/`
      if (!subtitleChanged) {
        const subtitleLanguageId =
          SUBTITLE_LANGUAGE_IDS.find((id) => id === selectedAudioLanguage) ??
          '529'
        document.cookie = `TODO: SUBTITLE_LANGUAGE=${cookieFingerprint}---${subtitleLanguageId}; path=/`
      }
    }
    // Subtitle change
    if (subtitleChanged) {
      document.cookie = `SUBTITLE_LANGUAGE=${cookieFingerprint}---${selectedSubtitle}; path=/`
    }

    // Subtitles on change
    if (subtitlesOnChanged) {
      document.cookie = `SUBTITLES_ON=${cookieFingerprint}---${subtitlesOn.toString()}; path=/`
    }

    if (siteLanguageChanged) {
      setLoading(true)
      router.reload()
    } else {
      handleClose()
    }
  }

  return (
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
        t('Confirm')
      )}
    </button>
  )
}
