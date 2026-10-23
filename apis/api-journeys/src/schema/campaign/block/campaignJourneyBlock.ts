import {
  CampaignBlock as CampaignBlockRow,
  JourneyStatus as PrismaJourneyStatus,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { JourneyStatus } from '../../journey/enums/journeyStatus'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyPublicUrl
} from '../getJourneyPublicUrl'
import { isCardJourneyStatus } from '../journeyLink'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { translationsField } from './translationsField'

export interface CampaignJourneyImagePayload {
  src: string
  alt: string | null
}

/** What a journey-list card reads live from its journey at request time. */
export interface CampaignJourneyLive {
  /** The journey's live status; null once the journey is deleted. */
  status: PrismaJourneyStatus | null
  /** The journey's public address; null unless the journey is visible (published or archived). */
  url: string | null
  image: CampaignJourneyImagePayload | null
}

/** A CampaignJourneyBlock row, optionally carrying the live journey read in bulk by its caller. */
export type CampaignJourneyBlockRow = CampaignBlockRow & {
  journeyLive?: CampaignJourneyLive | null
}

/**
 * Whether a journey's live status lets visitors reach it: published or
 * archived (the journeys app still serves archived journeys), never a draft,
 * trashed or deleted one.
 */
export function isJourneyVisible(status: PrismaJourneyStatus | null): boolean {
  return status != null && isCardJourneyStatus(status)
}

const INCLUDE_JOURNEY_LIVE = {
  ...INCLUDE_JOURNEY_PUBLIC_URL,
  primaryImageBlock: true
} as const

/**
 * Read the live state of the given journeys in one query: status (null when
 * deleted), public address (visible journeys only) and primary image. A journey that
 * no longer exists has no entry.
 */
export async function loadJourneyLivesByIds(
  journeyIds: string[]
): Promise<Map<string, CampaignJourneyLive>> {
  const lives = new Map<string, CampaignJourneyLive>()
  if (journeyIds.length === 0) return lives
  const journeys = await prisma.journey.findMany({
    where: { id: { in: [...new Set(journeyIds)] } },
    include: INCLUDE_JOURNEY_LIVE
  })
  for (const journey of journeys) {
    const status = journey.deletedAt == null ? journey.status : null
    const image = journey.primaryImageBlock
    lives.set(journey.id, {
      status,
      url: isJourneyVisible(status) ? getJourneyPublicUrl(journey) : null,
      image: image?.src != null ? { src: image.src, alt: image.alt } : null
    })
  }
  return lives
}

async function resolveLive(
  block: CampaignJourneyBlockRow
): Promise<CampaignJourneyLive | null> {
  if (block.journeyLive !== undefined) return block.journeyLive
  if (block.journeyId == null) return null
  const lives = await loadJourneyLivesByIds([block.journeyId])
  return lives.get(block.journeyId) ?? null
}

export const CampaignJourneyImageRef =
  builder.objectRef<CampaignJourneyImagePayload>('CampaignJourneyImage')

builder.objectType(CampaignJourneyImageRef, {
  description:
    'The primary image of a journey as a journey-list card shows it: its address and alt text, nothing that leads back to the journey.',
  fields: (t) => ({
    src: t.exposeString('src', { nullable: false }),
    alt: t.exposeString('alt', { nullable: true })
  })
})

export const CampaignJourneyBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignJourneyBlock',
  interfaces: [CampaignBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignJourneyBlock'),
  description:
    'A journey-list item: one published journey of any team shown as a card. `title` and `description` are an editable snapshot taken when the journey was picked (the default-language values, translatable); the status, address and image are read live from the journey, with no snapshot of its tag.',
  fields: (t) => ({
    journeyId: t.exposeID('journeyId', {
      nullable: true,
      description:
        'The linked journey. Null only if the row predates the link; never exposes the journey itself.'
    }),
    title: t.exposeString('title', {
      nullable: true,
      description:
        "Snapshot of the journey's title, editable; the default-language value."
    }),
    snapshotEdited: t.exposeBoolean('snapshotEdited', {
      nullable: false,
      description:
        'True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.'
    }),
    titleTranslations: translationsField(t, 'title'),
    description: t.exposeString('description', {
      nullable: true,
      description:
        "Snapshot of the journey's description, editable; the default-language value."
    }),
    descriptionTranslations: translationsField(t, 'description'),
    journeyStatus: t.field({
      type: JourneyStatus,
      nullable: true,
      description:
        'The journey’s live status, read at request time; null when the journey was deleted. The public page shows a card only while this is `published` or `archived`.',
      resolve: async (block) =>
        (await resolveLive(block as CampaignJourneyBlockRow))?.status ?? null
    }),
    journeyUrl: t.string({
      nullable: true,
      description:
        "The journey's public address, decided by its own team's domains; null unless the journey is published or archived.",
      resolve: async (block) =>
        (await resolveLive(block as CampaignJourneyBlockRow))?.url ?? null
    }),
    journeyImage: t.field({
      type: CampaignJourneyImageRef,
      nullable: true,
      description:
        "The journey's primary image, read live; null when it has none.",
      resolve: async (block) =>
        (await resolveLive(block as CampaignJourneyBlockRow))?.image ?? null
    })
  })
})
