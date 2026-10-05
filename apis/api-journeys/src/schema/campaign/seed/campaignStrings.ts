import { CampaignStringKey } from '@core/prisma/journeys/client'

/** The seventeen Campaign Strings in seed order. */
export const CAMPAIGN_STRING_KEYS: readonly CampaignStringKey[] = [
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
  'videos'
]

/** Final English wording (PRD §14). */
export const CAMPAIGN_STRING_DEFAULTS: Record<CampaignStringKey, string> = {
  allRegions: 'All regions',
  step1: 'Pick a language your friend understands.',
  step2: 'Preview what they will see.',
  step2help: 'Tap through the preview like they would.',
  step3: 'Share this link with them.',
  step4: 'Or download a QR code for print.',
  copy: 'Copy link',
  copied: 'Link copied',
  downloadQr: 'Download QR code',
  open: 'Open',
  watch: 'Watch',
  openTemplate: 'Open journey',
  youtube: 'Watch on YouTube',
  totalVisitors: 'Total visitors',
  topCountry: 'Top country',
  seeAllOnWatch: 'See all on Watch',
  videos: 'videos'
}
