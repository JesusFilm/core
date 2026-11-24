import slugify from 'slugify'

import { VIEWER_RESERVED_SEGMENTS } from '@core/journeys/ui/Campaign/libs/viewerReservedSegments'
import { Prisma, prisma } from '@core/prisma/journeys/client'

import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError,
  firstFreeSlug,
  slugBase
} from '../templateGalleryPage/generateUniqueSlug'

import { badUserInput } from './errors'

/*
 * Campaign and region slugs (GLOSSARY.md: Campaign Address, Campaign Region).
 * Campaign slugs are globally unique; region slugs are unique per campaign and
 * additionally reserve the first path segments the viewer owns on a domain
 * root.
 */

export { RESERVED_SLUGS, SLUG_MAX_LENGTH, SLUG_PATTERN }

export const REGION_RESERVED_SLUGS: ReadonlySet<string> = new Set([
  ...RESERVED_SLUGS,
  ...VIEWER_RESERVED_SEGMENTS
])

function normalizeAuthorSlug(
  rawSlug: string,
  reserved: ReadonlySet<string>
): string {
  const slug = slugify(rawSlug, { lower: true, strict: true })
  if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH)
    throw new SlugInvalidError()
  if (reserved.has(slug)) throw new SlugReservedError(slug)
  return slug
}

/**
 * Generate a globally unique campaign slug from the title: slugify lower
 * strict, then the first free of `base`, `base-2` … `base-50`, then a nanoid
 * suffix.
 */
export async function generateUniqueCampaignSlug(
  title: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const base = slugBase(title, RESERVED_SLUGS)
  const collisions = await tx.campaign.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  })
  return firstFreeSlug(
    base,
    new Set(collisions.map((campaign) => campaign.slug))
  )
}

/** Validate an author-edited campaign slug: shape, reserved list, global uniqueness. */
export async function validateCampaignSlug(
  rawSlug: string,
  excludeId: string
): Promise<string> {
  const slug = normalizeAuthorSlug(rawSlug, RESERVED_SLUGS)
  const existing = await prisma.campaign.findFirst({
    where: { slug, NOT: { id: excludeId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}

/**
 * Generate a region slug from the name, unique within the campaign and free
 * of the team's live journeys: on a Custom Domain a region slug outranks a
 * journey slug (`assertRegionSlugFreeOfJourneys`), so a journey's slug counts
 * as taken.
 */
export async function generateUniqueRegionSlug(
  campaign: { id: string; teamId: string },
  name: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const base = slugBase(name, REGION_RESERVED_SLUGS)
  const regions = await tx.campaignRegion.findMany({
    where: { campaignId: campaign.id, slug: { startsWith: base } },
    select: { slug: true }
  })
  const journeys = await tx.journey.findMany({
    where: {
      teamId: campaign.teamId,
      slug: { startsWith: base },
      deletedAt: null
    },
    select: { slug: true }
  })
  return firstFreeSlug(
    base,
    new Set([...regions, ...journeys].map((taken) => taken.slug))
  )
}

/** Validate an author-edited region slug against the campaign's other regions. */
export async function validateRegionSlug(
  campaignId: string,
  rawSlug: string,
  excludeRegionId: string
): Promise<string> {
  const slug = normalizeAuthorSlug(rawSlug, REGION_RESERVED_SLUGS)
  const existing = await prisma.campaignRegion.findFirst({
    where: { campaignId, slug, NOT: { id: excludeRegionId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}

/**
 * On a Custom Domain a region slug outranks a journey slug with the same
 * spelling, so a region may not take the address of a live journey in the
 * campaign's team: `BAD_USER_INPUT` / `slug`, naming the journey.
 */
export async function assertRegionSlugFreeOfJourneys(
  teamId: string,
  slug: string
): Promise<void> {
  const journey = await prisma.journey.findFirst({
    where: { teamId, slug, deletedAt: null },
    select: { id: true, title: true }
  })
  if (journey != null)
    throw badUserInput(
      `slug "${slug}" is already the address of the journey "${journey.title}" in this team`,
      'slug'
    )
}
