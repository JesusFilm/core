import { GraphQLError } from 'graphql'

import {
  CampaignBlock,
  CampaignRegion,
  CampaignString,
  CampaignStringKey,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from '../campaign.acl'
import { CampaignTextSource } from '../enums'
import { TranslationsJson } from '../translatedValue'
import { badUserInput } from '../validation'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextField,
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './campaignTextField'

export type CampaignTranslationFilterValue =
  | 'all'
  | 'needsReview'
  | 'missing'
  | 'edited'

export type CampaignTranslationGroupValue =
  | 'interface'
  | 'landing'
  | 'region'
  | 'regions'

export const CampaignTranslationFilter = builder.enumType(
  'CampaignTranslationFilter',
  {
    values: ['all', 'needsReview', 'missing', 'edited'] as const,
    description:
      'Which rows `campaignTranslations` returns: `all`; `needsReview` (written by the machine, not yet touched by a person); `missing` (no entry in the language); `edited` (written by a person).'
  }
)

export const CampaignTranslationGroup = builder.enumType(
  'CampaignTranslationGroup',
  {
    values: ['interface', 'landing', 'region', 'regions'] as const,
    description:
      'The Translations view section a row belongs to: `interface` (Campaign Strings, header and footer text, the campaign title), `landing` (landing page sections), `region` (Region Page sections) or `regions` (each Campaign Region’s name and Region Lines).'
  }
)

interface CampaignTranslationTargetShape {
  typename: string
  blockId: string | null
  regionId: string | null
  stringId: string | null
  campaignId: string | null
}

interface CampaignTranslationRowShape {
  target: CampaignTranslationTargetShape
  group: CampaignTranslationGroupValue
  field: CampaignTextFieldName
  maxLength: number
  defaultValue: string
  value: string | null
  source: 'human' | 'machine' | null
}

const CampaignTranslationTargetRef =
  builder.objectRef<CampaignTranslationTargetShape>('CampaignTranslationTarget')

builder.objectType(CampaignTranslationTargetRef, {
  description:
    'The row a Translated Field belongs to, in the shape `campaignTranslationSet` takes: exactly one of `blockId`, `regionId`, `stringId` or `campaignId` is set.',
  fields: (t) => ({
    typename: t.exposeString('typename', {
      nullable: false,
      description:
        'The block typename (`CampaignHeroBlock`, …), or `CampaignRegion`, `CampaignString` or `Campaign`.'
    }),
    blockId: t.exposeID('blockId', { nullable: true }),
    regionId: t.exposeID('regionId', { nullable: true }),
    stringId: t.exposeID('stringId', { nullable: true }),
    campaignId: t.exposeID('campaignId', { nullable: true })
  })
})

const CampaignTranslationRowRef =
  builder.objectRef<CampaignTranslationRowShape>('CampaignTranslation')

builder.objectType(CampaignTranslationRowRef, {
  description:
    'One line of the Translations view: a Translated Field, its default-language text and its text in the requested language.',
  fields: (t) => ({
    target: t.field({
      type: CampaignTranslationTargetRef,
      nullable: false,
      resolve: (row) => row.target
    }),
    group: t.field({
      type: CampaignTranslationGroup,
      nullable: false,
      resolve: (row) => row.group
    }),
    field: t.field({
      type: CampaignTextField,
      nullable: false,
      resolve: (row) => row.field
    }),
    maxLength: t.exposeInt('maxLength', {
      nullable: false,
      description: 'The field’s cap on this target, in characters.'
    }),
    defaultValue: t.exposeString('defaultValue', {
      nullable: false,
      description: 'The text in the campaign’s default language.'
    }),
    value: t.exposeString('value', {
      nullable: true,
      description: 'The text in the requested language; null when missing.'
    }),
    source: t.field({
      type: CampaignTextSource,
      nullable: true,
      description:
        'Who wrote `value`: a person (`human`) or the machine; null when missing.',
      resolve: (row) => row.source
    })
  })
})

const INCLUDE_TRANSLATIONS_CAMPAIGN = {
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
): { value: string; source: 'human' | 'machine' } | null {
  if (
    translations == null ||
    typeof translations !== 'object' ||
    Array.isArray(translations)
  )
    return null
  const entry = (translations as TranslationsJson)[languageId]
  if (entry == null || typeof entry.value !== 'string' || entry.value === '')
    return null
  return { value: entry.value, source: entry.source }
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
        source: entry?.source ?? null
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

/** Sections in order, each followed by its children in order. */
function inReadingOrder(blocks: CampaignBlock[]): CampaignBlock[] {
  const childrenOf = (id: string): CampaignBlock[] =>
    blocks.filter((block) => block.parentBlockId === id).sort(byParentOrder)
  const ids = new Set(blocks.map((block) => block.id))
  return blocks
    .filter(
      (block) => block.parentBlockId == null || !ids.has(block.parentBlockId)
    )
    .sort(byParentOrder)
    .flatMap((section) => [section, ...childrenOf(section.id)])
}

function blockSource(
  block: CampaignBlock,
  group: CampaignTranslationGroupValue
): RowSource {
  return {
    target: {
      typename: block.typename,
      blockId: block.id,
      regionId: null,
      stringId: null,
      campaignId: null
    },
    group,
    caps: CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {},
    record: block
  }
}

function stringSource(string: CampaignString): RowSource {
  return {
    target: {
      typename: 'CampaignString',
      blockId: null,
      regionId: null,
      stringId: string.id,
      campaignId: null
    },
    group: 'interface',
    caps: CAMPAIGN_STRING_TEXT_FIELDS,
    record: string
  }
}

function regionSource(region: CampaignRegion): RowSource {
  return {
    target: {
      typename: 'CampaignRegion',
      blockId: null,
      regionId: region.id,
      stringId: null,
      campaignId: null
    },
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
 * order, each section followed by its extras.
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
      target: {
        typename: 'Campaign',
        blockId: null,
        regionId: null,
        stringId: null,
        campaignId: campaign.id
      },
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

export function matchesTranslationFilter(
  row: Pick<CampaignTranslationRowShape, 'source'>,
  filter: CampaignTranslationFilterValue
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'needsReview':
      return row.source === 'machine'
    case 'edited':
      return row.source === 'human'
    case 'missing':
      return row.source == null
  }
}

builder.queryField('campaignTranslations', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    description:
      'The Translations view of one campaign language: every Translated Field that has default-language text, with its text in `languageId`. Each row says who wrote it: `needsReview` is the machine’s, `edited` is a person’s, `missing` has no entry. Rows come in the view’s order (Interface, Landing page, Region page, Regions); `group` names the section.\n\nAuth: campaign Read — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not a campaign language, or the default language, whose text is the field itself.',
    type: [CampaignTranslationRowRef],
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      languageId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({
        type: CampaignTranslationFilter,
        required: false,
        defaultValue: 'all'
      })
    },
    resolve: async (_parent, args, context) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: String(args.campaignId) },
        include: INCLUDE_TRANSLATIONS_CAMPAIGN
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Read, campaign, context.user))
        throw new GraphQLError('user is not allowed to view campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      const languageId = String(args.languageId)
      if (
        languageId === campaign.defaultLanguageId ||
        !campaign.languages.some(
          (language) => language.languageId === languageId
        )
      )
        throw badUserInput(
          'languageId must be a campaign language other than the default',
          'languageId'
        )

      const filter = args.filter ?? 'all'
      return campaignTranslationRows(campaign, languageId).filter((row) =>
        matchesTranslationFilter(row, filter)
      )
    }
  })
)
