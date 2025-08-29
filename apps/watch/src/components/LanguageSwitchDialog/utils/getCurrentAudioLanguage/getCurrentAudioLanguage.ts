import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../../__generated__/GetAllLanguages'
import { AudioLanguageData } from '../../../../libs/watchContext/WatchContext'

interface GetCurrentAudioLanguageParams {
  allLanguages?: Language[]
  currentAudioLanguage?: AudioLanguageData
  routerAsPath: string
  audioLanguage?: string
}

function transformLanguageToOption(language: Language): LanguageOption {
  return {
    id: language.id,
    localName: language.name.find(({ primary }) => primary)?.value,
    nativeName: language.name.find(({ primary }) => !primary)?.value,
    slug: language.slug
  }
}

// Priority 1: Use currentAudioLanguage if available
function getCurrentLanguageFromAudioState(
  allLanguages: Language[],
  currentAudioLanguage?: AudioLanguageData
): LanguageOption | undefined {
  if (!currentAudioLanguage) return undefined

  const selectedLanguage = allLanguages.find(
    (lang) => lang.id === currentAudioLanguage.id
  )

  return selectedLanguage
    ? transformLanguageToOption(selectedLanguage)
    : undefined
}

// Priority 2: Use slug from path
function getCurrentLanguageFromPath(
  allLanguages: Language[],
  routerAsPath: string
): LanguageOption | undefined {
  const currentLanguageSlug = routerAsPath
    .split('/')
    .pop()
    ?.replace('.html', '')

  if (!currentLanguageSlug) return undefined

  const selectedLanguage = allLanguages.find(
    (lang) => lang.slug === currentLanguageSlug
  )

  return selectedLanguage
    ? transformLanguageToOption(selectedLanguage)
    : undefined
}

// Priority 3: Fallback to audioLanguage
function getCurrentLanguageFromAudioSetting(
  allLanguages: Language[],
  audioLanguage?: string
): LanguageOption | undefined {
  if (!audioLanguage) return undefined

  const selectedLanguage = allLanguages.find(
    (lang) => lang.id === audioLanguage
  )

  return selectedLanguage
    ? transformLanguageToOption(selectedLanguage)
    : undefined
}

// Compute current audio language display object with priority logic:
// 1. Use currentAudioLanguage if available
// 2. If undefined, use slug from path
// 3. If that's null, fallback to audioLanguage
export function getCurrentAudioLanguage({
  allLanguages,
  currentAudioLanguage,
  routerAsPath,
  audioLanguage
}: GetCurrentAudioLanguageParams): LanguageOption | undefined {
  if (!allLanguages) return undefined

  // Try each priority in order
  return (
    getCurrentLanguageFromAudioState(allLanguages, currentAudioLanguage) ||
    getCurrentLanguageFromPath(allLanguages, routerAsPath) ||
    getCurrentLanguageFromAudioSetting(allLanguages, audioLanguage)
  )
}
