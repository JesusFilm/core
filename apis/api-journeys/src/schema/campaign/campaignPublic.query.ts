import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { logger } from '../logger'

import {
  CampaignPublicBlock,
  CampaignPublicPayload,
  CampaignPublicRef,
  CampaignRegionLanguagePublicPayload,
  CampaignRegionPublicPayload
} from './campaignPublic'
import { fetchShortLink, shortLinkUrl } from './gatewayClient'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyEmbedUrl,
  getJourneyPublicUrl
} from './getJourneyPublicUrl'
import { resolveText } from './resolveText'
import { CAMPAIGN_BLOCK_TEXT_COLUMNS } from './translation/campaignTextField'
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
        include: {
          journey: { include: INCLUDE_JOURNEY_PUBLIC_URL },
          qrCode: true
        }
      },
      countries: { orderBy: { order: 'asc' } }
    }
  },
  strings: { orderBy: { key: 'asc' } }
} satisfies Prisma.CampaignInclude

type CampaignPublicRow = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_PUBLIC
}>

type CampaignPublicRegionLanguageRow =
  CampaignPublicRow['regions'][number]['languages'][number]

/** The Share Link of every region language with a live-published journey, by short link id. */
export type ShortLinkUrls = ReadonlyMap<string, string>

function isLivePublished(
  regionLanguage: CampaignPublicRegionLanguageRow
): boolean {
  const journey = regionLanguage.journey
  return (
    journey != null &&
    journey.deletedAt == null &&
    journey.status === 'published'
  )
}

/**
 * Resolve the Share Link of every live-published region language through the
 * gateway's short-link lookup, in parallel; a link the gateway no longer
 * knows, or cannot be reached for, is left out, so the language renders
 * without a Share Link rather than failing the page.
 */
export async function resolveShortLinkUrls(
  campaign: CampaignPublicRow
): Promise<ShortLinkUrls> {
  const shortLinkIds = new Set<string>()
  for (const region of campaign.regions)
    for (const regionLanguage of region.languages)
      if (isLivePublished(regionLanguage) && regionLanguage.qrCode != null)
        shortLinkIds.add(regionLanguage.qrCode.shortLinkId)

  const resolved = await Promise.all(
    [...shortLinkIds].map(
      async (id) =>
        [
          id,
          await fetchShortLink(id).catch((error) => {
            logger.error({ error, shortLinkId: id }, 'short link lookup failed')
            return null
          })
        ] as const
    )
  )
  const urls = new Map<string, string>()
  for (const [id, shortLink] of resolved)
    if (shortLink != null) urls.set(id, shortLinkUrl(shortLink))
  return urls
}

/** Every translatable text column of CampaignBlock and its translations sibling, from the `CampaignTextField` map. */
const BLOCK_TEXT_FIELDS = CAMPAIGN_BLOCK_TEXT_COLUMNS

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
  regionLanguage: CampaignPublicRegionLanguageRow,
  shortLinkUrls: ShortLinkUrls
): CampaignRegionLanguagePublicPayload {
  const journey = regionLanguage.journey
  const live =
    journey != null && journey.deletedAt == null ? journey.status : null
  const published = live === 'published' && journey != null
  const shortLinkId = regionLanguage.qrCode?.shortLinkId
  return {
    id: regionLanguage.id,
    languageId: regionLanguage.languageId,
    order: regionLanguage.order,
    journeyStatus: live,
    shortLinkUrl:
      published && shortLinkId != null
        ? (shortLinkUrls.get(shortLinkId) ?? null)
        : null,
    journeyUrl: published ? getJourneyPublicUrl(journey) : null,
    embedUrl: published ? getJourneyEmbedUrl(journey) : null
  }
}

/**
 * Project one published campaign row into the public payload: text resolved
 * to `languageId`, blocks partitioned by page / chrome / region, each
 * region language carrying its resolved Share Link.
 */
export function toCampaignPublic(
  campaign: CampaignPublicRow,
  requestedLanguageId: string | null | undefined,
  shortLinkUrls: ShortLinkUrls = new Map()
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
      languages: region.languages.map((regionLanguage) =>
        toRegionLanguage(regionLanguage, shortLinkUrls)
      ),
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
// `withAuth`, and `status: published` is the only gate. The `hostname` key is
// accepted now; it resolves through a Custom Domain's Campaign Root once that
// column lands (Campaign Root ticket) and is NOT_FOUND until then.
builder.queryField('campaignPublic', (t) =>
  t.field({
    description:
      'Public, unauthenticated read of a published Campaign for the public page: exactly one of `slug` (the root-domain address) or `hostname` (a Custom Domain whose Campaign Root it is), plus the Page Language to resolve every text field to (null = the campaign default). `status: published` is the only gate.\n\nErrors:\n- BAD_USER_INPUT: both or neither of `slug` and `hostname` given.\n- NOT_FOUND: no published campaign at that key (draft, unknown, or malformed slug).',
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

      if (slug != null) {
        // Reject malformed slugs before the database, as the gallery does.
        if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH)
          throw notFound()
        const campaign = await prisma.campaign.findFirst({
          where: { slug, status: 'published' },
          include: INCLUDE_CAMPAIGN_PUBLIC
        })
        if (campaign == null) throw notFound()
        return toCampaignPublic(
          campaign,
          args.languageId == null ? null : String(args.languageId),
          await resolveShortLinkUrls(campaign)
        )
      }

      throw notFound()
    }
  })
)
