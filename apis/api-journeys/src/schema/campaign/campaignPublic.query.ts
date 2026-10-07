import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import {
  CampaignPublicBlock,
  CampaignPublicPayload,
  CampaignPublicRef,
  CampaignRegionLanguagePublicPayload,
  CampaignRegionPublicPayload
} from './campaignPublic'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyEmbedUrl,
  getJourneyPublicUrl
} from './getJourneyPublicUrl'
import { resolveText } from './resolveText'
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './validation'

const INCLUDE_CAMPAIGN_PUBLIC = {
  languages: { orderBy: { order: 'asc' } },
  theme: true,
  pages: { orderBy: { kind: 'asc' } },
  blocks: {
    where: { deletedAt: null },
    orderBy: [{ parentOrder: 'asc' }, { id: 'asc' }],
    include: { action: true }
  },
  regions: {
    orderBy: { order: 'asc' },
    include: {
      languages: {
        orderBy: { order: 'asc' },
        include: { journey: { include: INCLUDE_JOURNEY_PUBLIC_URL } }
      },
      countries: { orderBy: { order: 'asc' } }
    }
  },
  strings: { orderBy: { key: 'asc' } },
  customDomains: { orderBy: { name: 'asc' }, select: { name: true } }
} satisfies Prisma.CampaignInclude

type CampaignPublicRow = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_PUBLIC
}>

/** Every translatable text column of CampaignBlock and its translations sibling. */
const BLOCK_TEXT_FIELDS = [
  ['eyebrow', 'eyebrowTranslations'],
  ['title', 'titleTranslations'],
  ['lede', 'ledeTranslations'],
  ['bullets', 'bulletsTranslations'],
  ['content', 'contentTranslations'],
  ['intro', 'introTranslations'],
  ['label', 'labelTranslations'],
  ['alt', 'altTranslations'],
  ['description', 'descriptionTranslations']
] as const

function notFound(): GraphQLError {
  return new GraphQLError('campaign not found', {
    extensions: { code: 'NOT_FOUND' }
  })
}

/** Resolve every text column of a block to `languageId` and drop its translations. */
function resolveBlockText(
  block: CampaignPublicBlock,
  languageId: string
): CampaignPublicBlock {
  const resolved: CampaignPublicBlock = { ...block }
  for (const [field, translations] of BLOCK_TEXT_FIELDS) {
    if (block[field] == null && block[translations] == null) continue
    resolved[field] = resolveText(block[field], block[translations], languageId)
    resolved[translations] = null
  }
  return resolved
}

function toRegionLanguage(
  regionLanguage: CampaignPublicRow['regions'][number]['languages'][number]
): CampaignRegionLanguagePublicPayload {
  const journey = regionLanguage.journey
  const live =
    journey != null && journey.deletedAt == null ? journey.status : null
  const published = live === 'published' && journey != null
  return {
    id: regionLanguage.id,
    languageId: regionLanguage.languageId,
    order: regionLanguage.order,
    journeyStatus: live,
    journeyUrl: published ? getJourneyPublicUrl(journey) : null,
    embedUrl: published ? getJourneyEmbedUrl(journey) : null
  }
}

/**
 * Project one published campaign row into the public payload: text resolved
 * to `languageId`, blocks partitioned by page / chrome / region.
 */
export function toCampaignPublic(
  campaign: CampaignPublicRow,
  requestedLanguageId: string | null | undefined
): CampaignPublicPayload {
  const languageId =
    requestedLanguageId != null &&
    campaign.languages.some(
      (language) => language.languageId === requestedLanguageId
    )
      ? requestedLanguageId
      : campaign.defaultLanguageId

  const blocks = campaign.blocks.map((block) =>
    resolveBlockText(block, languageId)
  )
  const chrome = blocks.filter(
    (block) => block.pageId == null && block.regionId == null
  )
  const header = chrome.find(
    (block) => block.typename === 'CampaignHeaderBlock'
  )
  const footer = chrome.find(
    (block) => block.typename === 'CampaignFooterBlock'
  )
  if (header == null || footer == null) throw notFound()

  const regions: CampaignRegionPublicPayload[] = campaign.regions.map(
    (region) => ({
      id: region.id,
      slug: region.slug,
      name: resolveText(region.name, region.nameTranslations, languageId),
      listed: region.listed,
      order: region.order,
      countries: region.countries,
      languages: region.languages.map(toRegionLanguage),
      lines: blocks.filter((block) => block.regionId === region.id)
    })
  )

  return {
    id: campaign.id,
    teamId: campaign.teamId,
    slug: campaign.slug,
    title: resolveText(campaign.title, campaign.titleTranslations, languageId),
    defaultLanguageId: campaign.defaultLanguageId,
    languageId,
    publishedAt: campaign.publishedAt,
    languages: campaign.languages,
    theme:
      campaign.theme ??
      (() => {
        throw notFound()
      })(),
    strings: campaign.strings.map((string) => ({
      ...string,
      value: resolveText(string.value, string.valueTranslations, languageId),
      valueTranslations: {}
    })),
    regions,
    customDomainNames: campaign.customDomains.map(({ name }) => name),
    header,
    footer,
    chrome,
    pages: campaign.pages.map((page) => ({
      id: page.id,
      kind: page.kind,
      blocks: blocks.filter((block) => block.pageId === page.id)
    }))
  }
}

// Public, unauthenticated query mirroring `templateGalleryPageBySlug`: no
// `withAuth`, and `status: published` is the only gate. The `hostname` key
// resolves through a Custom Domain's Campaign Root; a draft root or no root is
// NOT_FOUND, which the route reads as "fall through to journey behaviour".
builder.queryField('campaignPublic', (t) =>
  t.field({
    description:
      'Public, unauthenticated read of a published Campaign for the public page: exactly one of `slug` (the root-domain address) or `hostname` (a Custom Domain whose Campaign Root it is), plus the Page Language to resolve every text field to (null = the campaign default). `status: published` is the only gate.\n\nErrors:\n- BAD_USER_INPUT: both or neither of `slug` and `hostname` given.\n- NOT_FOUND: no published campaign at that key (draft, unknown, or malformed slug; a hostname with no Campaign Root or a draft one).',
    type: CampaignPublicRef,
    nullable: false,
    args: {
      slug: t.arg.string({
        required: false,
        description:
          'The campaign slug; must match `^[a-z0-9]+(-[a-z0-9]+)*$` and be at most 200 characters.'
      }),
      hostname: t.arg.string({
        required: false,
        description: 'A Custom Domain name whose Campaign Root to read.'
      }),
      languageId: t.arg({
        type: 'ID',
        required: false,
        description:
          'api-languages Language id of the Page Language; a language the campaign does not have, or null, resolves to the default.'
      })
    },
    resolve: async (_parent, args) => {
      const slug = args.slug ?? null
      const hostname = args.hostname ?? null
      if ((slug == null) === (hostname == null))
        throw new GraphQLError(
          'campaignPublic takes exactly one of slug or hostname',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )

      // Reject malformed slugs before the database, as the gallery does.
      if (
        slug != null &&
        (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH)
      )
        throw notFound()

      const campaign = await prisma.campaign.findFirst({
        where:
          slug != null
            ? { slug, status: 'published' }
            : {
                status: 'published',
                customDomains: { some: { name: hostname ?? '' } }
              },
        include: INCLUDE_CAMPAIGN_PUBLIC
      })
      if (campaign == null) throw notFound()
      return toCampaignPublic(
        campaign,
        args.languageId == null ? null : String(args.languageId)
      )
    }
  })
)
