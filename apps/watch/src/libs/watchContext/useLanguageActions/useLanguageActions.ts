import { useCallback } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { setCookie } from '../../cookieHandler'
import { useWatch } from '../WatchContext'

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
 *   const handleLanguageChange = (language: LanguageOption) => {
 *     updateAudioLanguage(language) // Handles state + cookies + reload
 *   }
 * }
 * ```
 */
export function useLanguageActions() {
  const { state, dispatch } = useWatch()

  const updateAudioLanguage = useCallback(
    (language: LanguageOption, reload: boolean = true) => {
      dispatch({ type: 'UpdateAudioLanguage', languageId: language.id })
      setCookie('AUDIO_LANGUAGE', language.id)
      setCookie('SUBTITLE_LANGUAGE', language.id)

      if (state.router && reload && language.slug != null) {
        const { asPath } = state.router
        const [pathname, query] = asPath.split('?')
        const segments = pathname.split('/')
        segments[segments.length - 1] = `${language.slug}.html`
        const newPath = segments.join('/')
        void state.router.push({
          pathname: newPath,
          query
        })
      }
    },
    [state.router, dispatch]
  )

  const updateSubtitleLanguage = useCallback(
    (languageId: string) => {
      dispatch({ type: 'UpdateSubtitleLanguage', languageId })
      setCookie('SUBTITLE_LANGUAGE', languageId)
    },
    [dispatch]
  )

  const updateSubtitlesOn = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'UpdateSubtitlesOn', enabled })
      setCookie('SUBTITLES_ON', enabled.toString())
    },
    [dispatch]
  )

  return {
    dispatch,
    updateAudioLanguage,
    updateSubtitleLanguage,
    updateSubtitlesOn
  }
}
