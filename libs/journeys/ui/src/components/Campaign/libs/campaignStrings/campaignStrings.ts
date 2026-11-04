/**
 * The Campaign String registry: the eighteen keys, their English wording, the
 * sections that show each one and the locale-folder map the API seeds
 * translations from. The one copy the API seed, the renderer and the editor
 * read. Pure: it imports no generated types, React or Prisma, so the API can
 * import it.
 */
import type { CampaignTypename } from '../campaignBlockGrammar'

/** The eighteen Campaign Strings in seed order. */
export const CAMPAIGN_STRING_KEYS = [
  'allRegions',
  'step1',
  'step2',
  'step2help',
  'step3',
  'step4',
  'copy',
  'copied',
  'downloadQr',
  'open',
  'watch',
  'openTemplate',
  'youtube',
  'totalVisitors',
  'topCountry',
  'seeAllOnWatch',
  'videos',
  'noJourneys'
] as const
export type CampaignStringKeyName = (typeof CAMPAIGN_STRING_KEYS)[number]

/**
 * The English wording of every Campaign String, written as `t()` calls so
 * extraction puts each one in the libs-journeys-ui bundle. The API seed passes
 * an identity `t` and looks the English up in the campaign language's bundle.
 */
export function campaignStringWording(
  t: (english: string) => string
): Record<CampaignStringKeyName, string> {
  return {
    allRegions: t('All regions'),
    step1: t('Pick a language your friend understands.'),
    step2: t('Preview what they will see.'),
    step2help: t('Tap through the preview like they would.'),
    step3: t('Share this link with them.'),
    step4: t('Or download a QR code for print.'),
    copy: t('Copy link'),
    copied: t('Link copied'),
    downloadQr: t('Download QR code'),
    open: t('Open'),
    watch: t('Watch'),
    openTemplate: t('Open journey'),
    youtube: t('Watch on YouTube'),
    totalVisitors: t('Total visitors'),
    topCountry: t('Top country'),
    seeAllOnWatch: t('See all on Watch'),
    videos: t('videos'),
    noJourneys: t('Journeys for this region are coming soon')
  }
}

/**
 * The sections whose public rendering shows each Campaign String, in order:
 * the first host present in a Campaign is where the editor takes you to edit
 * it. Hero and Featured Media list `videos` whatever their Media Slot holds,
 * since a playlist there reads it.
 */
export const CAMPAIGN_STRING_HOSTS: Record<
  CampaignStringKeyName,
  readonly CampaignTypename[]
> = {
  allRegions: ['CampaignHeaderBlock', 'CampaignAnalyticsBlock'],
  step1: ['CampaignRegionShareBlock'],
  step2: ['CampaignRegionShareBlock'],
  step2help: ['CampaignRegionShareBlock'],
  step3: ['CampaignRegionShareBlock'],
  step4: ['CampaignRegionShareBlock'],
  copy: ['CampaignRegionShareBlock'],
  copied: ['CampaignRegionShareBlock'],
  downloadQr: ['CampaignRegionShareBlock'],
  open: ['CampaignRegionShareBlock'],
  watch: ['CampaignVideoCarouselBlock'],
  openTemplate: ['CampaignJourneyListBlock'],
  youtube: ['CampaignVideoCarouselBlock'],
  totalVisitors: ['CampaignAnalyticsBlock'],
  topCountry: ['CampaignAnalyticsBlock'],
  seeAllOnWatch: ['CampaignVideoCarouselBlock'],
  videos: [
    'CampaignVideoCarouselBlock',
    'CampaignHeroBlock',
    'CampaignFeaturedMediaBlock'
  ],
  noJourneys: ['CampaignJourneyListBlock']
}

/** The sections that show a Campaign String, first host first. */
export function campaignStringHosts(
  key: CampaignStringKeyName
): readonly CampaignTypename[] {
  return CAMPAIGN_STRING_HOSTS[key]
}

/** The Campaign Strings a section shows, in seed order; empty for any other typename. */
export function campaignStringKeysFor(
  typename: string
): CampaignStringKeyName[] {
  return CAMPAIGN_STRING_KEYS.filter((key) =>
    (CAMPAIGN_STRING_HOSTS[key] as readonly string[]).includes(typename)
  )
}

/**
 * Maps a language's bcp47 tag to its libs/locales folder. The admin's
 * `fallbackLng` (apps/journeys-admin/next-i18next.config.js) carries the same
 * map, which it cannot import; a journeys-admin spec holds the two equal.
 */
export const CAMPAIGN_LOCALE_FOLDERS: Readonly<Record<string, string>> = {
  am: 'am-ET',
  ar: 'ar-SA',
  bn: 'bn-BD',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  ja: 'ja-JP',
  ko: 'ko-KR',
  mn: 'mn-MN',
  ms: 'ms-MY',
  my: 'my-MM',
  ne: 'ne-NP',
  pt: 'pt-BR',
  ru: 'ru-RU',
  th: 'th-TH',
  tl: 'tl-PH',
  tr: 'tr-TR',
  ur: 'ur-PK',
  vi: 'vi-VN',
  zh: 'zh-Hans-CN',
  'zh-Hant': 'zh-Hant-TW'
}

/** The libs/locales folder for a bcp47 tag; null for English or an unknown tag. */
export function campaignLocaleFolder(
  bcp47: string | null | undefined
): string | null {
  if (bcp47 == null) return null
  const exact = CAMPAIGN_LOCALE_FOLDERS[bcp47]
  if (exact != null) return exact
  const primary = bcp47.split('-')[0]
  return CAMPAIGN_LOCALE_FOLDERS[primary] ?? null
}
