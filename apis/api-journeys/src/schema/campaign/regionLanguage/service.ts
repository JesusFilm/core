import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  CampaignRegionLanguage,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  createShortLink,
  deleteShortLink,
  getShortLinkDomain,
  getTo,
  updateShortLink
} from '../../qrCode/qrCode.service'
import { logger } from '../../logger'
import { touchCampaign } from '../block/service'
import { Action, campaignAcl } from '../campaign.acl'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  JourneyWithPublicUrl
} from '../getJourneyPublicUrl'
import { INCLUDE_CAMPAIGN_REGION_ACL } from '../region/service'
import { badUserInput } from '../validation'

/**
 * The Share Language service: every region language mutation is campaign
 * Update on the region's campaign, authorised through the Campaign as
 * aggregate root; the Campaign QR Code is created, retargeted and deleted
 * here, inside the same mutation as the link it belongs to (PRD §6).
 */

export const INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL = {
  region: { include: INCLUDE_CAMPAIGN_REGION_ACL },
  qrCode: true
} satisfies Prisma.CampaignRegionLanguageInclude

export type CampaignRegionLanguageWithCampaignAcl =
  Prisma.CampaignRegionLanguageGetPayload<{
    include: typeof INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL
  }>

export const JOURNEY_NOT_FOUND_MESSAGE = 'Journey not found or not published'

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

/** Update, unlink, delete and reorder of a Share Language are campaign Update on its region's campaign. */
export async function authorizeRegionLanguageUpdate(
  id: string,
  user: User
): Promise<CampaignRegionLanguageWithCampaignAcl> {
  const regionLanguage = await prisma.campaignRegionLanguage.findUnique({
    where: { id },
    include: INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL
  })
  if (regionLanguage == null) throw notFound('region language not found')
  if (!campaignAcl(Action.Update, regionLanguage.region.campaign, user))
    throw forbidden('user is not allowed to update region language')
  return regionLanguage
}

/** How a pasted journey link addresses the journey: an admin link by id, a public URL by slug. */
export type JourneyLink = { id: string } | { slug: string }

/**
 * Parse a pasted journey link: an admin link (`/journeys/<id>`), the embed
 * route (`/embed/<slug>`) or a public URL on any domain (`/<slug>`). Anything
 * that is not an http(s) URL with a path, or that names nothing, is
 * `BAD_USER_INPUT` on `url`.
 */
export function parseJourneyLink(url: string): JourneyLink {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    throw badUserInput('url must be a journey link', 'url')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
    throw badUserInput('url must be a journey link', 'url')
  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment !== '')
  const [first, second] = segments
  if (first == null) throw badUserInput('url must be a journey link', 'url')
  if (first === 'journeys' && second != null) return { id: second }
  if (first === 'embed' && second != null) return { slug: second }
  return { slug: first }
}

/**
 * Resolve a pasted link to a live-published journey of any team, with the
 * routing filter skipped (PRD §5): an unknown journey and an unpublished one
 * are the same `BAD_USER_INPUT` on `url`, never `NOT_FOUND`.
 */
export async function resolveJourneyLink(
  url: string
): Promise<JourneyWithPublicUrl> {
  const link = parseJourneyLink(url)
  const journey = await prisma.journey.findFirst({
    where: {
      ...('id' in link ? { id: link.id } : { slug: link.slug }),
      status: 'published',
      deletedAt: null
    },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(JOURNEY_NOT_FOUND_MESSAGE, 'url')
  return journey
}

/** A journey addressed by id must likewise be live-published. */
export async function resolveJourneyId(
  journeyId: string
): Promise<JourneyWithPublicUrl> {
  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, status: 'published', deletedAt: null },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null)
    throw badUserInput(JOURNEY_NOT_FOUND_MESSAGE, 'journeyId')
  return journey
}

/**
 * A short-link gateway call held back to the end of the transaction that
 * decides it, with the call that undoes it. The gateway cannot roll back with
 * the database: running the call last means a failed call rolls the
 * transaction back with nothing changed, and `revert` restores the gateway
 * should the commit itself then fail.
 */
export interface ShortLinkStep {
  apply: () => Promise<void>
  revert: () => Promise<void>
}

/**
 * Take the row lock that serialises concurrent mutations of one Share
 * Language, so a second "Use this journey" waits and re-reads `qrCodeId`
 * instead of minting a second QR row and short link.
 */
