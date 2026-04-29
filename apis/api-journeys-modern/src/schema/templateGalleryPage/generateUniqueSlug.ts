import { GraphQLError } from 'graphql'
import { nanoid } from 'nanoid'
import slugify from 'slugify'

import { prisma } from '@core/prisma/journeys/client'

export const RESERVED_SLUGS = new Set([
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

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MAX_LENGTH = 200

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
  const base = slugify(title, { lower: true, strict: true })
  if (base === '' || RESERVED_SLUGS.has(base)) {
    throw new SlugReservedError(base === '' ? '(empty)' : base)
  }

  const collisions = await prisma.templateGalleryPage.findMany({
    where: { slug: { startsWith: base } },
    select: { id: true, slug: true }
  })
  const taken = new Set(
    collisions.filter((c) => c.id !== excludeId).map((c) => c.slug)
  )

  if (!taken.has(base)) return base
  for (let suffix = 2; suffix <= 50; suffix++) {
    const candidate = `${base}-${suffix}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base}-${nanoid(6).toLowerCase()}`
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
