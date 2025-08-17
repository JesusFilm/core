import { useCallback } from 'react'

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
 *   const { updateSiteLanguage, updateAudioLanguage } = useLanguageActions()
 *
 *   const handleLanguageChange = (language: string) => {
 *     updateSiteLanguage(language) // Handles state + cookies + reload
 *   }
 * }
 * ```
 */
export function useLanguageActions() {
  const { state, dispatch } = useWatch()

  const updateSiteLanguage = useCallback(
    (language: string) => {
      // Dispatch the pure action first
      dispatch({
        type: 'UpdateSiteLanguage',
        language
      })

      // Handle side effects after dispatch
      const selectedLangObj = state.allLanguages?.find(
        (lang) => lang.bcp47 === language
      )
      const newAudioLanguage = selectedLangObj?.id ?? state.audioLanguage
      const newSubtitleLanguage = selectedLangObj?.id ?? state.subtitleLanguage

      // Set affected cookies (exclude site language cookie; language defined by URL)
      setCookie('AUDIO_LANGUAGE', newAudioLanguage)
      setCookie('SUBTITLE_LANGUAGE', newSubtitleLanguage)

      // Find the language slug for the selected language
      const languageSlug = selectedLangObj?.slug

      // Change the URL to include the language slug while preserving current page context
      if (state.router && languageSlug && state.router.asPath) {
        const currentPath = state.router.asPath
        
        // Check if we're on a main page or inner page
        if (currentPath.includes('/watch/') && currentPath.includes('.html/')) {
          // Inner page: preserve the page structure but update language
          // Example: /watch/jesus-calms-the-storm.html/english.html -> /watch/jesus-calms-the-storm.html/spanish.html
          const pathParts = currentPath.split('/')
          
          // Replace the language part with the new language slug
          const newLastPart = `${languageSlug}.html`
          pathParts[pathParts.length - 1] = newLastPart
          
          const newUrl = pathParts.join('/')
          void state.router.push(newUrl)
        } else {
          // Main page: go to language-specific main page
          const newUrl = `/watch/${languageSlug}`
          void state.router.push(newUrl)
        }
      } else {
        // Fallback to reload if no slug found
        setTimeout(() => state.router?.reload(), 0)
      }
    },
    [state.allLanguages, state.audioLanguage, state.router, dispatch]
  )

  const updateAudioLanguage = useCallback(
    (languageId: string) => {
      // Dispatch the pure action first
      dispatch({
        type: 'UpdateAudioLanguage',
        languageId
      })

      // Handle side effects after dispatch
      setCookie('AUDIO_LANGUAGE', languageId)
      setCookie('SUBTITLE_LANGUAGE', languageId)

      // Trigger page reload
      if (state.router) {
        setTimeout(() => state.router?.reload(), 0)
      }
    },
    [state.router, dispatch]
  )

  const updateSubtitleLanguage = useCallback(
    (languageId: string) => {
      // Dispatch the pure action first
      dispatch({
        type: 'UpdateSubtitleLanguage',
        languageId
      })

      // Handle side effects after dispatch (no reload needed)
      setCookie('SUBTITLE_LANGUAGE', languageId)
    },
    [dispatch]
  )

  const updateSubtitlesOn = useCallback(
    (enabled: boolean) => {
      // Dispatch the pure action first
      dispatch({
        type: 'UpdateSubtitlesOn',
        enabled
      })

      // Handle side effects after dispatch (no reload needed)
      setCookie('SUBTITLES_ON', enabled.toString())
    },
    [dispatch]
  )

  return {
    dispatch, // For actions that don't need side effects
    updateSiteLanguage,
    updateAudioLanguage,
    updateSubtitleLanguage,
    updateSubtitlesOn
  }
}
