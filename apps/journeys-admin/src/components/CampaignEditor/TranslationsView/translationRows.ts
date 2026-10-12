import {
  CampaignTranslations_campaignTranslations as TranslationRow,
  CampaignTranslations_campaignTranslations_target as TranslationTarget
} from '../../../../__generated__/CampaignTranslations'
import {
  CampaignTextSource,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'

/** The Translations view's sections, in display order. */
export const TRANSLATION_GROUPS: CampaignTranslationGroup[] = [
  CampaignTranslationGroup.interface,
  CampaignTranslationGroup.landing,
  CampaignTranslationGroup.region,
  CampaignTranslationGroup.regions
]

export type TranslationFilter =
  | 'all'
  | 'needsReview'
  | 'machine'
  | 'missing'
  | 'edited'

export const TRANSLATION_FILTERS: TranslationFilter[] = [
  'all',
  'needsReview',
  'machine',
  'missing',
  'edited'
]

/**
 * Whether a row belongs under a filter. Needs review and Machine-translated
 * are the same set today: a machine entry stays "needs review" until a person
 * writes over it, which turns it into an edited one.
 */
export function matchesFilter(
  row: Pick<TranslationRow, 'source'>,
  filter: TranslationFilter
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'needsReview':
    case 'machine':
      return row.source === CampaignTextSource.machine
    case 'edited':
      return row.source === CampaignTextSource.human
    case 'missing':
      return row.source == null
  }
}

/** The id of the one row the target names. */
export function targetId(target: TranslationTarget): string {
  return (
    target.blockId ??
    target.regionId ??
    target.stringId ??
    target.campaignId ??
    ''
  )
}

export function rowKey(row: TranslationRow): string {
  return `${row.target.typename}:${targetId(row.target)}:${row.field}`
}

/** The `campaignTranslationSet` target input for a row. */
export function targetInput(target: TranslationTarget): {
  blockId?: string
  regionId?: string
  stringId?: string
  campaignId?: string
} {
  if (target.blockId != null) return { blockId: target.blockId }
  if (target.regionId != null) return { regionId: target.regionId }
  if (target.stringId != null) return { stringId: target.stringId }
  return { campaignId: target.campaignId ?? undefined }
}

interface WrittenTranslation {
  languageId: string
  value: string
  source: CampaignTextSource
}

/**
 * The row after a write: its value and source follow the field's translations
 * the API returned for `languageId`, missing when the entry was cleared.
 */
export function withWrittenTranslation(
  rows: TranslationRow[],
  written: TranslationRow,
  languageId: string,
  translations: WrittenTranslation[]
): TranslationRow[] {
  const entry = translations.find(
    (translation) => translation.languageId === languageId
  )
  return rows.map((row) =>
    rowKey(row) === rowKey(written)
      ? { ...row, value: entry?.value ?? null, source: entry?.source ?? null }
      : row
  )
}
