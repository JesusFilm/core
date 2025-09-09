import { useRouter } from 'next/router'

import { setCookie } from '../../cookieHandler'
import { useWatch } from '../WatchContext'

interface UseLanguageActionsHook {
  updateAudioLanguage: (
    language: { id: string; slug: string },
    reload?: boolean
  ) => void
  updateSubtitleLanguage: (language: { id: string }) => void
  updateSubtitlesOn: (subtitleOn: boolean) => void
}

/**
 * Hook that provides action dispatchers with side effects
 * This separates side effects from the pure reducer
 *
 * @returns Object containing action functions that handle both state updates and side effects
 *
 * @example
 * ```typescript
 * function LanguageSelector() {
 *   const { updateAudioLanguage } = useLanguageActions()
 *
 *   const handleLanguageChange = (language: Language) => {
 *     updateAudioLanguage(language) // Handles state + cookies + reload
 *   }
 * }
 * ```
 */
export function useLanguageActions(): UseLanguageActionsHook {
  const { dispatch } = useWatch()
  const router = useRouter()

  function updateAudioLanguage(
    language: { id: string; slug: string },
    reload: boolean = true
  ) {
    dispatch({
      type: 'SetLanguagePreferences',
      audioLanguageId: language.id
    })
    setCookie('AUDIO_LANGUAGE', language.id)
    updateSubtitleLanguage(language)

    if (reload) {
      const [pathname, query] = router.asPath.split('?')
      const segments = pathname.split('/')
      segments[segments.length - 1] = `${language.slug}.html`
      const newPath = segments.join('/')
      void router.push({
        pathname: newPath,
        query
      })
    }
  }

  function updateSubtitleLanguage(language: { id: string }) {
    dispatch({
      type: 'SetLanguagePreferences',
      subtitleLanguageId: language.id
    })
    setCookie('SUBTITLE_LANGUAGE', language.id)
  }

  function updateSubtitlesOn(subtitleOn: boolean) {
    dispatch({ type: 'SetLanguagePreferences', subtitleOn })
    setCookie('SUBTITLES_ON', subtitleOn.toString())
  }

  return {
    updateAudioLanguage,
    updateSubtitleLanguage,
    updateSubtitlesOn
  }
}
