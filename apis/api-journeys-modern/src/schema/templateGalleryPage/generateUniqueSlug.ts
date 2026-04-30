import { GraphQLError } from 'graphql'
import { customAlphabet } from 'nanoid'
import slugify from 'slugify'

import { prisma } from '@core/prisma/journeys/client'

// Lowercase + digits only. Default `nanoid` includes uppercase, hyphens, and
// underscores — `_` would later fail SLUG_PATTERN and render the page
// unreachable by slug, so we restrict the alphabet up front.
const slugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'graphql',
  'health',
  'journey',
  'journeys',
  'public',
  'sign-in',
  'sign-up',
  'static',
  'templates',
  'webhook',
  'webhooks'
])

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
export const SLUG_MAX_LENGTH = 200

export class SlugReservedError extends GraphQLError {
  constructor(slug: string) {
    super(`slug "${slug}" is reserved`, {
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
  }
}

export class SlugTakenError extends GraphQLError {
  constructor() {
    super('slug already in use', {
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
  }
}

export class SlugInvalidError extends GraphQLError {
  constructor() {
    super('slug must contain only lowercase letters, numbers, and hyphens', {
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
  }
}

/**
 * Generate a unique slug for a TemplateGalleryPage from a title.
 *
 * Single SELECT to fetch all colliding slugs (cheap; bounded by team activity),
 * then picks the first non-conflicting suffix in {base, base-2, ..., base-50}.
 * Falls back to a 6-char nanoid suffix beyond 50 collisions (statistically improbable).
 *
 * Caller is responsible for catching P2002 from the subsequent INSERT and retrying
 * once if the title was the source of the slug (TOCTOU window). DB unique index
 * is the ultimate backstop.
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const normalized = slugify(title, { lower: true, strict: true })
  if (normalized === '' || RESERVED_SLUGS.has(normalized)) {
    throw new SlugReservedError(normalized === '' ? '(empty)' : normalized)
  }
  // Truncate to SLUG_MAX_LENGTH so the resulting slug never overflows the
  // public-query regex (which rejects slugs longer than 200 chars). Without
  // this, a long title would mint a slug nobody could later read back.
  const base = normalized.slice(0, SLUG_MAX_LENGTH)

  const collisions = await prisma.templateGalleryPage.findMany({
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
  // Pathological — 50 collisions on the same base. Fall back to entropy.
  const randomSuffix = `-${slugSuffix()}`
  return `${base.slice(0, SLUG_MAX_LENGTH - randomSuffix.length)}${randomSuffix}`
}

/**
 * Validate a user-supplied slug (used by templateGalleryPageUpdate when the
 * publisher edits the slug directly). Normalizes via slugify, then enforces
 * shape, reserved list, and uniqueness against all rows except the page
 * being updated.
 */
export async function validateUserSuppliedSlug(
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
  const existing = await prisma.templateGalleryPage.findFirst({
    where: { slug, NOT: { id: excludeId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}
