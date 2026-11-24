import { campaignLocaleFolder } from '@core/journeys/ui/Campaign/libs/campaignStrings'
import { CampaignStringKey } from '@core/prisma/journeys/client'

import {
  CAMPAIGN_STRING_DEFAULTS,
  CAMPAIGN_STRING_KEYS
} from './campaignStrings'

export { campaignLocaleFolder }

type CampaignBundle = Record<string, string>

// One chunk per folder so the API bundle only loads the bundle a campaign
// actually needs. Both bundles are keyed by their English strings.
async function loadCampaignBundle(folder: string): Promise<CampaignBundle> {
  const bundle = await import(
    /* webpackChunkName: "campaign-locale-[request]" */
    `../../../../../../libs/locales/${folder}/libs-journeys-ui.json`
  )
  return bundle.default
}

// Transitional: translations that predate the libs-journeys-ui keys (e.g.
// "Copy link") live in the admin bundle. Drop this once Crowdin delivers the
// libs-journeys-ui keys for every locale.
async function loadLegacyAdminBundle(folder: string): Promise<CampaignBundle> {
  const bundle = await import(
    /* webpackChunkName: "campaign-admin-locale-[request]" */
    `../../../../../../libs/locales/${folder}/apps-journeys-admin.json`
  )
  return bundle.default
}

function translationFor(
  bundle: CampaignBundle,
  englishDefault: string
): string | undefined {
  const translated = bundle[englishDefault]
  if (typeof translated !== 'string' || translated.trim() === '')
    return undefined
  return translated
}

/**
 * The eighteen Campaign String values for a campaign whose default language
 * has the given bcp47 tag: the English wording, or the libs-journeys-ui
 * bundle's translation when the language is not English and the bundle has
 * that exact string, falling back per key to the admin bundle's translation
 * and then English (GLOSSARY.md: Campaign String). The English wording reaches
 * the bundles through the Campaign String registry in libs/journeys/ui.
 */
export async function resolveCampaignStringValues(
  bcp47: string | null | undefined
): Promise<Record<CampaignStringKey, string>> {
  const folder = campaignLocaleFolder(bcp47)
  if (folder == null) return { ...CAMPAIGN_STRING_DEFAULTS }
  const [bundle, legacyBundle] = await Promise.all([
    loadCampaignBundle(folder),
    loadLegacyAdminBundle(folder)
  ])
  const values = { ...CAMPAIGN_STRING_DEFAULTS }
  for (const key of CAMPAIGN_STRING_KEYS) {
    const englishDefault = CAMPAIGN_STRING_DEFAULTS[key]
    const translated =
      translationFor(bundle, englishDefault) ??
      translationFor(legacyBundle, englishDefault)
    if (translated != null) values[key] = translated
  }
  return values
}
