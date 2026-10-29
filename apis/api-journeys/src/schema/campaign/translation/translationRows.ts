import {
  entrySource,
  isTranslated,
  isUncertain
} from '@core/journeys/ui/Campaign/libs/translatedField'
import {
  CampaignBlock,
  CampaignRegion,
  CampaignString,
  CampaignStringKey,
  Prisma
} from '@core/prisma/journeys/client'

import { INCLUDE_CAMPAIGN_ACL } from '../campaign.acl'
import {
  type CampaignTextSourceValue,
  type CampaignTranslationGroupValue
} from '../enums'
import { parseTranslations } from '../translatedValue'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './textFields'
import { TranslationTargetKind } from './translationTarget'

/**
 * The row a Translated Field belongs to: which table and which id, plus the
 * typename the Translations view shows (a block's own, else the table's).
 */
export interface CampaignTranslationTargetShape {
  typename: string
  kind: TranslationTargetKind
  id: string
}

export interface CampaignTranslationRowShape {
  target: CampaignTranslationTargetShape
  group: CampaignTranslationGroupValue
  field: CampaignTextFieldName
  maxLength: number
  defaultValue: string
  value: string | null
  source: CampaignTextSourceValue | null
  /** The machine wrote `value` and flagged it as a guess; a person's rewrite clears it. */
  needsReview: boolean
}

export const INCLUDE_TRANSLATIONS_CAMPAIGN = {
  ...INCLUDE_CAMPAIGN_ACL,
  languages: true,
  pages: true,
  blocks: { where: { deletedAt: null } },
  regions: { orderBy: { order: 'asc' } },
  strings: true
} satisfies Prisma.CampaignInclude

type TranslationsCampaign = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_TRANSLATIONS_CAMPAIGN
}>

function entryOf(
  translations: unknown,
  languageId: string
): {
  value: string
  source: CampaignTextSourceValue
  uncertain: boolean
} | null {
  const entry = parseTranslations(translations)[languageId]
  if (!isTranslated(entry)) return null
  return {
    value: entry.value,
    source: entrySource(entry),
    uncertain: isUncertain(entry)
  }
}

interface RowSource {
  target: CampaignTranslationTargetShape
  group: CampaignTranslationGroupValue
  caps: CampaignTextFieldCaps
  record: Record<string, unknown>
}

/** One row per translatable field with default-language text; empty fields have nothing to translate. */
function rowsOf(
  source: RowSource,
  languageId: string
): CampaignTranslationRowShape[] {
  return (Object.entries(source.caps) as Array<[CampaignTextFieldName, number]>)
    .map(([field, maxLength]) => {
      const defaultValue = source.record[field]
      if (typeof defaultValue !== 'string' || defaultValue.trim() === '')
        return null
      const entry = entryOf(
        source.record[translationsColumn(field)],
        languageId
      )
      return {
        target: source.target,
        group: source.group,
        field,
        maxLength,
        defaultValue,
        value: entry?.value ?? null,
        source: entry?.source ?? null,
        needsReview: entry?.uncertain ?? false
      }
    })
    .filter((row): row is CampaignTranslationRowShape => row != null)
}

function byParentOrder(
  a: Pick<CampaignBlock, 'parentOrder'>,
  b: Pick<CampaignBlock, 'parentOrder'>
): number {
  return (a.parentOrder ?? 0) - (b.parentOrder ?? 0)
}

/**
 * Sections in order, depth first: each block followed by its children in
 * order, each child by its own children (a Columns section → its Column Slots
 * → the section in each slot → that section's extras). A block whose parent is
 * not live (deleting a section only stamps the section) sits on no visible
 * page, so it is dropped rather than promoted to a section.
 */
function inReadingOrder(blocks: CampaignBlock[]): CampaignBlock[] {
  const childrenOf = new Map<string, CampaignBlock[]>()
  for (const block of blocks) {
    if (block.parentBlockId == null) continue
    const siblings = childrenOf.get(block.parentBlockId) ?? []
    siblings.push(block)
    childrenOf.set(block.parentBlockId, siblings)
  }
  const withDescendants = (block: CampaignBlock): CampaignBlock[] => [
    block,
    ...[...(childrenOf.get(block.id) ?? [])]
      .sort(byParentOrder)
      .flatMap(withDescendants)
  ]
  return blocks
    .filter((block) => block.parentBlockId == null)
    .sort(byParentOrder)
    .flatMap(withDescendants)
}

function blockSource(
  block: CampaignBlock,
  group: CampaignTranslationGroupValue
): RowSource {
  return {
    target: { typename: block.typename, kind: 'block', id: block.id },
    group,
    caps: CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {},
    record: block
  }
}

function stringSource(string: CampaignString): RowSource {
  return {
    target: { typename: 'CampaignString', kind: 'string', id: string.id },
    group: 'interface',
    caps: CAMPAIGN_STRING_TEXT_FIELDS,
    record: string
  }
}

function regionSource(region: CampaignRegion): RowSource {
  return {
    target: { typename: 'CampaignRegion', kind: 'region', id: region.id },
    group: 'regions',
    caps: CAMPAIGN_REGION_TEXT_FIELDS,
    record: region
  }
}

/**
 * Every Translated Field of the campaign with its default-language text, in
 * the Translations view's order: Interface (the campaign title, Campaign
 * Strings, then header and footer text), Landing page, Region page, then each
 * Region's name followed by its Region Lines. Blocks are read in section
 * order, each section followed by everything nested in it (extras, and the
 * sections in a Columns section's slots with their own extras).
 */
export function campaignTranslationRows(
  campaign: Pick<TranslationsCampaign, 'id' | 'pages'> & {
    strings: CampaignString[]
    regions: CampaignRegion[]
    blocks: CampaignBlock[]
    title: string
    titleTranslations: unknown
  },
  languageId: string
): CampaignTranslationRowShape[] {
  const pageKindOf = new Map(campaign.pages.map((page) => [page.id, page.kind]))
  const chrome = inReadingOrder(
    campaign.blocks.filter(
      (block) => block.pageId == null && block.regionId == null
    )
  )
  const pageBlocks = (kind: 'landing' | 'regionTemplate'): CampaignBlock[] =>
    inReadingOrder(
      campaign.blocks.filter(
        (block) =>
          block.regionId == null && pageKindOf.get(block.pageId ?? '') === kind
      )
    )
  const stringKeys = Object.values(CampaignStringKey)
  const strings = [...campaign.strings].sort(
    (a, b) => stringKeys.indexOf(a.key) - stringKeys.indexOf(b.key)
  )

  const sources: RowSource[] = [
    {
      target: { typename: 'Campaign', kind: 'campaign', id: campaign.id },
      group: 'interface',
      caps: CAMPAIGN_TITLE_TEXT_FIELDS,
      record: campaign
    },
    ...strings.map(stringSource),
    ...chrome.map((block) => blockSource(block, 'interface')),
    ...pageBlocks('landing').map((block) => blockSource(block, 'landing')),
    ...pageBlocks('regionTemplate').map((block) =>
      blockSource(block, 'region')
    ),
    ...campaign.regions.flatMap((region) => [
      regionSource(region),
      ...campaign.blocks
        .filter((block) => block.regionId === region.id)
        .sort(byParentOrder)
        .map((block) => blockSource(block, 'regions'))
    ])
  ]
  return sources.flatMap((source) => rowsOf(source, languageId))
}
