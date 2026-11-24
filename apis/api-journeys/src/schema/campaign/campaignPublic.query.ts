import { isCampaignLanguage } from '@core/journeys/ui/Campaign/libs/translatedField'
import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { isJourneyVisible } from './block/campaignJourneyBlock'
import {
  CampaignPublicBlock,
  CampaignPublicPayload,
  CampaignPublicRef,
  CampaignRegionLanguagePublicPayload,
  CampaignRegionPublicPayload
} from './campaignPublic'
import { badUserInput, notFound } from './errors'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyEmbedUrl,
  getJourneyPublicUrl
} from './getJourneyPublicUrl'
import {
  JourneyLives,
  loadJourneyLivesOfBlocks,
  withJourneyLive
} from './journeyLives'
import { resolveText } from './resolveText'
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './slug'
import { forEachTextTarget } from './translation/forEachTextTarget'
import {
  type CampaignTextFieldName,
  translationsColumn
} from './translation/textFields'

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
  strings: { orderBy: { key: 'asc' } },
  customDomains: { orderBy: { name: 'asc' }, select: { name: true } }
} satisfies Prisma.CampaignInclude

type CampaignPublicRow = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_PUBLIC
}>

type CampaignPublicRegionLanguageRow =
  CampaignPublicRow['regions'][number]['languages'][number]

/**
 * Every text target of the campaign, keyed by its row, with each of its
 * Translated Fields resolved to `languageId` and that field's translations
 * dropped. A field that is null with no translations stays null.
 */
function resolveCampaignText(
  campaign: CampaignPublicRow,
  languageId: string
): Map<object, Record<string, unknown>> {
  const resolved = new Map<object, Record<string, unknown>>()
  forEachTextTarget(campaign, ({ record, fields }) => {
    const row: Record<string, unknown> = { ...record }
    for (const field of Object.keys(fields) as CampaignTextFieldName[]) {
      const translations = translationsColumn(field)
      if (row[field] == null && row[translations] == null) continue
      row[field] = resolveText(
        row[field] as string | null,
        row[translations],
        languageId,
        campaign.defaultLanguageId
      )
      row[translations] = null
    }
    resolved.set(record, row)
  })
  return resolved
}

/**
 * A Share Language as the public reads it. Only whether the linked journey is
 * live-published leaves the server: any other state (draft, archived,
 * trashed, deleted, none linked) reads as null. The Share Link is the address
 * saved on the Campaign QR Code when the journey was linked.
 */
function toRegionLanguage(
  regionLanguage: CampaignPublicRegionLanguageRow
): CampaignRegionLanguagePublicPayload {
  const journey = regionLanguage.journey
  const published =
    journey != null &&
    journey.deletedAt == null &&
    journey.status === 'published'
  return {
    id: regionLanguage.id,
    languageId: regionLanguage.languageId,
    order: regionLanguage.order,
    journeyStatus: published ? 'published' : null,
    title: published ? regionLanguage.title : null,
    shortLinkUrl: published
      ? (regionLanguage.qrCode?.shortLinkUrl ?? null)
      : null,
    journeyUrl: published ? getJourneyPublicUrl(journey) : null,
    embedUrl: published ? getJourneyEmbedUrl(journey) : null
  }
}

/**
 * Project one published campaign row into the public payload: text resolved
 * to `languageId`, blocks partitioned by page / chrome / region, each
 * Share Language carrying its saved Share Link.
 */
export function toCampaignPublic(
  campaign: CampaignPublicRow,
  requestedLanguageId: string | null | undefined,
  journeyLives: JourneyLives = new Map()
): CampaignPublicPayload {
  const theme = campaign.theme
  if (theme == null) throw notFound('campaign not found')

  const languageId =
    requestedLanguageId != null &&
    isCampaignLanguage(campaign, requestedLanguageId)
      ? requestedLanguageId
      : campaign.defaultLanguageId

  const resolved = resolveCampaignText(campaign, languageId)
  const text = <R extends object>(record: R): R =>
    (resolved.get(record) as R | undefined) ?? record

  const visibleBlocks = campaign.blocks.filter(
    (block) =>
      block.typename !== 'CampaignJourneyBlock' ||
      (block.journeyId != null &&
        isJourneyVisible(journeyLives.get(block.journeyId)?.status ?? null))
  )
  const blocks = visibleBlocks.map((block) =>
    withJourneyLive(text(block), journeyLives)
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
  if (header == null || footer == null) throw notFound('campaign not found')

  const regions: CampaignRegionPublicPayload[] = campaign.regions.map(
    (region) => ({
      id: region.id,
      slug: region.slug,
      name: text(region).name,
      listed: region.listed,
      order: region.order,
      countries: region.countries,
      languages: region.languages.map((regionLanguage) =>
        toRegionLanguage(regionLanguage)
      ),
      lines: blocks.filter((block) => block.regionId === region.id)
    })
  )

  return {
    id: campaign.id,
    teamId: campaign.teamId,
    slug: campaign.slug,
    title: text(campaign).title,
    defaultLanguageId: campaign.defaultLanguageId,
    languageId,
    publishedAt: campaign.publishedAt,
    languages: campaign.languages,
    theme,
    strings: campaign.strings.map((string) => ({
      ...text(string),
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
// resolves through a Campaign Domain; a draft campaign or a domain with no
// campaign is NOT_FOUND, which the route reads as "fall through to journey
// behaviour". A campaign with a domain is served only there, so the `slug`
// key is NOT_FOUND for it, on every host.
builder.queryField('campaignPublic', (t) =>
  t.field({
    description:
      'Public, unauthenticated read of a published Campaign for the public page: exactly one of `slug` (the root-domain address of a campaign with no Campaign Domain) or `hostname` (its Campaign Domain), plus the Page Language to resolve every text field to (null = the campaign default). `status: published` is the only gate.\n\nErrors:\n- BAD_USER_INPUT: both or neither of `slug` and `hostname` given.\n- NOT_FOUND: no published campaign at that key (draft, unknown, or malformed slug; a slug whose campaign has a Campaign Domain; a hostname that is no Campaign Domain, or whose campaign is a draft).',
    type: CampaignPublicRef,
    nullable: false,
    args: {
      slug: t.arg.string({
        required: false,
        description: `The campaign slug; must match \`${SLUG_PATTERN.source}\` and be at most ${SLUG_MAX_LENGTH} characters.`
      }),
      hostname: t.arg.string({
        required: false,
        description: 'A Campaign Domain name whose campaign to read.'
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
        throw badUserInput(
          'campaignPublic takes exactly one of slug or hostname',
          'slug'
        )

      // Reject malformed slugs before the database, as the gallery does.
      if (
        slug != null &&
        (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH)
      )
        throw notFound('campaign not found')

      const campaign = await prisma.campaign.findFirst({
        where:
          slug != null
            ? { slug, status: 'published', customDomains: { none: {} } }
            : {
                status: 'published',
                customDomains: { some: { name: hostname ?? '' } }
              },
        include: INCLUDE_CAMPAIGN_PUBLIC
      })
      if (campaign == null) throw notFound('campaign not found')
      // Cards whose journey is not visible are left out of the public payload
      // by this read at request time.
      const journeyLives = await loadJourneyLivesOfBlocks(campaign.blocks)
      return toCampaignPublic(
        campaign,
        args.languageId == null ? null : String(args.languageId),
        journeyLives
      )
    }
  })
)
