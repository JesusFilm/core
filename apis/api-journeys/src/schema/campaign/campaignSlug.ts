import { customAlphabet } from 'nanoid'
import slugify from 'slugify'

import { prisma } from '@core/prisma/journeys/client'

import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError
} from '../templateGalleryPage/generateUniqueSlug'

// Lowercase + digits only — `_` from the default nanoid alphabet would fail
// SLUG_PATTERN and make the campaign unreachable by slug.
const slugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

/**
 * Generate a unique slug for a Campaign from a title. Same algorithm as the
 * TemplateGalleryPage generator (shared constants/errors), but campaigns live
 * in their own slug namespace so collisions are checked against `Campaign`.
 *
 * Caller is responsible for catching P2002 from the subsequent INSERT and
 * retrying once (TOCTOU window). The DB unique index is the backstop.
 */
export async function generateUniqueCampaignSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const normalized = slugify(title, { lower: true, strict: true })
  if (normalized === '' || RESERVED_SLUGS.has(normalized)) {
    throw new SlugReservedError(normalized === '' ? '(empty)' : normalized)
  }
  const base = normalized.slice(0, SLUG_MAX_LENGTH)

  const collisions = await prisma.campaign.findMany({
    where: { slug: { startsWith: base } },
    select: { id: true, slug: true }
  })
  const taken = new Set(
    collisions.filter((c) => c.id !== excludeId).map((c) => c.slug)
  )

  if (!taken.has(base)) return base
  for (let suffix = 2; suffix <= 50; suffix++) {
    const suffixPart = `-${suffix}`
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffixPart.length)}${suffixPart}`
    if (!taken.has(candidate)) return candidate
  }
  const randomSuffix = `-${slugSuffix()}`
  return `${base.slice(0, SLUG_MAX_LENGTH - randomSuffix.length)}${randomSuffix}`
}

/**
 * Validate a user-supplied slug (campaignUpdate). Normalizes via slugify, then
 * enforces shape, reserved list, and uniqueness against every campaign except
 * the one being updated.
 */
export async function validateUserSuppliedCampaignSlug(
  rawSlug: string,
  excludeId: string
): Promise<string> {
  const slug = slugify(rawSlug, { lower: true, strict: true })
  if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
    throw new SlugInvalidError()
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new SlugReservedError(slug)
  }
  const existing = await prisma.campaign.findFirst({
    where: { slug, NOT: { id: excludeId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}