export async function lockRegionLanguage(
  tx: Prisma.TransactionClient,
  id: string
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "CampaignRegionLanguage" WHERE "id" = ${id} FOR UPDATE`
}

/**
 * Create the Campaign QR Code for a freshly linked journey: a `QrCode` row in
 * the campaign's team targeting the journey (no block, default colours),
 * written in `tx`, and the short link through the existing short-link create
 * as the returned step. Returns the QR row id and that step.
 */
export async function createRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  teamId: string,
  journeyId: string
): Promise<{ qrCodeId: string; step: ShortLinkStep }> {
  const shortLinkId = uuidv4()
  const to = await getTo({ shortLinkId, teamId, toJourneyId: journeyId })
  const qrCode = await tx.qrCode.create({
    data: { teamId, journeyId, toJourneyId: journeyId, shortLinkId }
  })
  return {
    qrCodeId: qrCode.id,
    step: {
      apply: async () => {
        await createShortLink({
          id: shortLinkId,
          hostname: getShortLinkDomain(),
          to,
          service: 'apiJourneys'
        })
      },
      revert: async () => await deleteShortLink(shortLinkId)
    }
  }
}

/**
 * Swap the journey behind an existing Campaign QR Code: the row is updated in
 * `tx` and the same short link is retargeted by the returned step, so printed
 * codes stay valid.
 */
export async function retargetRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  qrCode: { id: string; teamId: string; shortLinkId: string; toJourneyId: string },
  journeyId: string
): Promise<ShortLinkStep> {
  const to = await getTo({
    shortLinkId: qrCode.shortLinkId,
    teamId: qrCode.teamId,
    toJourneyId: journeyId
  })
  const previousTo = await getTo({
    shortLinkId: qrCode.shortLinkId,
    teamId: qrCode.teamId,
    toJourneyId: qrCode.toJourneyId
  })
  await tx.qrCode.update({
    where: { id: qrCode.id },
    data: { journeyId, toJourneyId: journeyId }
  })
  return {
    apply: async () => await updateShortLink({ id: qrCode.shortLinkId, to }),
    revert: async () =>
      await updateShortLink({ id: qrCode.shortLinkId, to: previousTo })
  }
}

/** Holds the step a transaction decides so it can be applied last and undone if the commit fails. */
export interface ShortLinkStepRunner {
  defer: (step: ShortLinkStep) => void
  /** Apply the deferred step; call it as the last statement of the transaction. */
  apply: () => Promise<void>
}

/** Run `transaction` with a step runner; if it fails after the step was applied, undo the step. */
export async function runWithShortLinkStep<T>(
  transaction: (runner: ShortLinkStepRunner) => Promise<T>
): Promise<T> {
  let deferred: ShortLinkStep | undefined
  let applied = false
  try {
    return await transaction({
      defer: (step) => {
        deferred = step
      },
      apply: async () => {
        await deferred?.apply()
        applied = deferred != null
      }
    })
  } catch (error) {
    if (applied && deferred != null)
      await deferred.revert().catch((revertError) => {
        logger.error({ error: revertError }, 'short link revert failed')
      })
    throw error
  }
}

/** Delete Campaign QR Code rows in `tx`; returns their short link ids for `deleteShortLinks` once the transaction has committed. */
export async function deleteQrCodes(
  tx: Prisma.TransactionClient,
  qrCodes: Array<{ id: string; shortLinkId: string }>
): Promise<string[]> {
  if (qrCodes.length === 0) return []
  await tx.qrCode.deleteMany({
    where: { id: { in: qrCodes.map((qrCode) => qrCode.id) } }
  })
  return qrCodes.map((qrCode) => qrCode.shortLinkId)
}

/**
 * Delete the short links of Campaign QR Codes whose rows are already gone,
 * after the transaction has committed and in parallel: a gateway failure then
 * leaves an unreachable short link, not a rolled-back delete.
 */
export async function deleteShortLinks(shortLinkIds: string[]): Promise<void> {
  const results = await Promise.allSettled(
    shortLinkIds.map(async (id) => await deleteShortLink(id))
  )
  results.forEach((result, index) => {
    if (result.status === 'rejected')
      logger.error(
        { error: result.reason, shortLinkId: shortLinkIds[index] },
        'short link delete failed'
      )
  })
}

/** Every Campaign QR Code owned by the given regions' Share Languages. */
export async function findRegionQrCodes(
  tx: Prisma.TransactionClient,
  where: Prisma.CampaignRegionLanguageWhereInput
): Promise<Array<{ id: string; shortLinkId: string }>> {
  const rows = await tx.campaignRegionLanguage.findMany({
    where: { ...where, qrCodeId: { not: null } },
    select: { qrCode: { select: { id: true, shortLinkId: true } } }
  })
  const seen = new Map<string, { id: string; shortLinkId: string }>()
  for (const row of rows)
    if (row.qrCode != null) seen.set(row.qrCode.id, row.qrCode)
  return [...seen.values()]
}

/** The region's Share Languages in selector order. */
export async function getRegionLanguages(
  regionId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegionLanguage[]> {
  return await tx.campaignRegionLanguage.findMany({
    where: { regionId },
    orderBy: { order: 'asc' }
  })
}

/** Renumber `CampaignRegionLanguage.order` contiguously from zero in the order given. */
export async function reorderRegionLanguages(
  regionLanguages: CampaignRegionLanguage[],
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegionLanguage[]> {
  return await Promise.all(
    regionLanguages.map(
      async (regionLanguage, order) =>
        await tx.campaignRegionLanguage.update({
          where: { id: regionLanguage.id },
          data: { order }
        })
    )
  )
}

/**
 * Move a Share Language to `order` among its region's languages (clamped to
 * the end) and renumber them contiguously, inside `tx`. Returns every row.
 */
export async function moveRegionLanguage(
  tx: Prisma.TransactionClient,
  regionLanguage: CampaignRegionLanguage,
  campaignId: string,
  order: number
): Promise<CampaignRegionLanguage[]> {
  const all = await getRegionLanguages(regionLanguage.regionId, tx)
  const self =
    all.find((candidate) => candidate.id === regionLanguage.id) ??
    regionLanguage
  const others = all.filter((candidate) => candidate.id !== regionLanguage.id)
  others.splice(Math.min(order, others.length), 0, self)
  const rows = await reorderRegionLanguages(others, tx)
  await touchCampaign(tx, campaignId)
  return rows
}
