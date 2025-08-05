import last from 'lodash/last'
import { NextRouter } from 'next/router'
import { TFunction } from 'next-i18next'

import { GetAllLanguages_languages as Language } from '../../../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../../../__generated__/GetLanguagesSlug'

/**
 * Parameters for audio language setter functions
 */
export interface AudioLanguageSetterParams {
  /** Current audio language selected by the system based on availability */
  currentAudioLanguage?: AudioLanguage
  /** All available languages in the system */
  allLanguages?: Language[]
  /** User's preferred audio language ID */
  audioLanguage: string
  /** Next.js router instance for URL management */
  router: NextRouter
  /** Function to update the helper text displayed to the user */
  setHelperText: (text: string) => void
  /** Translation function for internationalization */
  t: TFunction
}

/**
 * Parameters for finding languages by user preference and URL path
 */
interface FindLanguagesByPreferenceParams {
  /** Next.js router instance for URL path analysis */
  router: NextRouter
  /** All available languages in the system */
  allLanguages?: Language[]
  /** User's preferred audio language ID */
  audioLanguage: string
}

/**
 * Result of finding languages by preference
 */
interface FindLanguagesByPreferenceResult {
  /** Language matching user's audio preference */
  preferredAudioLanguage?: Language
  /** Language matching the current URL path */
  pathLanguage?: Language
  /** Language slug extracted from the URL path */
  pathLanguageSlug?: string
}

/**
 * Parameters for URL update functionality
 */
interface UpdateURLParams {
  /** Next.js router instance for navigation */
  router: NextRouter
  /** Target language slug to update the URL to */
  targetSlug?: string | null
}

/**
 * Parameters for setting language and helper text
 */
interface SetLanguageAndHelperParams {
  /** Language to set as current selection */
  language: Language
  /** Whether this language matches user's preferred language */
  isPreferred: boolean
  /** User's preferred language (for helper text generation) */
  preferredLanguage?: Language
  /** Function to update the helper text displayed to the user */
  setHelperText: (text: string) => void
  /** Translation function for internationalization */
  t: TFunction
}

/**
 * Finds languages based on user preferences and current URL path
 *
 * Analyzes the router path to extract language slug and searches for:
 * - User's preferred audio language
 * - Language matching the current URL path
 *
 * @param params - Configuration object with router and language data
 * @returns Object containing found languages and path information
 */
function findLanguagesByPreference({
  router,
  allLanguages,
  audioLanguage
}: FindLanguagesByPreferenceParams): FindLanguagesByPreferenceResult {
  const path = router.asPath.split('/')
  const pathLanguageSlug = last(path)?.replace('.html', '')

  let preferredAudioLanguage: Language | undefined
  let pathLanguage: Language | undefined

  if (!allLanguages) return { pathLanguageSlug }

  for (const language of allLanguages) {
    if (language.id === audioLanguage) {
      preferredAudioLanguage = language
    }
    if (language.slug === pathLanguageSlug) {
      pathLanguage = language
    }
    if (preferredAudioLanguage && pathLanguage) break
  }

  return { preferredAudioLanguage, pathLanguage, pathLanguageSlug }
}

/**
 * Updates the URL to match the selected language if needed
 *
 * Compares the current URL path with the target language slug and
 * navigates to the new URL if they don't match.
 *
 * @param params - Configuration object with router and target slug
 *
 * @example
 * ```typescript
 * updateURLIfNeeded({ router, targetSlug: 'spanish' })
 * // Updates URL from /watch/video/english to /watch/video/spanish
 * ```
 */
function updateURLIfNeeded({ router, targetSlug }: UpdateURLParams): void {
  if (!targetSlug) return

  const path = router.asPath.split('/')
  const currentPathSlug = last(path)?.replace('.html', '')

  if (currentPathSlug !== targetSlug) {
    void router.push(
      router.asPath.replace(last(router.asPath.split('/')) ?? '', targetSlug)
    )
  }
}

/**
 * Sets the current language selection and appropriate helper text
 *
 * Updates the UI with the selected language and displays either:
 * - "2000 translations" if this is the user's preferred language
 * - "Not available in [preferred language]" if using a fallback language
 *
 * @param params - Configuration object with language data and UI update functions
 */
function setHelper({
  isPreferred,
  preferredLanguage,
  setHelperText,
  t
}: SetLanguageAndHelperParams): void {
  setHelperText(t('2000 translations'))

  if (isPreferred) {
    setHelperText(t('2000 translations'))
  } else if (preferredLanguage) {
    setHelperText(
      t('Not available in {{value}}', {
        value: preferredLanguage.slug
      })
    )
  }
}

/**
 * Selects the appropriate language for video content with complex priority logic
 *
 * Uses a sophisticated priority system:
 * 1. User's preferred language if available for the video
 * 2. Currently selected audio language (from context)
 * 3. Language matching the URL path
 * 4. Fallback to user's preferred language
 *
 * Also handles URL updates to keep the browser URL in sync with the selected language.
 *
 * @param params - Configuration object containing language data and callback functions
 *
 * @example
 * ```typescript
 * selectLanguageForVideo({
 *   currentAudioLanguage: contextLanguage,
 *   allLanguages: availableLanguages,
 *   audioLanguage: 'english',
 *   router,
 *   setHelperText,
 *   t
 * })
 * ```
 */
export function selectLanguageForVideo({
  currentAudioLanguage,
  allLanguages,
  audioLanguage,
  router,
  setHelperText,
  t
}: AudioLanguageSetterParams): void {
  const { preferredAudioLanguage, pathLanguage } = findLanguagesByPreference({
    router,
    allLanguages,
    audioLanguage
  })
  // Scenario 1: User's original preference is matched
  if (
    currentAudioLanguage != null &&
    preferredAudioLanguage != null &&
    currentAudioLanguage.language.id === preferredAudioLanguage.id
  ) {
    setHelper({
      language: preferredAudioLanguage,
      isPreferred: true,
      setHelperText,
      t
    })
    updateURLIfNeeded({ router, targetSlug: preferredAudioLanguage.slug })
  }
  // Scenario 2: Different preference is matched
  else if (currentAudioLanguage != null) {
    const matchingLanguage = allLanguages?.find(
      (lang) => lang.id === currentAudioLanguage.language.id
    )
    if (matchingLanguage) {
      setHelper({
        language: matchingLanguage,
        isPreferred: false,
        preferredLanguage: preferredAudioLanguage,
        setHelperText,
        t
      })
      updateURLIfNeeded({ router, targetSlug: currentAudioLanguage.slug })
    }
  }
  // Scenario 3: Use path language
  else if (pathLanguage != null) {
    setHelper({
      language: pathLanguage,
      isPreferred: false,
      preferredLanguage: preferredAudioLanguage,
      setHelperText,
      t
    })
  }
  // Scenario 4: Fallback to preferred language
  else if (preferredAudioLanguage != null) {
    setHelper({
      language: preferredAudioLanguage,
      isPreferred: true,
      setHelperText,
      t
    })
  }
}
