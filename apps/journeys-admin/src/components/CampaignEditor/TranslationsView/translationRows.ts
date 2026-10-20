import {
  CampaignTranslations_campaignTranslations as TranslationRow,
  CampaignTranslations_campaignTranslations_target as TranslationTarget
} from '../../../../__generated__/CampaignTranslations'
import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignTextSource,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'
import {
  CAMPAIGN_TEXT_FIELDS,
  isCampaignTextBlock
} from '../../../libs/useCampaignBlockTextMutation'
import type { CampaignSelection } from '../CampaignEditorProvider'
import { CAMPAIGN_SECTION_STRING_KEYS } from '../Canvas/CanvasSection'

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
 * Whether a row belongs under a filter. Needs review is the machine lines
 * the model itself flagged as guesses; Machine-translated is every machine
 * line. A person writing over a line turns it into an edited one.
 */
export function matchesFilter(
  row: Pick<TranslationRow, 'source' | 'needsReview'>,
  filter: TranslationFilter
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'needsReview':
      return row.needsReview
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

type SectionTypename = keyof typeof CAMPAIGN_SECTION_STRING_KEYS

/** The section kind whose canvas body shows a Campaign String; undefined for an unknown string. */
function stringHostTypename(
  campaign: Pick<Campaign, 'strings'>,
  stringId: string
): SectionTypename | undefined {
  const key = campaign.strings.find((string) => string.id === stringId)?.key
  if (key == null) return undefined
  return (Object.keys(CAMPAIGN_SECTION_STRING_KEYS) as SectionTypename[]).find(
    (typename) => CAMPAIGN_SECTION_STRING_KEYS[typename]?.includes(key)
  )
}

/** Where a row's text sits on the canvas: a block, a region card, or (empty) the campaign itself. */
export interface TranslationPlace {
  blockId?: string
  regionId?: string
}

/**
 * The canvas place of a row: its block, its region card, the first section
 * of the kind that shows its Campaign String, or the campaign (empty) for
 * campaign-level text and a string no section shows.
 */
export function rowPlace(
  row: Pick<TranslationRow, 'target'>,
  campaign: Pick<Campaign, 'blocks' | 'strings'>
): TranslationPlace {
  const { target } = row
  if (target.blockId != null) return { blockId: target.blockId }
  if (target.regionId != null) return { regionId: target.regionId }
  if (target.stringId != null) {
    const typename = stringHostTypename(campaign, target.stringId)
    const host = campaign.blocks.find((block) => block.__typename === typename)
    return host == null ? {} : { blockId: host.id }
  }
  return {}
}

/**
 * Whether the editor's selection is where a row's text lives: the row's
 * block, its region card, any section of the kind that shows its Campaign
 * String, or the campaign itself for campaign-level text.
 */
export function rowMatchesSelection(
  row: Pick<TranslationRow, 'target'>,
  selection: CampaignSelection,
  campaign: Pick<Campaign, 'strings'>
): boolean {
  const { target } = row
  if (target.blockId != null) return selection.block?.id === target.blockId
  if (target.regionId != null) return selection.region?.id === target.regionId
  if (target.stringId != null)
    return (
      selection.block != null &&
      selection.block.__typename ===
        stringHostTypename(campaign, target.stringId)
    )
  return selection.kind === 'campaign'
}

/**
 * Everything that decides which lines the Translations list has and what
 * they translate: each block's place and default-language text, the
 * strings, the regions' names and the campaign title. Translations are left
 * out on purpose, so a translation edit (already written into the list by
 * its own hand) never triggers a re-read that could race the write.
 */
export function campaignTextSignature(
  campaign: Pick<Campaign, 'title' | 'blocks' | 'strings' | 'regions'>
): string {
  return JSON.stringify([
    campaign.title,
    campaign.blocks.map((block) => [
      block.id,
      block.__typename,
      block.parentBlockId,
      block.parentOrder,
      block.pageId,
      block.regionId,
      isCampaignTextBlock(block)
        ? CAMPAIGN_TEXT_FIELDS[block.__typename].map(
            (field) => (block as unknown as Record<string, unknown>)[field]
          )
        : []
    ]),
    campaign.strings.map((string) => [string.id, string.key, string.value]),
    campaign.regions.map((region) => [region.id, region.name])
  ])
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
      ? {
          ...row,
          value: entry?.value ?? null,
          source: entry?.source ?? null,
          needsReview: false
        }
      : row
  )
}
