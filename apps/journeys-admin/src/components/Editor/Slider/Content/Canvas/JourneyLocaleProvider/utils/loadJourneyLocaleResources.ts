import { Dispatch, SetStateAction } from 'react'

import i18nConfig from '../../../../../../../../next-i18next.config'

// Journey languages arrive as BCP-47 tags (`zh-Hans-CN`, `fr`, `de`) but the
// translation folders in libs/locales use full region tags (`zh-Hans-CN`,
// `fr-FR`, `de-DE`). Derive the language -> folder lookup from the app's i18n
// config so the two can't drift (the same source legal/about-chat resolves
// through, NES-1731). `default` is i18next's catch-all, not a language tag.
const FOLDER_BY_LANGUAGE: Record<string, string> = Object.fromEntries(
  Object.entries(i18nConfig.fallbackLng as Record<string, string[]>)
    .filter(([language]) => language !== 'default')
    .map(([language, folders]) => [language, folders[0]] as const)
)

// Tags are case-insensitive per spec but folder names are case-exact:
// `ES` -> `es`, `AR-sa` -> `ar-SA`, `zh-hans-cn` -> `zh-Hans-CN`.
function canonicalizeBcp47(value: string): string {
  const [language, ...subtags] = value.split('-')
  return [
    language.toLowerCase(),
    ...subtags.map((subtag) => {
      if (subtag.length === 2) return subtag.toUpperCase()
      if (subtag.length === 4)
        return subtag[0].toUpperCase() + subtag.slice(1).toLowerCase()
      return subtag.toLowerCase()
    })
  ].join('-')
}

// Walk the canonical tag from most- to least-specific so dialects resolve to
// their base language's folder (`ar-afb` -> `ar-SA`) and `zh-Hant-TW` hits
// `zh-Hant` before `zh`. A tag with no mapping passes through unchanged — it
// may already match a folder directly (`fr-FR`, `zh-Hans-CN`).
export function resolveLocaleFolder(bcp47: string): string {
  const canonical = canonicalizeBcp47(bcp47)
  const subtags = canonical.split('-')
  for (let length = subtags.length; length >= 1; length--) {
    const folder = FOLDER_BY_LANGUAGE[subtags.slice(0, length).join('-')]
    if (folder != null) return folder
  }
  return canonical
}

export const loadJourneyLocaleResources = async (
  locale: string,
  setResources: Dispatch<SetStateAction<Record<string, Record<string, any>>>>
): Promise<void> => {
  const directoryLocale = resolveLocaleFolder(locale)

  try {
    const [uiResources, adminResources] = await Promise.all([
      import(
        /* webpackChunkName: "locale-[request]" */
        `../../../../../../../../../../libs/locales/${directoryLocale}/libs-journeys-ui.json`
      ),
      import(
        /* webpackChunkName: "locale-[request]" */
        `../../../../../../../../../../libs/locales/${directoryLocale}/apps-journeys-admin.json`
      )
    ])

    // Key the resources by the i18n instance's active language (the journey's
    // BCP-47 tag) so lookups resolve. The instance is initialised with
    // `lng: locale`, so this must match exactly.
    setResources({
      [locale]: {
        'libs-journeys-ui': uiResources?.default || uiResources,
        'apps-journeys-admin': adminResources?.default || adminResources
      }
    })
  } catch (error) {
    // graceful error handling to stop app crash from webpack HMR in dev env
    // also handles missing locales
    console.error(
      `Error loading locale resources for ${locale} (${directoryLocale}):`,
      error
    )
  }
}
